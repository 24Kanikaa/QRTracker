const bcrypt = require("bcryptjs");

module.exports = async (db) => {

    // ---------- DESKS ----------

    const desks = [
        ["Gate Entry","Main Gate","Student Entry","gate-entry",1],
        ["Admission","Admission Hall","Document Verification","admission",2],
        ["Hostel","Hostel Block","Hostel Allocation","hostel",3],
        ["IT","IT Helpdesk","Email Setup","it",4],
        ["Mess","Dining Hall","Mess Registration","mess",5],
        ["Library","Library","Library Activation","library",6]
    ];

    for (const desk of desks) {

        const [exists] = await db.query(
            "SELECT id FROM desks WHERE qr_slug=?",
            [desk[3]]
        );

        if (exists.length === 0) {

            await db.query(
                `
                INSERT INTO desks
                (desk_name,location,description,qr_slug,display_order)
                VALUES (?,?,?,?,?)
                `,
                desk
            );

        }

    }

    // ---------- SUPER ADMIN ----------

    const [admin] = await db.query(
        "SELECT id FROM users WHERE email=?",
        ["superadmin@plaksha.edu.in"]
    );

    if (admin.length === 0) {

        const hash = await bcrypt.hash("admin123",10);

        await db.query(
            `
            INSERT INTO users
            (name,email,password,role)
            VALUES (?,?,?,?)
            `,
            [
                "Super Admin",
                "superadmin@plaksha.edu.in",
                hash,
                "SUPER_ADMIN"
            ]
        );

    }

    // ---------- SETTINGS ----------

    const [settings] = await db.query(
        "SELECT id FROM settings LIMIT 1"
    );

    if (settings.length === 0) {

        await db.query(
            `
            INSERT INTO settings
            (
                university_name,
                admission_year,
                admission_date
            )
            VALUES
            (
                'Plaksha University',
                '2026',
                '2026-08-01'
            )
            `
        );

    }

    console.log("✅ Seed completed");
};