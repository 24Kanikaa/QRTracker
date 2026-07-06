const express = require("express");

const router = express.Router();

router.use("/auth", require("./authRoutes"));

router.get("/", (req, res) => {

    res.json({

        success: true,

        message: "Tracker API Running"

    });

});

module.exports = router;