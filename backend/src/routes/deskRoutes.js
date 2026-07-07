const express = require("express");

const router = express.Router();

const deskController = require("../controllers/deskController");
// console.log(deskController);
const auth = require("../middleware/authMiddleware");

router.get("/", auth, deskController.getAllDesks);

router.get("/:id", auth, deskController.getDeskById);

router.post("/", auth, deskController.createDesk);

router.put("/:id", auth, deskController.updateDesk);

router.delete("/:id", auth, deskController.deleteDesk);

router.patch("/:id/status", auth, deskController.toggleDeskStatus);

// Reports
router.get("/reports", auth, deskController.getDeskReports);

// router.get("/:id/report", auth, deskController.getDeskReport);

// router.get("/:id/students", auth, deskController.getDeskStudents);

module.exports = router;