const express = require("express");

const router = express.Router();

router.use("/auth", require("./authRoutes"));
router.use("/desks", require("./deskRoutes"));
router.use("/dashboard", require("./dashboardRoutes"));
router.use("/settings", require("./settingsRoutes"));
router.use("/data", require("./dashboardRoutes"));
router.get("/", (req, res) => {

    res.json({

        success: true,

        message: "Tracker API Running"

    });

});

module.exports = router;