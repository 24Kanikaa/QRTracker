const authService = require("../services/authService");

const { generateToken } = require("../utils/jwt");

exports.login = async (req, res) => {

    try {

        const { email, password } = req.body;

        if (!email || !password) {

            return res.status(400).json({

                success: false,

                message: "Email and password are required."

            });

        }

        const user = await authService.login(
            email,
            password
        );

        const token = generateToken(user);

        res.json({

            success: true,

            token,

            user

        });

    }

    catch (err) {

        res.status(401).json({

            success: false,

            message: err.message

        });

    }

};