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

                COUNT(l.id) checkedIn,

                MAX(l.checked_in_at) lastScan

            FROM desks d

            LEFT JOIN logs l
            ON d.id=l.desk_id
            AND DATE(l.checked_in_at)=?

            GROUP BY d.id

            ORDER BY d.display_order
            `,
            [date]
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
}

module.exports = DeskService;