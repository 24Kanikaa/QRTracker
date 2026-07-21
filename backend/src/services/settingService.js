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
        const [existingUsers] = await this.db.query(
            `
            SELECT id
            FROM users
            WHERE email = ?
            LIMIT 1
            `,
            [data.email]
        );

        if (existingUsers.length > 0) {
            throw new Error("Email already used.");
        }

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

    return rows.map(row => {
        try {
            const parsedDates = JSON.parse(
                row.admission_dates || "[]"
            );

            return {
                ...row,
                admission_dates: parsedDates
            };

        } catch (error) {
            console.error(
                "❌ INVALID admission_dates JSON",
                {
                    id: row.id,
                    admission_year: row.admission_year,
                    rawValue: row.admission_dates
                }
            );

            return {
                ...row,
                admission_dates: []
            };
        }
    });
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

async syncStudents(settingsId) {
    // Get the selected onboarding/admission year
    const [settings] = await this.db.query(
        `
        SELECT id, admission_year
        FROM settings
        WHERE id = ?
        LIMIT 1
        `,
        [settingsId]
    );

    if (!settings.length) {
        throw new Error("Admission year not found.");
    }

    const setting = settings[0];

    // Fetch students from external API
    const response = await fetch(process.env.SYNC_STUDENT_ENDPOINT, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            token: process.env.SYNC_STUDENT_TOKEN,
            batch: setting.admission_year,
        }),
    });

    if (!response.ok) {
        throw new Error("Failed to fetch students from sync API.");
    }

    const data = await response.json();

    const students = Array.isArray(data)
        ? data
        : data.data || [];

    let inserted = 0;
    let updated = 0;

    for (const student of students) {

    const [existing] = await this.db.query(
        `
        SELECT id
        FROM students
        WHERE application_number = ?
        LIMIT 1
        `,
        [student.ApplicationId]
    );

    if (existing.length) {

        await this.db.query(
            `
            UPDATE students
            SET
                roll_number = ?,
                first_name = ?,
                last_name = ?,
                email = ?,
                gender = ?,
                mobile_number = ?,
                father_name = ?,
                guardian1_mobile = ?,
                mother_name = ?,
                guardian2_mobile = ?,
                state = ?,
                country = ?,
                nationality = ?,
                blood_group = ?,
                date_of_birth = ?,
                settings_id = ?
            WHERE application_number = ?
            `,
            [
                student.ERPStudentNumber,
                student.FirstName,
                student.LastName,
                student.emailaddress,
                student.Gender,
                student.MobilePhoneNumber, // updated mapping
                student.FatherName,
                student.FatherMobile,
                student.MotherName,
                student.MotherMobile,
                student.state,
                student.Country,
                student.Nationality,
                student.BloodGroup,
                student.DateOfBirth
                    ? student.DateOfBirth.substring(0, 10)
                    : null,
                settingsId,
                student.ApplicationId,
            ]
        );

        updated++;

    } else {

        await this.db.query(
            `
            INSERT INTO students (
                roll_number,
                application_number,
                first_name,
                last_name,
                email,
                gender,
                mobile_number,
                father_name,
                guardian1_mobile,
                mother_name,
                guardian2_mobile,
                state,
                country,
                nationality,
                blood_group,
                date_of_birth,
                settings_id
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
                student.ERPStudentNumber,
                student.ApplicationId,
                student.FirstName,
                student.LastName,
                student.emailaddress,
                student.Gender,
                student.MobilePhoneNumber, // updated mapping
                student.FatherName,
                student.FatherMobile,
                student.MotherName,
                student.MotherMobile,
                student.state,
                student.Country,
                student.Nationality,
                student.BloodGroup,
                student.DateOfBirth
                    ? student.DateOfBirth.substring(0, 10)
                    : null,
                settingsId,
            ]
        );

        inserted++;
    }
}

    return {
        success: true,
        total: students.length,
        inserted,
        updated,
    };
}

async syncStudentInfo(email) {
    const [rows] = await this.db.query(
        `
        SELECT
            s.id,
            s.roll_number,
            s.application_number,
            s.first_name,
            s.last_name,
            s.email,
            s.gender,
            s.mobile_number,
            s.father_name,
            s.guardian1_mobile,
            s.mother_name,
            s.guardian2_mobile,
            s.state,
            s.country,
            s.nationality,
            s.blood_group,
            s.date_of_birth,
            s.expected_date,
            s.arrival_date,
            s.status,
            s.remarks,
            st.id AS settings_id,
            st.admission_year
        FROM students s
        LEFT JOIN settings st
            ON st.id = s.settings_id
        WHERE s.email = ?
        LIMIT 1
        `,
        [email]
    );

    if (!rows.length) {
        throw new Error("Student not found.");
    }

    return rows[0];
}

async exportStudentsCSV() {

    const [students] = await this.db.query(`
        SELECT
            application_number,
            first_name,
            last_name,
            email,
            expected_date
        FROM students
        ORDER BY first_name,last_name
    `);

    let csv =
        "application_number,first_name,last_name,email,expected_date\n";

    students.forEach((student) => {

        csv += [
            student.application_number ?? "",
            student.first_name ?? "",
            student.last_name ?? "",
            student.email ?? "",
            student.expected_date
                ? new Date(student.expected_date)
                      .toISOString()
                      .slice(0, 10)
                : ""
        ].join(",");

        csv += "\n";
    });

    return csv;
}

async importStudentDates(file,userId,setting) {

    if (!file) {
        throw new Error("CSV file is required.");
    }

    const text = file.buffer.toString("utf8");

    const rows = text
        .split(/\r?\n/)
        .filter(Boolean);

    const header = rows.shift().split(",").map(h => h.trim());

    // console.log("Header:", header);

    const appIndex = header.indexOf("application_number");
    const emailIndex = header.indexOf("email");
    const expectedIndex = header.indexOf("expected_date");

    let updated = 0;
    let skipped = 0;

    for (const row of rows) {

        const cols = row.split(",");

        const applicationNumber = cols[appIndex]?.trim();
        const email = cols[emailIndex]?.trim();
        const expectedDate = cols[expectedIndex]?.trim();


        if (!expectedDate) {
            skipped++;
            continue;
        }

        const [result] = await this.db.query(
            `
            UPDATE students
            SET expected_date = ?
            WHERE application_number = ?
               OR email = ?
            `,
            [
                expectedDate,
                applicationNumber,
                email
            ]
        );


        if (result.affectedRows) {

            const [student] = await this.db.query(
                `
                SELECT application_number,email,expected_date
                FROM students
                WHERE application_number = ?
                `,
                [applicationNumber]
            );


            updated++;

        } else {

            skipped++;
        }
    }
    const totalStudents = updated + skipped;
    // console.log(setting);

    const [uploadResult] = await this.db.query(
        `
        INSERT INTO uploads (
            settings_id,
            file_name,
            uploaded_by,
            total_students,
            updated_students,
            skipped_students,
            created_by,
            updated_by
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
            setting,
            file.originalname,
            userId,
            updated + skipped,
            updated,
            skipped,
            userId,
            userId
        ]
    );
    const [[upload]] = await this.db.query(
        `
        SELECT created_at
        FROM uploads
        WHERE id = ?
        `,
        [uploadResult.insertId]
    );

    return {
        updated,
        skipped,
        lastUploadedAt: upload.created_at
    };
}

async updateStudentRemarks(studentId, remarks) {

    const [result] = await this.db.query(
        `
        UPDATE students
        SET remarks = ?
        WHERE id = ?
        `,
        [
            remarks || null,
            studentId,
        ]
    );

    if (!result.affectedRows) {
        throw new Error("Student not found.");
    }

    const [rows] = await this.db.query(
        `
        SELECT
            id,
            application_number,
            first_name,
            last_name,
            remarks
        FROM students
        WHERE id = ?
        LIMIT 1
        `,
        [studentId]
    );

    return rows[0];
}

}

module.exports = SettingService;