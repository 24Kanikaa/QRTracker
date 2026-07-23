const mysql = require("mysql2/promise");
require("dotenv").config();

let pool = null;

async function initializeDatabase() {

    //console.log("Initializing database...");

    // Connect without selecting a database
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD
    });

    //console.log("Connected to MySQL server");

    await connection.query(
        `CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\``
    );

    //console.log("Database verified");

    await connection.end();

    pool = mysql.createPool({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });
     const conn = await pool.getConnection();
    await conn.query("SET time_zone = '+05:30'");
    conn.release();

    //console.log("Pool created");
}

function getDB() {

    if (!pool) {
        throw new Error("Database has not been initialized.");
    }

    return pool;
}

module.exports = {
    initializeDatabase,
    getDB
};