const SettingService = require("../services/settingService");
const { getDB } = require("../config/database");

exports.getUsers = async (req, res) => {
    try {
        const settingService = new SettingService(getDB());
        const users = await settingService .getUsers();

        res.json({
            success: true,
            data: users,
        });
    } catch (err) {
        console.error(err);

        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};

exports.getUserById = async (req, res) => {
    try {
        const settingService = new SettingService(getDB());
        const users = await settingService.getUserById(req.params.id);

        res.json({
            success: true,
            data: users,
        });
    } catch (err) {
        console.error(err);

        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};

exports.createUser = async (req, res) => {
    try {
        const settingService = new SettingService(getDB());
        const users = await settingService.createUser(req.body);

        res.status(201).json({
            success: true,
            message: "User created successfully.",
            data: users,
        });
    } catch (err) {
        console.error(err);

        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const settingService = new SettingService(getDB());
        await settingService.updateUser(req.params.id, req.body);

        res.json({
            success: true,
            message: "User updated successfully.",
        });
    } catch (err) {
        console.error(err);

        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};

exports.updateUserStatus = async (req, res) => {
    try {
        const settingService = new SettingService(getDB());
        console.log(req.body.active);
        await settingService.updateUserStatus(
            req.params.id,
            req.body.active
        );

        res.json({
            success: true,
            message: "User status updated.",
        });
    } catch (err) {
        console.error(err);

        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const settingService = new SettingService(getDB());
        await settingService.deleteUser(req.params.id);

        res.json({
            success: true,
            message: "User deleted successfully.",
        });
    } catch (err) {
        console.error(err);

        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};

exports.getOnboardingSettings = async (req, res) => {
    try {
        const settingService = new SettingService(getDB());

        const data = await settingService.getOnboardingSettings();

        res.json({
            success: true,
            data,
        });
    } catch (err) {
        console.error(err);

        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};

exports.getOnboarding = async (req, res) => {
    try {
        const settingService = new SettingService(getDB());

        const data = await settingService.getOnboarding(req.params.id);

        res.json({
            success: true,
            data,
        });
    } catch (err) {
        console.error(err);

        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};

exports.createOnboarding = async (req, res) => {
    try {
        const settingService = new SettingService(getDB());

        const id = await settingService.createOnboarding(
            req.body,
            req.user.id
        );

        res.status(201).json({
            success: true,
            message: "Onboarding created successfully.",
            id,
        });
    } catch (err) {
        console.error(err);

        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};

exports.updateOnboarding = async (req, res) => {
    try {
        const settingService = new SettingService(getDB());

        await settingService.updateOnboarding(
            req.params.id,
            req.body,
            req.user.id
        );

        res.json({
            success: true,
            message: "Onboarding updated successfully.",
        });
    } catch (err) {
        console.error(err);

        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};

exports.deleteOnboarding = async (req, res) => {
    try {
        const settingService = new SettingService(getDB());

        await settingService.deleteOnboarding(req.params.id);

        res.json({
            success: true,
            message: "Onboarding deleted successfully.",
        });
    } catch (err) {
        console.error(err);

        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};

exports.toggleOnboardingStatus = async (req, res) => {
    try {
        const settingService = new SettingService(getDB());

        await settingService.toggleOnboardingStatus(
            req.params.id,
            req.user.id
        );

        res.json({
            success: true,
            message: "Onboarding status updated successfully.",
        });
    } catch (err) {
        console.error(err);

        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};

exports.syncStudents = async (req, res) => {
    try {
        const settingService = new SettingService(getDB());

        const result = await settingService.syncStudents(req.params.id);

        return res.json({
            success: true,
            message: "Students synced successfully.",
            ...result,
        });
    } catch (err) {
        console.error(err);

        return res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};

exports.getStudentInfo = async (req, res) => {
    try {
        const settingService = new SettingService(getDB());
        const {email}=req.query;
         if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required.",
            });
        }

        const student = await settingService.syncStudentInfo(email);

       return res.json({
            success: true,
            student,
        });
    } catch (err) {
        console.error(err);

        return res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};

exports.exportStudentsCSV = async (req, res) => {

    try {
        const settingService = new SettingService(getDB());
        const csv = await settingService.exportStudentsCSV();

        res.setHeader("Content-Type", "text/csv");
        res.setHeader(
            "Content-Disposition",
            "attachment; filename=students.csv"
        );

        return res.send(csv);
    } catch (err) {
        console.error(err);

        return res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};

exports.importStudentDates = async (req, res) => {
    try {
        const settingService = new SettingService(getDB());

        const settingsId = req.params.id;

        const result = await settingService.importStudentDates(
            req.file,
            req.user.id,
            settingsId
        );

        return res.json({
            success: true,
            ...result,
        });

    } catch (err) {
        console.error(err);

        return res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};

exports.updateStudentRemarks = async (req, res) => {
    try {
        const { id } = req.params;
        const { remarks } = req.body;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Student ID is required.",
            });
        }
        const settingService = new SettingService(getDB());

        const result = await settingService.updateStudentRemarks(
            id,
            remarks
        );

        return res.json({
            success: true,
            message: "Remarks updated successfully.",
            student: result,
        });

    } catch (err) {
        console.error(err);

        return res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};