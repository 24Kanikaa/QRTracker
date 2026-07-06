const db = require("../config/database");

/**
 * Get admin by email
 */
const getUserByEmail = async (email) => {
    const [rows] = await db.query(
        `SELECT * FROM users WHERE email = ? AND active = TRUE`,
        [email]
    );

    return rows.length ? rows[0] : null;
};

module.exports = {
    getUserByEmail
};