const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");

router.post("/login", authController.login);
router.get("/sso/login", authController.microsoftLogin);
router.get("/microsoft/callback", authController.microsoftCallback);
const auth = require("../middleware/authMiddleware");

router.get(
    "/me",
    auth,
    authController.me
);

router.post(
    "/logout",
    authController.logout
);

module.exports = router;