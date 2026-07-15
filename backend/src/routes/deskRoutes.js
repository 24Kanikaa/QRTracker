const express = require("express");

const router = express.Router();

const deskController = require("../controllers/deskController");
// console.log(deskController);
const auth = require("../middleware/authMiddleware");

router.get("/", auth, deskController.getAllDesks);
router.get("/reports", auth, deskController.getDeskReports);
router.get("/journey", auth, deskController.getJourney);
router.get(
  "/students",
  auth,
  deskController.getStudents
);
router.get("/:id", auth, deskController.getDeskById);

router.post("/", auth, deskController.createDesk);
router.post("/scan", auth, deskController.scanDesk);

router.put("/:id", auth, deskController.updateDesk);

router.delete("/:id", auth, deskController.deleteDesk);

router.patch("/:id/status", auth, deskController.toggleDeskStatus);

// Reports


// router.get("/:id/report", auth, deskController.getDeskReport);

router.get("/:id/students",
    auth,
    deskController.getDeskStudents
);
router.get("/scan/:slug",auth, deskController.getDeskBySlug);

router.get("/:id/qr", auth, deskController.getDeskQR);

router.get("/:id", auth, deskController.getDeskById);


module.exports = router;