const bcrypt = require("bcryptjs");

module.exports = async (db) => {

    /* =======================================================
       DESKS
    ======================================================= */

    const desks = [
        {
            desk_name: "Gate Entry",
            location: "Main Gate",
            description: "Campus Entry Verification",
            qr_slug: "gate-entry",
            display_order: 1,
            icon: "DoorOpen",
            is_gate: true
        },
        {
            desk_name: "Admission Desk",
            location: "Admission Hall",
            description: "Document Verification",
            qr_slug: "admission",
            display_order: 2,
            icon: "FileCheck"
        },
        {
            desk_name: "Hostel",
            location: "Hostel Reception",
            description: "Hostel Allocation",
            qr_slug: "hostel",
            display_order: 3,
            icon: "BedDouble"
        },
        {
            desk_name: "IT Setup",
            location: "IT Helpdesk",
            description: "Email & WiFi Setup",
            qr_slug: "it",
            display_order: 4,
            icon: "Laptop"
        },
        {
            desk_name: "Mess Registration",
            location: "Dining Hall",
            description: "Mess Registration",
            qr_slug: "mess",
            display_order: 5,
            icon: "UtensilsCrossed"
        },
        {
            desk_name: "Library",
            location: "Central Library",
            description: "Library Activation",
            qr_slug: "library",
            display_order: 6,
            icon: "LibraryBig"
        }
    ];

    for (const desk of desks) {

        const [exists] = await db.query(
            "SELECT id FROM desks WHERE qr_slug=?",
            [desk.qr_slug]
        );

        if (!exists.length) {

            await db.query(
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
                    desk.desk_name,
                    desk.location,
                    desk.description,
                    desk.qr_slug,
                    desk.display_order,
                    desk.icon,
                    desk.is_gate || false
                ]
            );

        }

    }

    /* =======================================================
       SUPER ADMIN
    ======================================================= */

    const [admin] = await db.query(
        "SELECT id FROM users WHERE email=?",
        ["superadmin@plaksha.edu.in"]
    );

    if (!admin.length) {

        const hash = await bcrypt.hash("admin123", 10);

        await db.query(
            `
             INSERT INTO users
        (
            name,
            email,
            password,
            role,
            auth_type
        )
        VALUES (?,?,?,?,?)
        `,
        [
            "super",
            "superadmin@plaksha.edu.in",
            hash,
            "ADMIN",
            "LOCAL"
        ]
        );

    }

    /* =======================================================
       SETTINGS
    ======================================================= */

const [settings] = await db.query(
    "SELECT id FROM settings LIMIT 1"
);

if (!settings.length) {

    await db.query(
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
        (
            '2026',
            JSON_ARRAY(
                CURDATE(),
                DATE_ADD(CURDATE(), INTERVAL 1 DAY),
                DATE_ADD(CURDATE(), INTERVAL 2 DAY)
            ),
            TRUE,
            NULL,
            NULL
        )
        `
    );

}

    /* =======================================================
       DUMMY STUDENTS
    ======================================================= */

    const [students] = await db.query(
        "SELECT COUNT(*) count FROM students"
    );

    if (students[0].count === 0) {

        const dummyStudents = [

            [
                "UG20260001",
                "APP001",
                "Kanika",
                "Kainthla",
                "kanika@plaksha.edu.in",
                "Female",
                "2026-08-01",
                null,
                "EXPECTED",
                null
            ],

            [
                "UG20260002",
                "APP002",
                "Rahul",
                "Sharma",
                "rahul@plaksha.edu.in",
                
                "Male",
               
                "2026-08-01",
                null,
                "EXPECTED",
                null
            ],

            [
                "UG20260003",
                "APP003",
                "Priya",
                "Singh",
                "priya@plaksha.edu.in",
                
                "Female",
            
                "2026-08-01",
                null,
                "EXPECTED",
                null
            ]

        ];

        for (const student of dummyStudents) {

            await db.query(
                `
                INSERT INTO students
                (
                    roll_number,
                    application_number,
                    first_name,
                    last_name,
                    email,
                    gender,
                    expected_date,
                    arrival_date,
                    status,
                    current_desk_id
                )
                VALUES
                (
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    ?
                )
                `,
                student
            );

        }

    }

    console.log("✅ Seed completed");

};