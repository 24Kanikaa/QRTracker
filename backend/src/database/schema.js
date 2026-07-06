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
            active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                ON UPDATE CURRENT_TIMESTAMP
        );
    `);

    await db.query(`
        CREATE TABLE IF NOT EXISTS logs (
            id INT AUTO_INCREMENT PRIMARY KEY,
            student_email VARCHAR(150) NOT NULL,
            student_name VARCHAR(150) NOT NULL,
            student_id VARCHAR(50),
            desk_id INT NOT NULL,
            checked_in_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            session_date DATE DEFAULT (CURRENT_DATE),
            remarks TEXT,
            CONSTRAINT fk_logs_desk
                FOREIGN KEY (desk_id)
                REFERENCES desks(id)
                ON DELETE CASCADE
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