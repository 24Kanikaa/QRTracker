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

exports.loginUsingSSO= async({ name, email }) =>{

    const [users] = await this.db.query(
        `SELECT *
         FROM users
         WHERE email=?`,
        [email]
    );

    let user;

    if (!users.length) {

        const [result] = await this.db.query(
            `
            INSERT INTO users
            (
                name,
                email,
                password,
                role,
                auth_type,
                active
            )
            VALUES
            (
                ?,
                ?,
                NULL,
                'USER',
                'SSO',
                TRUE
            )
            `,
            [
                name,
                email
            ]
        );

        const [newUser] = await this.db.query(
            `
            SELECT *
            FROM users
            WHERE id=?
            `,
            [result.insertId]
        );

        user = newUser[0];

    } else {

        user = users[0];

        if (!user.active) {
            throw new Error("User is inactive.");
        }

        if (user.auth_type !== "SSO") {

            await this.db.query(
                `
                UPDATE users
                SET auth_type='SSO'
                WHERE id=?
                `,
                [user.id]
            );

            user.auth_type = "SSO";

        }

    }

    return user;

}