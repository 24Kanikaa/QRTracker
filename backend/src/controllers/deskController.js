const { getDB } = require("../config/database");
const DeskService = require("../services/deskService");

// Create one service instance


exports.getAllDesks = async (req, res, next) => {
    try {
       const deskService = new DeskService(getDB());
        const desks = await deskService.getAll();

        res.json({
            success: true,
            data: desks,
        });

    } catch (err) {
        next(err);
    }
};

exports.getDeskById = async (req, res, next) => {
    try {

        const deskService = new DeskService(getDB());

        const desk = await deskService.getById(req.params.id);

        if (!desk) {
            return res.status(404).json({
                success: false,
                message: "Desk not found"
            });
        }

        res.json({
            success: true,
            data: desk
        });

    } catch (err) {
        next(err);
    }
};

exports.createDesk = async (req, res, next) => {
    try {
        const deskService = new DeskService(getDB());
        const id = await deskService.create(req.body);

        res.status(201).json({
            success: true,
            message: "Desk created successfully.",
            id,
        });

    } catch (err) {
        next(err);
    }
};

exports.updateDesk = async (req, res, next) => {
    try {

        const deskService = new DeskService(getDB());
        await deskService.update(
            req.params.id,
            req.body
        );

        res.json({
            success: true,
            message: "Desk updated successfully.",
        });

    } catch (err) {
        next(err);
    }
};

exports.deleteDesk = async (req, res, next) => {
    try {

        const deskService = new DeskService(getDB());
        await deskService.delete(req.params.id);

        res.json({
            success: true,
            message: "Desk deleted successfully.",
        });

    } catch (err) {
        next(err);
    }
};

exports.toggleDeskStatus = async (req, res, next) => {
    try {
        const deskService = new DeskService(getDB());
        await deskService.toggleStatus(
            req.params.id,
            req.body.active
        );

        res.json({
            success: true,
            message: "Desk status updated.",
        });

    } catch (err) {
        next(err);
    }
};

/* ---------------- Reports ---------------- */

exports.getDeskReports = async (req, res, next) => {
    try {
        const deskService = new DeskService(getDB());
        const date =
            req.query.date ||
            new Date().toISOString().split("T")[0];

        const reports = await deskService.getReports(date);

        res.json({
            success: true,
            data: reports,
        });

    } catch (err) {
        next(err);
    }
};