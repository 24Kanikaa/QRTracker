const express = require("express");
const router = express.Router();
const multer = require("multer");

const settingController = require("../controllers/settingsController");
const auth = require("../middleware/authMiddleware");
const upload = multer({
    storage: multer.memoryStorage(),
});

router.post(
    "/:id/students/import",
    auth,
    upload.single("file"),
    settingController.importStudentDates
);
// User Management
router.get("/users", auth, settingController.getUsers);
router.get("/students/info", auth, settingController.getStudentInfo);

router.get("/users/:id", auth, settingController.getUserById);
router.get(
    "/onboarding",
    auth,
    settingController.getOnboardingSettings
);

// Get onboarding by id
router.get(
    "/onboarding/:id",
    auth,
    settingController.getOnboarding
);

router.get(
    "/students/export",
    auth,
    settingController.exportStudentsCSV
);

router.post(
    "/:id/sync-students",
    auth,
    settingController.syncStudents
);
// Create onboarding
router.post(
    "/onboarding",
    auth,
    settingController.createOnboarding
);

router.patch(
    "/student/:id/remarks",
    auth,
    settingController.updateStudentRemarks
);

// Update onboarding
router.put(
    "/onboarding/:id",
    auth,
    settingController.updateOnboarding
);

// Delete onboarding
router.delete(
    "/onboarding/:id",
    auth,
    settingController.deleteOnboarding
);

// Toggle active status
router.patch(
    "/onboarding/:id/status",
    auth,
    settingController.toggleOnboardingStatus
);


router.post("/users", auth, settingController.createUser);

router.put("/users/:id", auth, settingController.updateUser);

router.patch("/users/:id/status", auth, settingController.updateUserStatus);

router.delete("/users/:id", auth, settingController.deleteUser);


module.exports = router;