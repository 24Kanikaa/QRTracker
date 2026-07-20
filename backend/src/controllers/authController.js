const AuthService = require("../services/authService");

const authService = new AuthService();

const { generateToken } = require("../utils/jwt");

exports.login = async (req, res) => {
    // console.log("controller");

    try {
        const { email, password } = req.body;

        // console.log(email, password);

        const user = await authService.login(email, password);

        const token = generateToken(user);

        res.json({
            success: true,
            token,
            user
        });

    } catch (err) {
        console.log("LOGIN ERROR:", err);

        res.status(401).json({
            success: false,
            message: err.message
        });
    }
};

function decodeJwtPayload(token) {

    const payload = token.split(".")[1];

    return JSON.parse(

        Buffer.from(payload, "base64").toString()

    );

}

exports.microsoftLogin = async (req, res) => {

    try {
        //  console.log(req.query.type);
        const loginType = req.query.type || "student";
        // console.log("Incoming type:", req.query.type);
        const tenantId = process.env.AZURE_TENANT_ID;

        const clientId = process.env.AZURE_CLIENT_ID;

        const redirectUri = process.env.AZURE_REDIRECT_URI;

        const authUrl =
            `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize?` +
            new URLSearchParams({

                client_id: clientId,

                response_type: "code",

                redirect_uri: redirectUri,

                response_mode: "query",

                scope: "openid profile email User.Read",

                state: loginType

            });

        return res.redirect(authUrl);

    }
    catch (err) {

        console.error(err);

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

};

exports.microsoftCallback = async (req, res) => {

    try {

        const tenantId = process.env.AZURE_TENANT_ID;

        const clientId = process.env.AZURE_CLIENT_ID;

        const clientSecret = process.env.AZURE_CLIENT_SECRET;

        const redirectUri = process.env.AZURE_REDIRECT_URI;

        const code = req.query.code;

        const loginType = req.query.state || "student";
        // console.log("callback"+req.query.state);
        if (!code) {

            return res.status(400).json({

                success: false,

                message: "Authorization code missing."

            });

        }

        const tokenUrl =
            `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;

        const tokenResponse = await fetch(tokenUrl, {

            method: "POST",

            headers: {

                "Content-Type": "application/x-www-form-urlencoded"

            },

            body: new URLSearchParams({

                client_id: clientId,

                client_secret: clientSecret,

                code,

                grant_type: "authorization_code",

                redirect_uri: redirectUri,

                scope: "openid profile email User.Read"

            })

        });

        if (!tokenResponse.ok) {

            const error = await tokenResponse.text();

            throw new Error(error);

        }

        const tokenData = await tokenResponse.json();

        const payload = decodeJwtPayload(tokenData.id_token);

        const email =
            payload.email ||
            payload.preferred_username ||
            payload.upn;

        const name =
            payload.name ||
            email.split("@")[0];

        let user;


        if (loginType === "admin") {

            user = await authService.adminSSOLogin(
                email,
                name
            );
            
            const token = generateToken({
                id: user.id,
                role: user.role
            });

            res.cookie("tracker_token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                maxAge: 12 * 60 * 60 * 1000
            });


            return res.redirect(
                loginType === "admin"
                    ? `${process.env.FRONTEND_URL}/admin`
                    : `${process.env.FRONTEND_URL}/student`
            );

        }
         
        user = await authService.studentSSOLogin(
            email
        );

        const token = generateToken({

            id: user.id,

            role: "STUDENT"

        });
        
        res.cookie("tracker_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 12 * 60 * 60 * 1000
        });

        return res.redirect(
            loginType === "admin"
                    ? `${process.env.FRONTEND_URL}/admin`
                    : `${process.env.FRONTEND_URL}/student`);

    }
    catch (err) {

    console.error(err);

    if (err.message === "Student not found.") {
        return res.redirect(
            `${process.env.FRONTEND_URL}/student-login-error?reason=not-found`
        );
    } 

    if (err.message === "User not found") {
        return res.redirect(
            `${process.env.FRONTEND_URL}/user-login-error?reason=not-found`
        );
    }

    return res.status(500).json({
        success: false,
        message: err.message
    });

}

};

exports.me = async (req, res) => {

    try {

        const user = await authService.getUser(req.user.id,req.user.role);

        res.json({

            success: true,
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

exports.logout = async (req, res) => {

    res.clearCookie("tracker_token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax"
    });

    return res.json({
        success: true,
        message: "Logged out successfully."
    });

};