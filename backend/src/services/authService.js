const bcrypt = require("bcryptjs");

const db = require("../utils/db");

const login = async (email, password) => {

    const users = await db.query(

        "SELECT * FROM users WHERE email=? AND active=TRUE",

        [email]

    );

    if (users.length === 0) {

        throw new Error("Invalid email or password.");

    }

    const user = users[0];

    const valid = await bcrypt.compare(
        password,
        user.password
    );

    if (!valid) {

        throw new Error("Invalid email or password.");

    }

    delete user.password;

    return user;

};

module.exports = {
    login
};