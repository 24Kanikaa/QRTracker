module.exports = async (db) => {

    await db.query(`
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(150) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            role ENUM('SUPER_ADMIN','ADMIN','USER') DEFAULT 'USER',
            active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                ON UPDATE CURRENT_TIMESTAMP
        );
    `);


        await db.query(`
            CREATE TABLE IF NOT EXISTS desks (

                id INT AUTO_INCREMENT PRIMARY KEY,

                desk_name VARCHAR(100) NOT NULL,

                location VARCHAR(150),

                description TEXT,

                qr_slug VARCHAR(150) UNIQUE NOT NULL,

                display_order INT DEFAULT 1,

                icon VARCHAR(100),

                is_gate BOOLEAN DEFAULT FALSE,

                active BOOLEAN DEFAULT TRUE,

                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    ON UPDATE CURRENT_TIMESTAMP
            );
        `);
                await db.query(`
        CREATE TABLE IF NOT EXISTS students (
        id INT AUTO_INCREMENT PRIMARY KEY,

        roll_number VARCHAR(30) UNIQUE,
        application_number VARCHAR(30),

        first_name VARCHAR(100),
        last_name VARCHAR(100),

        email VARCHAR(150) UNIQUE,

        gender ENUM('Male','Female','Other'),

        expected_date DATE NOT NULL,

        arrival_date DATETIME NULL,

        status ENUM(
            'EXPECTED',
            'ARRIVED',
            'IN_PROGRESS',
            'COMPLETED',
            'OVERDUE'
        ) DEFAULT 'EXPECTED',

        current_desk_id INT NULL,

        remarks TEXT,

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ON UPDATE CURRENT_TIMESTAMP,

        CONSTRAINT fk_student_current_desk
        FOREIGN KEY(current_desk_id)
        REFERENCES desks(id)
        ON DELETE SET NULL
    );`);

    await db.query(`
        CREATE TABLE IF NOT EXISTS logs (

            id INT AUTO_INCREMENT PRIMARY KEY,

            student_id INT NOT NULL,

            desk_id INT NOT NULL,

            scanned_by INT NULL,

            scan_time DATETIME DEFAULT CURRENT_TIMESTAMP,

            remarks TEXT,

            CONSTRAINT fk_log_student
                FOREIGN KEY(student_id)
                REFERENCES students(id)
                ON DELETE CASCADE,

            CONSTRAINT fk_log_desk
                FOREIGN KEY(desk_id)
                REFERENCES desks(id)
                ON DELETE CASCADE,

            CONSTRAINT fk_log_user
                FOREIGN KEY(scanned_by)
                REFERENCES users(id)
                ON DELETE SET NULL
        );

    `);
    
    await db.query(`
        CREATE TABLE IF NOT EXISTS uploads (

            id INT AUTO_INCREMENT PRIMARY KEY,

            file_name VARCHAR(255),

            uploaded_by INT,

            total_students INT,

            uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

            FOREIGN KEY(uploaded_by)
            REFERENCES users(id)
        );
    `);

    await db.query(`
        CREATE TABLE IF NOT EXISTS settings (
            id INT AUTO_INCREMENT PRIMARY KEY,
            university_name VARCHAR(150),
            admission_year VARCHAR(20),
            admission_date DATE,
            portal_status ENUM('OPEN','CLOSED') DEFAULT 'OPEN',
            qr_enabled BOOLEAN DEFAULT TRUE,
            enforce_order BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                ON UPDATE CURRENT_TIMESTAMP
        );
    `);


    console.log("✅ Tables verified");
};