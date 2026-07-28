import * as XLSX from "xlsx";

export function generateWorkbook(data, fileName = "Report.xlsx") {

    const {
        students = [],
        desks = [],
        checklistItems = [],
        checklistLogs = [],
        deskLogs = []
    } = data;

    const workbook = XLSX.utils.book_new();

    /* ==========================================================
       LOOKUP MAPS
    ========================================================== */

    const checklistByDesk = new Map();
    const checklistLogMap = new Map();
    const deskVisitMap = new Map(); // <- source of truth for "time", for EVERY desk

    checklistItems.forEach(item => {
        if (!checklistByDesk.has(item.desk_id)) checklistByDesk.set(item.desk_id, []);
        checklistByDesk.get(item.desk_id).push(item);
    });

    checklistLogs.forEach(log => {
        checklistLogMap.set(`${log.student_id}-${log.checklist_item_id}`, log);
    });

    deskLogs.forEach(log => {
        deskVisitMap.set(`${log.student_id}-${log.desk_id}`, log);
    });

    /* ==========================================================
       HELPERS
    ========================================================== */

    function isChecked(log) {
        if (!log) return false;
        return log.checked === "1" || log.checked === true || log.checked === "true";
    }

    // Checklist status (checkbox items only) — shown as extra detail
    // alongside the scan time, exactly like the <Cell/> component does.
    function getChecklistStatus(studentId, checklist) {
        const checkboxItems = checklist.filter(i => i.type === "checkbox");
        let completed = 0;
        checkboxItems.forEach(item => {
            const log = checklistLogMap.get(`${studentId}-${item.id}`);
            if (isChecked(log)) completed++;
        });
        return { completed, total: checkboxItems.length };
    }

    function getDeskRemark(studentId, checklist) {
        const textItem = checklist.find(i => i.type === "text");
        if (!textItem) return "";
        const log = checklistLogMap.get(`${studentId}-${textItem.id}`);
        return log?.checked ? String(log.checked) : "";
    }

    function formatDate(value) {
        if (!value) return "";
        const d = new Date(value);
        if (isNaN(d.getTime())) return String(value);
        return d.toLocaleString();
    }

    function formatTime(value) {
        if (!value) return "";
        const d = new Date(value);
        if (isNaN(d.getTime())) return String(value);
        return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
    }

    // Mirrors the <Cell/> component's display logic 1:1
    function cellDisplay(time, checked, total) {
        const hasCounts = total > 0;
        const isCompleted = hasCounts && checked === total;

        if (time) {
            if (isCompleted) return `${time} | Completed`;
            if (hasCounts) return `${time} | ${checked}/${total}`;
            return time;
        }
        if (hasCounts && checked > 0) {
            return isCompleted ? "Verified" : `${checked}/${total}`;
        }
        return "Pending";
    }

    const usedSheetNames = new Set();
    function safeSheetName(name) {
        let clean = String(name || "Sheet").trim().replace(/[\\/?*\[\]:]/g, "").substring(0, 31) || "Sheet";
        let finalName = clean;
        let counter = 1;
        while (usedSheetNames.has(finalName)) {
            const suffix = ` (${counter})`;
            finalName = clean.substring(0, 31 - suffix.length) + suffix;
            counter++;
        }
        usedSheetNames.add(finalName);
        return finalName;
    }

    /* ==========================================================
       STUDENT SUMMARY SHEET (mirrors AdmissionOverviewPage.jsx table)
    ========================================================== */

    const studentRows = students.map(student => {

        const row = {
            Name:
                student.name ||
                student.student_name ||
                student.full_name ||
                `${student.first_name ?? ""} ${student.last_name ?? ""}`.trim(),
            RollNumber: student.roll_number || student.rollNumber || "",
            ApplicationNumber: student.application_number || student.applicationNumber || "",
            Email: student.email || "",
            Gender: student.gender || "",
            ExpectedDate: formatDate(student.expected_date || student.expectedDate),
            ArrivalDate: formatDate(student.arrival_date || student.arrivalDate),
        };

        // A desk counts toward completion ONLY when it has a recorded
        // visit/scan time — same rule the table uses (`c.time`), never
        // based on checklist items alone.
        let completedDesks = 0;

        desks.forEach(desk => {
            const checklist = checklistByDesk.get(desk.id) || [];
            const deskName = (desk.desk_name || "").trim();
            const visit = deskVisitMap.get(`${student.id}-${desk.id}`);
            const time = visit ? formatTime(visit.scan_time || visit.visited_at || visit.time) : null;

            let checked = 0, total = 0;
            if (checklist.length) {
                const status = getChecklistStatus(student.id, checklist);
                checked = status.completed;
                total = status.total;

                const remark = getDeskRemark(student.id, checklist);
                if (remark) row[`${deskName} - Remark`] = remark;
            }

            if (time) completedDesks++;

            row[`${deskName} - Status`] = cellDisplay(time, checked, total);
        });

        const totalDesks = student.totalDesks ?? desks.length;
        const completedCount = student.completedCount ?? completedDesks;
        const progressPct =
            student.progress ?? (totalDesks > 0 ? Math.round((completedCount / totalDesks) * 100) : 0);

        row.Progress = `${completedCount}/${totalDesks} (${progressPct}%)`;
        row.Remarks = student.remarks || "";

        return row;
    });

    const studentSheet = XLSX.utils.json_to_sheet(studentRows);
    XLSX.utils.book_append_sheet(workbook, studentSheet, safeSheetName("Students"));

    /* ==========================================================
       PER-DESK CHECKLIST SHEETS (unchanged — item-level detail)
    ========================================================== */

    desks.forEach(desk => {
        const checklist = checklistByDesk.get(desk.id);
        if (!checklist || checklist.length === 0) return;

        const rows = students.map(student => {
            const row = {
                Name:
                    student.name ||
                    student.student_name ||
                    `${student.first_name ?? ""} ${student.last_name ?? ""}`.trim(),
                RollNumber: student.roll_number || student.rollNumber || "",
                Email: student.email || "",
            };

            checklist.forEach(item => {
                const log = checklistLogMap.get(`${student.id}-${item.id}`);
                if (item.type === "checkbox") {
                    row[item.description] = isChecked(log) ? "Yes" : "No";
                } else {
                    row[item.description] = log?.checked ? String(log.checked) : "";
                    row[`${item.description} - By`] = log?.checked_by_name || log?.checked_by || "";
                    row[`${item.description} - At`] = formatDate(log?.checked_at);
                }
            });

            return row;
        });

        const sheet = XLSX.utils.json_to_sheet(rows);
        XLSX.utils.book_append_sheet(workbook, sheet, safeSheetName(desk.desk_name));
    });

    XLSX.writeFile(workbook, fileName);
    return workbook;
}