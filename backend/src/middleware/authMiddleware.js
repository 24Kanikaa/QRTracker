const { verifyToken } = require("../utils/jwt");

module.exports = (req, res, next) => {

    try {

        let token = null;

        // Cookie authentication
        if (req.cookies?.tracker_token) {
            token = req.cookies.tracker_token;
        }

        // Authorization header authentication
        if (!token && req.headers.authorization?.startsWith("Bearer ")) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Authentication required."
            });
        }

        req.user = verifyToken(token);

        next();

    } catch (err) {

        return res.status(401).json({
            success: false,
            message: "Invalid or expired token."
        });

    }

};