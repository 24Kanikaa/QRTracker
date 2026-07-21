const { getDB } = require("../config/database");
const DashboardService = require("../services/dashboardService");

exports.getSummary = async (req, res, next) => {
    try {

        const service = new DashboardService(getDB());

        const date =
            req.query.date ||
            new Date().toISOString().split("T")[0];

        const data = await service.getSummary(date);

        res.json({
            success: true,
            data
        });

    } catch (err) {
        next(err);
    }
};

exports.getDeskSummary = async (req, res, next) => {
    try {

        const service = new DashboardService(getDB());

        const date =
            req.query.date ||
            new Date().toISOString().split("T")[0];

        const data = await service.getDeskSummary(date);

        res.json({
            success: true,
            data
        });

    } catch (err) {
        next(err);
    }
};
exports.getDashboardOverview = async (req, res, next) => {
    try {
        const service = new DashboardService(getDB());

        const data = await service.getDashboardOverview();

        res.json({
            success: true,
            data
        });

    } catch (err) {
        next(err);
    }
};

exports.getTodayStudents = async (req, res, next) => {
    try {

        const service = new DashboardService(getDB());

        const date =
            req.query.date ||
            new Date().toISOString().split("T")[0];

        const data = await service.getTodayStudents(date);

        res.json({
            success: true,
            data
        });

    } catch (err) {
        next(err);
    }
};

exports.getDeskStudents = async (req, res, next) => {
    try {

        const service = new DashboardService(getDB());

        const data = await service.getDeskStudents(req.params.id);

        res.json({
            success: true,
            data
        });

    } catch (err) {
        next(err);
    }
};

exports.getStudentJourney = async (req, res, next) => {
    try {

        const service = new DashboardService(getDB());

        const data = await service.getStudentJourney(req.params.id);

        res.json({
            success: true,
            data
        });

    } catch (err) {
        next(err);
    }
};

exports.getRecentScans = async (req, res, next) => {
    try {

        const service = new DashboardService(getDB());

        const data = await service.getRecentScans();

        res.json({
            success: true,
            data
        });

    } catch (err) {
        next(err);
    }
};


exports.getAdmissionDates = async (req, res, next) => {
    try {

        const service = new DashboardService(getDB());

        const data = await service.getAdmissionDates();

        res.json({
            success: true,
            data
        });

    } catch (err) {
        next(err);
    }
};

exports.getDashboardData = async (req, res, next) => {
    try {

        const service = new DashboardService(getDB());

        const mode = req.query.mode || "daywise";

        const date = req.query.date || null;

        const data = await service.getDashboardData({
            mode,
            date
        });

        res.json({
            success: true,
            data
        });

    } catch (err) {
        next(err);
    }
};

exports.getDynamicRecentScans = async (req, res, next) => {
    try {

        const service = new DashboardService(getDB());

        const date = req.query.date || null;

        const limit = Number(req.query.limit || 10);

        const data = await service.getDynamicRecentScans({
            date,
            limit
        });

        res.json({
            success: true,
            data
        });

    } catch (err) {
        next(err);
    }
};


exports.getDynamicDeskStudents = async (req, res, next) => {
    try {

        const service = new DashboardService(getDB());

        const deskId = req.params.id;

        const date = req.query.date || null;

        const data = await service.getDynamicDeskStudents(
            deskId,
            date
        );

        res.json({
            success: true,
            data
        });

    } catch (err) {
        next(err);
    }
};

exports.getDynamicStudentJourney = async (req, res, next) => {
    try {

        const service = new DashboardService(getDB());

        const data = await service.getStudentJourney(
            req.params.id
        );

        res.json({
            success: true,
            data
        });

    } catch (err) {
        next(err);
    }
};