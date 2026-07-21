const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const dashboardController = require("../controllers/dashboardController");


// Main dashboard data
router.get(
    "/summary",
    auth,
    dashboardController.getSummary
);


router.get(
    "/desk-summary",
    auth,
    dashboardController.getDeskSummary
);


// Full dashboard overview
router.get(
    "/overview",
    auth,
    dashboardController.getDashboardOverview
);

router.get("/admission-dates", auth, dashboardController.getAdmissionDates);
router.get("/dashboard-data", auth, dashboardController.getDashboardData);
// Students
router.get(
    "/today-students",
    auth,
    dashboardController.getTodayStudents
);


router.get(
    "/desk/:id/students",
    auth,
    dashboardController.getDeskStudents
);


router.get(
    "/student/:id/journey",
    auth,
    dashboardController.getStudentJourney
);


router.get(
    "/recent-scans",
    auth,
    dashboardController.getRecentScans
);


// Main dashboard data
router.get(
    "/summary",
    auth,
    dashboardController.getSummary
);


router.get(
    "/desk-summary",
    auth,
    dashboardController.getDeskSummary
);


// Full dashboard overview
router.get(
    "/overview",
    auth,
    dashboardController.getDashboardOverview
);


// Students
router.get(
    "/today-students",
    auth,
    dashboardController.getTodayStudents
);


router.get(
    "/desk/:id/students",
    auth,
    dashboardController.getDeskStudents
);


router.get(
    "/student/:id/journey",
    auth,
    dashboardController.getStudentJourney
);


router.get(
    "/recent-scans",
    auth,
    dashboardController.getRecentScans
);



module.exports = router;