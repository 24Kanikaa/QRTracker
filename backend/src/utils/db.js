const { getDB } = require("../config/database");

async function query(sql, params = []) {
    const db = getDB();

    try {

        const [rows] = await db.execute(sql, params);

        return rows;

    } catch (err) {

        console.error("Database Error:", err);

        throw err;

    }

}

module.exports = {
    query
};