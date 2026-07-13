const express = require("express");
const router = express.Router();

const settingController = require("../controllers/settingsController");
const auth = require("../middleware/authMiddleware");

// User Management
router.get("/users", auth, settingController.getUsers);

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

// Create onboarding
router.post(
    "/onboarding",
    auth,
    settingController.createOnboarding
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