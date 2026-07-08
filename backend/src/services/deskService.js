class DeskService {
    constructor(db) {
        this.db = db;
    }

    async getAll() {

        const [rows] = await this.db.query(`
            SELECT
                id,
                desk_name,
                location,
                description,
                qr_slug,
                display_order,
                icon,
                is_gate,
                active,
                created_at
            FROM desks
            ORDER BY display_order ASC
        `);

        return rows;
    }

    async create(data) {

        const {
            desk_name,
            location,
            description,
            qr_slug,
            display_order,
            icon,
            is_gate
        } = data;

        const [result] = await this.db.query(
            `
            INSERT INTO desks
            (
                desk_name,
                location,
                description,
                qr_slug,
                display_order,
                icon,
                is_gate
            )
            VALUES (?,?,?,?,?,?,?)
            `,
            [
                desk_name,
                location,
                description,
                qr_slug,
                display_order,
                icon,
                is_gate || false
            ]
        );

        return result.insertId;
    }

    async update(id, data) {

        const {
            desk_name,
            location,
            description,
            qr_slug,
            display_order,
            icon,
            is_gate,
            active
        } = data;

        await this.db.query(
            `
            UPDATE desks
            SET
                desk_name=?,
                location=?,
                description=?,
                qr_slug=?,
                display_order=?,
                icon=?,
                is_gate=?,
                active=?
            WHERE id=?
            `,
            [
                desk_name,
                location,
                description,
                qr_slug,
                display_order,
                icon,
                is_gate,
                active,
                id
            ]
        );
    }

    async delete(id) {

        await this.db.query(
            "DELETE FROM desks WHERE id=?",
            [id]
        );
    }

    async toggleStatus(id, active) {

        await this.db.query(
            `
            UPDATE desks
            SET active=?
            WHERE id=?
            `,
            [active, id]
        );
    }

    async getReports(date) {

        const [rows] = await this.db.query(
            `
            SELECT
                d.id,
                d.desk_name,
                d.location,
                d.active,

                (
                    SELECT COUNT(*)
                    FROM students s
                    WHERE s.expected_date = ?
                ) AS expected,

                COUNT(DISTINCT l.student_id) AS checkedIn,

                (
                    (
                        SELECT COUNT(*)
                        FROM students s
                        WHERE s.expected_date = ?
                    )
                    - COUNT(DISTINCT l.student_id)
                ) AS pending,

                ROUND(
                    (
                        COUNT(DISTINCT l.student_id) /
                        NULLIF(
                            (
                                SELECT COUNT(*)
                                FROM students s
                                WHERE s.expected_date = ?
                            ),
                            0
                        )
                    ) * 100
                ) AS completion,

                MAX(l.scan_time) AS last_scan

            FROM desks d

            LEFT JOIN logs l
                ON l.desk_id = d.id
                AND DATE(l.scan_time) = ?

            GROUP BY
                d.id

            ORDER BY d.display_order
            `,
            [date, date, date, date]
        );

        return rows;
    }

    async getById(id) {

    const [rows] = await this.db.query(
        `
        SELECT *
        FROM desks
        WHERE id = ?
        `,
        [id]
    );

    return rows[0] || null;
}
async getSummary(date) {

    const [[deskStats]] = await this.db.query(`
        SELECT
            COUNT(*) AS totalDesks,
            SUM(active = TRUE) AS activeDesks
        FROM desks
    `);

    const [[studentStats]] = await this.db.query(`
    SELECT
        COUNT(*) AS expectedStudents,

        SUM(status IN ('ARRIVED','IN_PROGRESS')) AS processedStudents,

        SUM(status = 'COMPLETED') AS completedStudents

    FROM students
    WHERE expected_date = ?
`, [date]);

   const expectedStudents = Number(studentStats.expectedStudents || 0);

const processedStudents = Number(studentStats.processedStudents || 0);

const completedStudents = Number(studentStats.completedStudents || 0);

const pendingStudents = Math.max(
    expectedStudents - processedStudents - completedStudents,
    0
);

    const [deskReports] = await this.db.query(`
        SELECT
            d.id,
            d.desk_name AS name,
            d.location,

            COUNT(s.id) AS processedStudents

        FROM desks d

        LEFT JOIN students s
            ON s.current_desk_id = d.id
            AND s.expected_date = ?

        GROUP BY
            d.id,
            d.desk_name,
            d.location,
            d.display_order

        ORDER BY d.display_order
    `, [date]);

    return {

       summary: {
            totalDesks: Number(deskStats.totalDesks || 0),

            activeDesks: Number(deskStats.activeDesks || 0),

            expectedStudents,

            processedStudents,

            completedStudents,

            pendingStudents,

            avgCompletion:
                expectedStudents > 0
                    ? Math.round(
                        (completedStudents / expectedStudents) * 100
                    )
                    : 0
        },

        deskReports: deskReports.map(d => {

            const processed = Number(d.processedStudents || 0);
            const pending = Math.max(expectedStudents - processed, 0);

            return {

                id: d.id,

                name: d.name,

                location: d.location,

                expectedStudents,

                processedStudents: processed,

                pendingStudents: pending,

                completion:
                    expectedStudents > 0
                        ? Math.round((processed / expectedStudents) * 100)
                        : 0
            };

        })

    };

}
async getDeskStudents(id){


    const [rows] = await this.db.query(`

    SELECT

    s.id,

    CONCAT(
    s.first_name,
    ' ',
    s.last_name
    ) AS name,


    s.email,


    l.scan_time


    FROM students s


    LEFT JOIN logs l

    ON l.student_id=s.id

    AND l.desk_id=?


    WHERE s.current_desk_id=?


    ORDER BY l.scan_time DESC


    `,
    [
    id,
    id
    ]);


return rows;

}
/* ---------------- QR ---------------- */

async getQR(id) {

    const [rows] = await this.db.query(
        `
        SELECT
            id,
            desk_name,
            qr_slug,
            location,
            active
        FROM desks
        WHERE id = ?
        `,
        [id]
    );

    if (!rows.length) {
        return null;
    }

    const desk = rows[0];

    return {
        id: desk.id,
        name: desk.desk_name,
        location: desk.location,
        slug: desk.qr_slug,
        active: desk.active,
        url: `${process.env.FRONTEND_URL}/scan/${desk.qr_slug}`
    };
}

async getBySlug(slug) {

    const [rows] = await this.db.query(
        `
        SELECT
            id,
            desk_name,
            description,
            location,
            qr_slug,
            active,
            is_gate
        FROM desks
        WHERE qr_slug = ?
        LIMIT 1
        `,
        [slug]
    );

    return rows.length ? rows[0] : null;
}

}

module.exports = DeskService;