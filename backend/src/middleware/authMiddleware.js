const { verifyToken } = require("../utils/jwt");

module.exports = (req, res, next) => {
    const authHeader = req.headers.authorization;

    //console.log("Authorization Header:", authHeader);

    if (!authHeader) {
        return res.status(401).json({
            success: false,
            message: "Token missing."
        });
    }

    const token = authHeader.split(" ")[1];

    //console.log("Token:", token);

    try {
        const decoded = verifyToken(token);

        //console.log("Decoded:", decoded);

        req.user = decoded;

        next();
    } catch (err) {
        //console.log("JWT Error:", err);

        return res.status(401).json({
            success: false,
            message: "Invalid token."
        });
    }
};