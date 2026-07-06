const { initializeDatabase, getDB } = require("../config/database");

const createSchema = require("./schema");
const seedDatabase = require("./seed");

module.exports = async () => {

    console.log("🚀 Initializing database...");

    await initializeDatabase();

    const db = getDB();

    await createSchema(db);

    await seedDatabase(db);

    console.log("✅ Database ready");

};