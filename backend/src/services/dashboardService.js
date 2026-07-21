class DashboardService {

    constructor(db) {
        this.db = db;
    }

    async getSummary(date) {

        const [[deskStats]] = await this.db.query(`

            SELECT

                COUNT(*) AS totalDesks,

                SUM(active = true) AS activeDesks

            FROM desks

        `);



        const [[studentStats]] = await this.db.query(`

            SELECT

                COUNT(*) AS expectedStudents,

                SUM(status IN ('ARRIVED','IN_PROGRESS','COMPLETED')) AS processedStudents,

                SUM(status='COMPLETED') AS completedStudents

            FROM students

            WHERE expected_date = ?

        `, [date]);



        const expectedStudents =
            Number(studentStats.expectedStudents || 0);


        const completedStudents =
            Number(studentStats.completedStudents || 0);


        const processedStudents =
            Number(studentStats.processedStudents || 0);



        const [deskReports] = await this.db.query(`

        SELECT

            d.id,

            d.desk_name AS name,

            d.location,


            COUNT(
                DISTINCT s.id
            ) AS totalStudents,


            COUNT(
                DISTINCT CASE
                    WHEN s.status='COMPLETED'
                    THEN s.id
                END
            ) AS completed,


            COUNT(
                DISTINCT CASE
                    WHEN s.status!='COMPLETED'
                    THEN s.id
                END
            ) AS pending


        FROM desks d


        LEFT JOIN students s

        ON s.current_desk_id = d.id


        GROUP BY d.id


        ORDER BY d.display_order

        `);



        return {

            summary: {

                totalDesks:
                    Number(deskStats.totalDesks || 0),


                activeDesks:
                    Number(deskStats.activeDesks || 0),


                expectedStudents,

                processedStudents,

                completedStudents,


                pendingStudents:
                    expectedStudents - completedStudents,


                avgCompletion:
                    expectedStudents
                    ?
                    Math.round(
                        (completedStudents / expectedStudents) * 100
                    )
                    :
                    0

            },


            deskReports: deskReports.map(d => ({

                id:d.id,

                name:d.name,

                location:d.location,

                totalStudents:Number(d.totalStudents || 0),

                completed:Number(d.completed || 0),

                pending:Number(d.pending || 0),

                completion:
                    d.totalStudents
                    ?
                    Math.round(
                        (d.completed / d.totalStudents) * 100
                    )
                    :
                    0

            }))


        };

    }

    async getDashboardOverview(){

        const summary = await this.getSummary(
            new Date().toISOString().split("T")[0]
        );


        return summary;

    }

    getTodayDate() {

        const now = new Date();

        const year = now.getFullYear();

        const month = String(
            now.getMonth() + 1
        ).padStart(2, "0");

        const day = String(
            now.getDate()
        ).padStart(2, "0");


        return `${year}-${month}-${day}`;
    }

    async getAdmissionDates() {

        const [[setting]] = await this.db.query(`
            SELECT admission_dates
            FROM settings
            WHERE active = '1'
            LIMIT 1
        `);


        if (!setting || !setting.admission_dates) {
            return [];
        }


        let dates = setting.admission_dates;


        if (typeof dates === "string") {
            dates = JSON.parse(dates);
        }


        return dates
            .map(date => ({
                date,
                isToday: date === this.getTodayDate()
            }))
            .sort((a, b) => a.date.localeCompare(b.date));
    }

    async getDashboardData({
        mode = "daywise",
        date = null
    } = {}) {

        const today = this.getTodayDate();

        const admissionDates = await this.getAdmissionDates();

        const activeDates = admissionDates.map(
            item => item.date
        );


        // =====================================================
        // DAYWISE
        // =====================================================

        if (mode === "daywise") {

            const selectedDate =
                date && activeDates.includes(date)
                    ? date
                    : today;


            const data =
                await this.getDaywiseDashboardData(
                    selectedDate
                );


            return {

                mode: "daywise",

                selectedDate,

                isLive: selectedDate === today,

                admissionDates,

                ...data

            };

        }


        // =====================================================
        // OVERALL
        // =====================================================

        if (mode === "overall") {

            const data =
                await this.getOverallDashboardData(
                    activeDates
                );


            return {

                mode: "overall",

                isLive: false,

                admissionDates,

                ...data

            };

        }


        throw new Error(
            "Invalid dashboard mode."
        );
    }

    formatHour(hour) {

        const suffix =
            hour >= 12
                ? "p"
                : "a";


        let displayHour =
            hour % 12;


        if (displayHour === 0) {
            displayHour = 12;
        }


        return `${displayHour}${suffix}`;
    }

    async getDaywiseDashboardData(date) {

        // -----------------------------------------------------
        // EXPECTED STUDENTS
        // -----------------------------------------------------

        const [[expectedRow]] = await this.db.query(`

            SELECT COUNT(*) AS expected

            FROM students

            WHERE expected_date = ?

        `, [date]);


        const expected =
            Number(expectedRow.expected || 0);


        // -----------------------------------------------------
        // CHECKED-IN STUDENTS
        // -----------------------------------------------------

        const [[checkedInRow]] = await this.db.query(`

            SELECT COUNT(DISTINCT student_id) AS checkedIn

            FROM logs l

            INNER JOIN students s
                ON s.id = l.student_id

            WHERE s.expected_date = ?

        `, [date]);


        const checkedIn =
            Number(checkedInRow.checkedIn || 0);


        // -----------------------------------------------------
        // COMPLETED STUDENTS
        // -----------------------------------------------------

        const [[completedRow]] = await this.db.query(`

            SELECT COUNT(*) AS completed

            FROM students

            WHERE expected_date = ?

            AND status = 'COMPLETED'

        `, [date]);


        const completed =
            Number(completedRow.completed || 0);


        // -----------------------------------------------------
        // PENDING
        // -----------------------------------------------------

        const pending =
            Math.max(
                checkedIn - completed,
                0
            );


        // -----------------------------------------------------
        // ARRIVAL FLOW
        // -----------------------------------------------------

        const [arrivalRows] = await this.db.query(`

            SELECT

                HOUR(arrival_date) AS hour,

                COUNT(*) AS arrivals

            FROM students

            WHERE expected_date = ?

            AND arrival_date IS NOT NULL

            GROUP BY HOUR(arrival_date)

            ORDER BY hour

        `, [date]);


        let cumulative = 0;


        const arrivalData =
            arrivalRows.map(row => {

                cumulative += Number(
                    row.arrivals
                );


                return {

                    hour: this.formatHour(
                        row.hour
                    ),

                    cumulative

                };

            });


        // -----------------------------------------------------
        // DESK PERFORMANCE
        // -----------------------------------------------------

        const [deskRows] = await this.db.query(`

            SELECT

                d.id,

                d.desk_name AS name,

                d.location,

                COUNT(
                    DISTINCT s.id
                ) AS expected,

                COUNT(
                    DISTINCT CASE

                        WHEN l.id IS NOT NULL

                        THEN s.id

                    END

                ) AS processed

            FROM desks d

            LEFT JOIN students s

                ON s.expected_date = ?

            LEFT JOIN logs l

                ON l.student_id = s.id

                AND l.desk_id = d.id

            WHERE d.active = 1

            GROUP BY

                d.id,

                d.desk_name,

                d.location,

                d.display_order

            ORDER BY d.display_order

        `, [date]);


        const deskPerformance =
            deskRows.map(row => {

                const deskExpected =
                    Number(row.expected || 0);


                const processed =
                    Number(row.processed || 0);


                const percentage =
                    deskExpected

                        ? Math.round(
                            processed /
                            deskExpected *
                            100
                        )

                        : 0;


                return {

                    id: row.id,

                    name: row.name,

                    location: row.location,

                    expected: deskExpected,

                    processed,

                    value: percentage

                };

            });


        // -----------------------------------------------------
        // RECENT STUDENTS
        // -----------------------------------------------------

        const recentStudents =
            await this.getDynamicRecentScans({

                date,

                limit: 10

            });


        // -----------------------------------------------------
        // OVERALL COMPLETION
        // -----------------------------------------------------

        const overallPct =
            expected

                ? Math.round(
                    completed /
                    expected *
                    100
                )

                : 0;


        return {

            stats: {

                expected: {

                    value: expected,

                    subtitle:
                        "Students registered"

                },


                checkedIn: {

                    value: checkedIn,

                    subtitle:

                        expected

                            ? `${Math.round(
                                checkedIn /
                                expected *
                                100
                            )}% of expected`

                            : "0% of expected"

                },


                completed: {

                    value: completed,

                    subtitle:
                        "Finished all desks"

                },


                waiting: {

                    value: pending,

                    subtitle:
                        "Currently in queue"

                }

            },


            arrivalData,


            overallPct,


            overallSubtitle:

                `${completed} of ${expected} fully onboarded`,


            deskPerformanceRaw:
                deskPerformance,


            recentStudents

        };

    }

    formatStudentStatus(status) {

        if (status === "COMPLETED") {
            return "Completed";
        }


        if (status === "IN_PROGRESS") {
            return "In Progress";
        }


        if (status === "ARRIVED") {
            return "Waiting";
        }


        return status;
    }

    async getDynamicRecentScans({
        date = null,
        limit = 10
    } = {}) {

        let where = "";

        const params = [];


        if (date) {

            where = `
                WHERE s.expected_date = ?
            `;

            params.push(date);

        }


        params.push(Number(limit));


        const [rows] = await this.db.query(`

            SELECT

                s.id AS student_id,

                s.first_name,

                s.email,

                d.desk_name AS desk,

                l.scan_time,

                s.status


            FROM logs l


            INNER JOIN students s

                ON s.id = l.student_id


            INNER JOIN desks d

                ON d.id = l.desk_id


            ${where}


            ORDER BY

                l.scan_time DESC


            LIMIT ?

        `, params);


        return rows.map(row => ({

            id: row.student_id,

            name: row.name,

            email: row.email,

            desk: row.desk,

            time: row.scan_time,

            status: this.formatStudentStatus(
                row.status
            )

        }));

    }

    async getOverallDashboardData(
        activeDates
    ) {

        if (!activeDates.length) {

            return {

                stats: {

                    expected: {
                        value: 0,
                        subtitle: "Students registered"
                    },

                    checkedIn: {
                        value: 0,
                        subtitle: "0% of expected"
                    },

                    completed: {
                        value: 0,
                        subtitle: "Finished all desks"
                    },

                    waiting: {
                        value: 0,
                        subtitle: "Never completed"
                    }

                },

                arrivalData: [],

                overallPct: 0,

                overallSubtitle:
                    "0 of 0 fully onboarded",

                deskPerformanceRaw: [],

                recentStudents: []

            };

        }


        const placeholders =
            activeDates.map(() => "?").join(",");


        // -----------------------------------------------------
        // STUDENT COUNTS
        // -----------------------------------------------------

        const [[stats]] = await this.db.query(`

            SELECT

                COUNT(*) AS expected,

                COUNT(
                    DISTINCT CASE

                        WHEN arrival_date IS NOT NULL

                        THEN id

                    END

                ) AS checkedIn,


                SUM(
                    status = 'COMPLETED'
                ) AS completed


            FROM students


            WHERE expected_date IN
                (${placeholders})

        `, activeDates);


        const expected =
            Number(stats.expected || 0);


        const checkedIn =
            Number(stats.checkedIn || 0);


        const completed =
            Number(stats.completed || 0);


        const waiting =
            Math.max(
                checkedIn - completed,
                0
            );


        // -----------------------------------------------------
        // DESK PERFORMANCE
        // -----------------------------------------------------

        const [deskRows] = await this.db.query(`

            SELECT

                d.id,

                d.desk_name AS name,

                COUNT(
                    DISTINCT s.id
                ) AS expected,


                COUNT(
                    DISTINCT CASE

                        WHEN l.id IS NOT NULL

                        THEN s.id

                    END

                ) AS processed


            FROM desks d


            LEFT JOIN students s

                ON s.expected_date IN
                    (${placeholders})


            LEFT JOIN logs l

                ON l.student_id = s.id

                AND l.desk_id = d.id


            WHERE d.active = 1


            GROUP BY

                d.id,

                d.desk_name,

                d.display_order


            ORDER BY d.display_order

        `, activeDates);


        const deskPerformance =
            deskRows.map(row => {

                const deskExpected =
                    Number(row.expected || 0);


                const processed =
                    Number(row.processed || 0);


                return {

                    id: row.id,

                    name: row.name,

                    expected: deskExpected,

                    processed,

                    value: deskExpected

                        ? Math.round(
                            processed /
                            deskExpected *
                            100
                        )

                        : 0

                };

            });


        const overallPct =
            expected

                ? Math.round(
                    completed /
                    expected *
                    100
                )

                : 0;


        return {

            stats: {

                expected: {

                    value: expected,

                    subtitle:
                        "Students registered"

                },


                checkedIn: {

                    value: checkedIn,

                    subtitle:
                        expected

                            ? `${Math.round(
                                checkedIn /
                                expected *
                                100
                            )}% of expected`

                            : "0% of expected"

                },


                completed: {

                    value: completed,

                    subtitle:
                        "Finished all desks"

                },


                waiting: {

                    value: waiting,

                    subtitle:
                        "Never completed"

                }

            },


            overallPct,


            overallSubtitle:

                `${completed} of ${expected} fully onboarded`,


            deskPerformanceRaw:
                deskPerformance,


            recentStudents: []

        };

    }
}


module.exports = DashboardService;