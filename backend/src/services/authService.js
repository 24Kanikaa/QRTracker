const bcrypt = require("bcryptjs");

const db = require("../utils/db");

class AuthService {

    async login(email, password) {

        //console.log("Email received:", email);

        const users = await db.query(
            `
            SELECT *
            FROM users
            WHERE email = ?
            `,
            [email]
        );

        if (!users.length === 0) {
            throw new Error("Invalid email or password.");
        }

        const user = users[0];

        //console.log("DB Password:", user.password);
        //console.log("Auth Type:", user.auth_type);

        const valid = await bcrypt.compare(
            password,
            user.password
        );

        //console.log("Password Match:", valid);

        if (!valid) {
            throw new Error("PASSWORD_INCORRECT");
        }

        delete user.password;

        return user;
    }

    async adminSSOLogin(email, name) {

    const users = await db.query(
        `
        SELECT *
        FROM users
        WHERE email = ?
        `,
        [email]
    ); 
        if(!users.length){
            throw new Error("User not found");
        }

    return users[0];
    }

    async studentSSOLogin(email) {
      //console.log(email);
        const students = await db.query(
            `
            SELECT *
            FROM students
            WHERE email = ?
            `,
            [email]
        );

        if (!students.length) {
            throw new Error("Student not found.");
        }

        return students[0];
    }

    async getUser(id, role) {

        let result;

        if (role === "STUDENT") {

            result = await db.query(
                `
                SELECT
                    id,
                    first_name,
                    last_name,
                    email,
                    roll_number,
                    application_number,
                    expected_date
                FROM students
                WHERE id = ?
                `,
                [id]
            );
            return {
                ...result[0],
                role: "STUDENT"
            };

        } else {

            result = await db.query(
                `
                SELECT
                    id,
                    name,
                    email,
                    role,
                    active,
                    auth_type
                FROM users
                WHERE id = ?
                `,
                [id]
            );

        }

        if (!result.length) {
            throw new Error("User not found.");
        }

        return result[0];
    }

}

module.exports = AuthService;