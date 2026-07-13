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
    CREATE TABLE IF NOT EXISTS settings (

        id INT AUTO_INCREMENT PRIMARY KEY,
        admission_year VARCHAR(20) UNIQUE NOT NULL,

        admission_dates JSON NOT NULL,

        active BOOLEAN DEFAULT TRUE,

        created_by INT NULL,

        updated_by INT NULL,

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ON UPDATE CURRENT_TIMESTAMP,

        FOREIGN KEY(created_by)
            REFERENCES users(id)
            ON DELETE SET NULL,

        FOREIGN KEY(updated_by)
            REFERENCES users(id)
            ON DELETE SET NULL
    );
`);
    
    await db.query(`
    CREATE TABLE IF NOT EXISTS uploads (

        id INT AUTO_INCREMENT PRIMARY KEY,

        admission_year VARCHAR(20) NOT NULL,

        file_name VARCHAR(255),

        uploaded_by INT,

        total_students INT,

        created_by INT NULL,

        updated_by INT NULL,

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ON UPDATE CURRENT_TIMESTAMP,

        FOREIGN KEY(admission_year)
            REFERENCES settings(admission_year)
            ON DELETE CASCADE,

        FOREIGN KEY(uploaded_by)
            REFERENCES users(id)
            ON DELETE SET NULL,

        FOREIGN KEY(created_by)
            REFERENCES users(id)
            ON DELETE SET NULL,

        FOREIGN KEY(updated_by)
            REFERENCES users(id)
            ON DELETE SET NULL
    );
`);



    await db.query(`
        CREATE TABLE IF NOT EXISTS activity_logs (

    id INT AUTO_INCREMENT PRIMARY KEY,

    module ENUM(
        'USER',
        'DESK',
        'STUDENT',
        'ONBOARDING',
        'UPLOAD',
        'AUTH'
    ) NOT NULL,

    action ENUM(
        'CREATE',
        'UPDATE',
        'DELETE',
        'LOGIN',
        'LOGOUT',
        'SCAN',
        'IMPORT'
    ) NOT NULL,

    reference_id INT NULL,

    description TEXT,

    created_by INT NULL,

    ip_address VARCHAR(100),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(created_by)
        REFERENCES users(id)
        ON DELETE SET NULL
);`);


    console.log("✅ Tables verified");
};