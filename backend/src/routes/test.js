const express = require("express");

const router = express.Router();

const db = require("../config/database");

router.get("/", async (req, res) => {

    try {

        const [rows] = await db.query(
            "SELECT NOW() AS server_time"
        );

        res.json({

            success: true,

            data: rows

        });

    }

    catch (err) {

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

});

module.exports = router;