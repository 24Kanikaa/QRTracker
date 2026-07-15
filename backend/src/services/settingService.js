const bcrypt = require("bcryptjs");

class SettingService {
    constructor(db) {
        this.db = db;
    }

    async getUsers() {
        const [rows] = await this.db.query(`
            SELECT
                id,
                name,
                email,
                role,
                active,
                created_at,
                updated_at
            FROM users
            ORDER BY created_at DESC
        `);

        return rows;
    }

    async getUserById(id) {
        const [rows] = await this.db.query(
            `
            SELECT
                id,
                name,
                email,
                role,
                active
            FROM users
            WHERE id = ?
            `,
            [id]
        );

        return rows[0];
    }

    async createUser(data) {
        const password = await bcrypt.hash(data.password, 10);

        const [result] = await this.db.query(
            `
            INSERT INTO users
            (
                name,
                email,
                password,
                role,
                active
            )
            VALUES
            (?, ?, ?, ?, ?)
            `,
            [
                data.name,
                data.email,
                password,
                data.role || "USER",
                data.active ?? true,
            ]
        );

        return this.getUserById(result.insertId);
    }

    async updateUser(id, data) {
        const fields = [
            "name = ?",
            "email = ?",
            "role = ?",
        ];

        const values = [
            data.name,
            data.email,
            data.role,
        ];

        if (data.password) {
            const password = await bcrypt.hash(data.password, 10);

            fields.push("password = ?");
            values.push(password);
        }

        values.push(id);

        await this.db.query(
            `
            UPDATE users
            SET ${fields.join(", ")}
            WHERE id = ?
            `,
            values
        );
    }

    async updateUserStatus(id, active) {
        await this.db.query(
            `
            UPDATE users
            SET active = ?
            WHERE id = ?
            `,
            [active, id]
        );
    }

    async deleteUser(id) {
        await this.db.query(
            `
            DELETE FROM users
            WHERE id = ?
            `,
            [id]
        );
    }
    async getOnboardingSettings() {

    const [rows] = await this.db.query(`
        SELECT
            s.id,
            s.admission_year,
            s.admission_dates,
            s.active,
            s.created_at,
            u1.name AS created_by_name,
            u2.name AS updated_by_name
        FROM settings s
        LEFT JOIN users u1
            ON s.created_by = u1.id
        LEFT JOIN users u2
            ON s.updated_by = u2.id
        ORDER BY s.admission_year DESC
    `);

    return rows.map(row => ({
        ...row,
        admission_dates: JSON.parse(row.admission_dates || "[]")
    }));
}
async getOnboarding(id) {

    const [rows] = await this.db.query(`
        SELECT *
        FROM settings
        WHERE id = ?
    `,[id]);

    if(!rows.length){
        throw new Error("Onboarding not found");
    }

    rows[0].admission_dates =
        JSON.parse(rows[0].admission_dates || "[]");

    return rows[0];
}
async createOnboarding(data,userId){

    const {
        admission_year,
        admission_dates,
        active
    } = data;

    const [exists] = await this.db.query(
        `
        SELECT id
        FROM settings
        WHERE admission_year = ?
        `,
        [admission_year]
    );

    if(exists.length){
        throw new Error("Admission year already exists");
    }

    const [result] = await this.db.query(
        `
        INSERT INTO settings
        (
            admission_year,
            admission_dates,
            active,
            created_by,
            updated_by
        )
        VALUES
        (?,?,?,?,?)
        `,
        [
            admission_year,
            JSON.stringify(admission_dates),
            active,
            userId,
            userId
        ]
    );

    return result.insertId;
}
async updateOnboarding(id,data,userId){

    const {
        admission_year,
        admission_dates,
        active
    } = data;

    await this.db.query(
        `
        UPDATE settings
        SET
            admission_year = ?,
            admission_dates = ?,
            active = ?,
            updated_by = ?
        WHERE id = ?
        `,
        [
            admission_year,
            JSON.stringify(admission_dates),
            active,
            userId,
            id
        ]
    );
}

async deleteOnboarding(id){

    await this.db.query(
        `
        DELETE FROM settings
        WHERE id = ?
        `,
        [id]
    );
}
async toggleOnboardingStatus(id,userId){

    await this.db.query(
        `
        UPDATE settings
        SET
            active = !active,
            updated_by = ?
        WHERE id = ?
        `,
        [
            userId,
            id
        ]
    );

}
}

module.exports = SettingService;