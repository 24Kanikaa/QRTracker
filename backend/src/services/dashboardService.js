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



}


module.exports = DashboardService;