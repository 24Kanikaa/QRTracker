const mysql = require("mysql2/promise");
require("dotenv").config();

let pool = null;

async function initializeDatabase() {
    // Connect without selecting a database
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD
    });

    // Create database if it doesn't exist
    await connection.query(
        `CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\``
    );

    await connection.end();

    // Create connection pool
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

    console.log("✅ Connected to MySQL");
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