import { useEffect, useMemo, useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
  Users,
  Clock3,
  CheckCircle2,
  Sun,
  Moon,
  Menu,
  DoorOpen,
  Building2,
  Home,
  Laptop,
  UtensilsCrossed,
  IdCard,
  Library,
  LayoutGrid,
  Search,
  Download,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  CircleDashed,
  User,
  MessageSquareText,
  X,
  Check,
  Minus,
  User as UserIcon,
  Tag,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import {
  getStudentOverview,
  getStudentChecklistLogs,
  updateChecklistItem,
  exportReport,
} from "../../services/deskService";
import { getStudentInfo, updateStudentRemarks } from "../../services/settingServices";
import { getDashboardData } from "../../services/Dashboardservice";
import Swal from "sweetalert2";
import { useTheme } from "../../context/ThemeContext";
import { GhostButton, Modal, PrimaryButton } from "./Settings";
import { generateWorkbook } from "../../utils/exportWorkbook";

/* ============================================================
   DESK ICON MAPPING
   ============================================================ */

const DESK_ICON_MAP = {
  gate: DoorOpen,
  admission: Building2,
  hostel: Home,
  it: Laptop,
  itdesk: Laptop,
  mess: UtensilsCrossed,
  id: IdCard,
  idcard: IdCard,
  library: Library,
};

const cacheKey = (studentId, deskId) => `${studentId}_${deskId}`;
function getDeskIcon(deskName) {
  const normalized = (deskName || "").toLowerCase().replace(/[^a-z]/g, "");
  return DESK_ICON_MAP[normalized] || LayoutGrid;
}

function slugifyDeskName(deskName) {
  return (
    (deskName || "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "") || "desk"
  );
}


function isItemMarked(item) {
  if (item?.checked === null || item?.checked === undefined) {
    return false;
  }

  const val = String(item.checked).trim().toLowerCase();

  return val === "true" || val === "1";
}

function computeStatus(completedCount, totalDesks, arrivalDate) {
  if (totalDesks > 0 && completedCount === totalDesks) return "COMPLETED";
  if (arrivalDate) return "IN_PROGRESS";
  return "EXPECTED";
}

function isCountableItem(item) {
  return item?.type !== "text";
}

function normalizeOverview(payload) {
const desksRaw = payload?.desks || [];
  const studentsRaw = payload?.students || [];
  const checklistLogs = payload?.checklistLogs || {};

  const desks = desksRaw.map((d) => {
    const deskId = d.id ?? d.desk_id;
    return {
      key: slugifyDeskName(d.desk_name),
      name: d.desk_name,
      id: deskId,
      title: d.desk_name,
      icon: getDeskIcon(d.desk_name),
      hasChecklist: false,
    };
  });
    desks.forEach((desk) => {
  const matchingLists = studentsRaw.map((s) => ({
    studentId: s.id,
    key: cacheKey(s.id, desk.id),
    list: checklistLogs[cacheKey(s.id, desk.id)],
  }));

  desk.hasChecklist = matchingLists.some(
    (m) => Array.isArray(m.list) && m.list.length > 0
  );
});


  const students = studentsRaw.map((s) => {
    const totalDesks = s.totalDesks ?? desks.length;
    const completedCount = s.completedCount ?? 0;
    const arrivalDate = s.arrivalDate;

    const status = computeStatus(
      completedCount,
      totalDesks,
      arrivalDate
    );

    const progress =
      totalDesks > 0
        ? Math.round((completedCount / totalDesks) * 100)
        : 0;

    const cells = {};

    desks.forEach((col) => {
      const entry = s.desks?.[col.name];

      // get checklist for this student + desk
      const checklist =
        checklistLogs[cacheKey(s.id, col.id)] || [];

      const countableItems = checklist.filter(isCountableItem);
       const totalCount = countableItems.length;
      const checkedCount = countableItems.filter((i) => isItemMarked(i)).length;

      const time =
        entry &&
        entry.status === "completed" &&
        entry.time
          ? new Date(entry.time).toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            })
          : null;
          

      cells[col.key] = {
       time,
        checkedCount,
        totalCount,
        hasChecklist: checklist.length > 0,
        checklist,
      };
    });

    return {
      id: s.id,
      name: s.name,
      rollNumber: s.rollNumber,
      applicationNumber: s.applicationNumber,
      email: s.email,
      gender: s.gender,
      expectedDate: s.expectedDate,
      arrivalDate,
      expectedDateKey: s.expectedDateKey,
      arrivalDateKey: s.arrivalDateKey,
      isUnexpectedArrival: Boolean(s.isUnexpectedArrival),
      currentDesk: s.currentDesk,
      remarks: s.remarks,
      completedCount,
      totalDesks,
      progress,
      status,
      cells,
    };
  });

  return { desks, students };
}
function formatDate(value) {
  if (!value || value === "all") return value === "all" ? "All dates" : "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function getPageNumbers(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set([1, 2, total - 1, total, current - 1, current, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const result = [];
  let prev = 0;
  for (const p of sorted) {
    if (prev && p - prev > 1) result.push("...");
    result.push(p);
    prev = p;
  }
  return result;
}

function downloadCSV(rows, header, filename) {
  const csv = [header, ...rows]
    .map((r) => r.map((field) => `"${String(field).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

async function mapWithConcurrency(items, limit, worker) {
  let cursor = 0;
  async function run() {
    while (cursor < items.length) {
      const idx = cursor++;
      try {
        await worker(items[idx], idx);
      } catch (err) {
        // leave this pair uncached; its cell just falls back to "Pending"
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, run));
}

function DeskChecklistModal({ open, onClose, loading, desk, student, items, completionTime, onToggleItem, C }) {
  if (!open) return null;

  const countableItems = items.filter((i) => i?.type !== "text");
  const total = countableItems.length;
 const checkedCount = countableItems.filter((i) => isItemMarked(i)).length;
  const allDone = total > 0 && checkedCount === total;
  const lastUpdatedItem = [...items]
  .filter((i) => i.checked_at)
  .sort(
    (a, b) =>
      new Date(b.checked_at) - new Date(a.checked_at)
  )[0];

  return (
    <Modal title={`${desk?.title || "Desk"} Checklist — ${student?.name || ""}`} width={640} onClose={onClose} C={C}>
      {loading ? (
        <div className="py-16 text-center text-sm" style={{ color: C.muted }}>
          Loading checklist...
        </div>
      ) : items.length === 0 ? (
        <div className="py-16 text-center text-sm" style={{ color: C.muted }}>
          No checklist items configured for this desk.
        </div>
      ) : (
        <>
          {/* Progress / completion header */}
          <div
            className="rounded-xl px-4 py-3 mb-4 flex items-center justify-between"
            style={{
              background: allDone ? C.greenSoft : C.panel2,
              border: `1px solid ${allDone ? C.green : C.hairline}`,
            }}
          >
            <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              {allDone ? (
                <CheckCircle2 size={16} style={{ color: C.green }} />
              ) : (
                <Clock3 size={16} style={{ color: C.brass }} />
              )}

              <span
                className="text-sm font-semibold"
                style={{ color: allDone ? C.green : C.text }}
              >
                {allDone
                  ? completionTime
                    ? `Completed at ${completionTime}`
                    : "All items verified"
                  : `${checkedCount}/${total} items verified`}
              </span>
            </div>

            {lastUpdatedItem && (
              <div
                className="text-xs flex items-center gap-1"
                style={{ color: C.muted }}
              >
                <User size={12} />
                <span>
                  Last updated by{" "}
                  <strong style={{ color: C.text }}>
                    {lastUpdatedItem.checked_by_name}
                  </strong>
                </span>
              </div>
            )}
          </div>
            {!allDone && (
              <span className="text-xs font-medium" style={{ color: C.muted }}>
                {total - checkedCount} remaining
              </span>
            )}
          </div>

          <div className="space-y-3">
            {items.map((item) => {
              const isChecked = isItemMarked(item);
              const isSaving = Boolean(item.saving);
              const isTextItem = item.type === "text";

              return (
                <div
                  key={item.checklist_item_id}
                  className="rounded-xl p-4"
                  style={{ background: C.panel2, border: `1px solid ${C.hairline}` }}
                >
                  {isTextItem ? (
                    <TextChecklistRow
                      item={item}
                      isSaving={isSaving}
                      onSave={(value) => onToggleItem(item, value ? value : null)}
                      C={C}
                    />
                  ) : (
                    <label className="flex items-start gap-3 cursor-pointer">
                      <span className="shrink-0 mt-0.5">
                        {isSaving ? (
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center"
                            style={{ background: C.panel, border: `1px solid ${C.hairline}` }}
                          >
                            <Loader2 size={13} className="animate-spin" style={{ color: C.muted }} />
                          </div>
                        ) : (
                          <input
                            type="checkbox"
                            checked={isChecked}
                            disabled={isSaving}
                            onChange={() => onToggleItem(item, isChecked ? null : "1")}
                            className="w-5 h-5 rounded cursor-pointer"
                            style={{ accentColor: C.green }}
                          />
                          
                        )}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium" style={{ color: C.text }}>
                          {item.description}
                        </p>
                        <p className="text-xs mt-1" style={{ color: isChecked ? C.green : C.mutedSoft }}>
                          {isChecked ? "Verified" : "Pending"}
                        </p>
                      </div>
                    </label>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </Modal>
  );
}

// Separate sub-component so each text row holds its own draft state
// without re-rendering every other row on keystroke.
function TextChecklistRow({ item, isSaving, onSave, C }) {
  const [value, setValue] = useState(item.checked || "");

  useEffect(() => {
    setValue(item.checked || "");
  }, [item.checked]);

  const dirty = value !== (item.checked || "");

  return (
    <div>
      <label
        className="block text-sm font-medium mb-2"
        style={{ color: C.text }}
      >
        {item.description}
      </label>

      <input
        type="text"
        value={value}
        placeholder="Enter remarks..."
        className="w-full rounded-lg px-3 py-2 text-sm"
        style={{
          background: C.panel,
          border: `1px solid ${C.hairline}`,
          color: C.text,
        }}
        onChange={(e) => setValue(e.target.value)}
      />

      {dirty && (
        <div className="mt-3 flex justify-end">
          <button
            type="button"
            disabled={isSaving}
            onClick={() => onSave(value.trim())}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition"
            style={{
              background: C.greenSoft,
              color: C.green,
              border: `1px solid ${C.green}`,
              opacity: isSaving ? 0.7 : 1,
            }}
          >
            {isSaving ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check size={13} />
                Save
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

function Cell({ time, checkedCount, totalCount, C, onClick, clickable = true }) {
  const hasCounts = typeof totalCount === "number" && totalCount > 0;
  const hasVerified = hasCounts && (checkedCount ?? 0) > 0;

  let content;

  const isCompleted = hasCounts && totalCount > 0 && checkedCount === totalCount;

  if (time) {
    content = (
      <span
        className="inline-flex items-center px-2.5 py-1 rounded-full border whitespace-nowrap"
        style={{ background: C.greenSoft, borderColor: C.greenSoft }}
      >
        <span className="text-xs font-medium whitespace-nowrap" style={{ color: C.green }}>
          {isCompleted
            ? `${time} | Completed`
            : hasCounts
            ? `${time} | ${checkedCount}/${totalCount}`
            : time}
        </span>
      </span>
    );
  } else if (hasVerified) {
    content = (
      <span
        className="inline-flex items-center px-2.5 py-1 rounded-full border whitespace-nowrap"
        style={{
          background: isCompleted ? C.greenSoft : C.brassSoft,
          borderColor: isCompleted ? C.greenSoft : C.brassSoft,
        }}
      >
        <span
          className="text-xs font-medium whitespace-nowrap"
          style={{ color: isCompleted ? C.green : C.brass }}
        >
          {isCompleted ? "Verified" : `${checkedCount}/${totalCount}`}
        </span>
      </span>
    );
  } else {
    content = (
      <span
        className="px-2 py-1 rounded-full text-xs font-medium border border-dashed whitespace-nowrap"
        style={{ color: C.mutedSoft, borderColor: C.hairline }}
      >
        Pending
      </span>
    );
  }

  if (!clickable) {
    return <div className="flex justify-center">{content}</div>;
  }

  return (
    <div className="flex justify-center">
      <button onClick={onClick} className="transition-transform hover:scale-105" title="View checklist details">
        {content}
      </button>
    </div>
  );
}

function StudentIdentity({ student, C, alert = false }) {
  const name = student.name || "—";
  return (
    <div className="flex items-center gap-3">
      <div
        className="w-9 h-9 rounded-full text-white flex items-center justify-center font-semibold shrink-0"
        style={{
          background: alert
            ? `linear-gradient(135deg,${C.rose},#b91c1c)`
            : `linear-gradient(135deg,${C.brass},${C.green})`,
        }}
        title={alert ? "Arrived on a different day than expected" : undefined}
      >
        {name.charAt(0).toUpperCase()}
      </div>
      <div>
        <h3 className="font-semibold text-sm flex items-center gap-1.5" style={{ color: C.text }}>
          {name}
          {alert && <AlertTriangle size={12} style={{ color: C.rose }} />}
        </h3>
        <p className="text-xs" style={{ color: C.muted }}>
          {student.email}
        </p>
      </div>
    </div>
  );
}

function CircularProgress({ progress, C, size = 36, stroke = 4 }) {
  const pct = Math.max(0, Math.min(100, progress));
  const isComplete = pct >= 100;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;
  return (
    <div className="relative inline-flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={C.hairlineSoft} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={isComplete ? C.green : C.brass}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 300ms ease" }}
        />
      </svg>
      <span
        className="absolute font-bold"
        style={{ fontSize: size <= 36 ? 11 : 12, color: isComplete ? C.green : C.text }}
      >
        {pct}%
      </span>
    </div>
  );
}

function StudentProfileModal({ open, student, loading, onClose, C, onRemarksSaved }) {
  const [remarks, setRemarks] = useState("");
  const [savingRemarks, setSavingRemarks] = useState(false);

  useEffect(() => {
    setRemarks(student?.remarks || "");
  }, [student]);

  if (!open) return null;
  const handleSaveRemarks = async () => {
    if (!student?.id) return;

    try {
      setSavingRemarks(true);
      await updateStudentRemarks(student.id, remarks);

      Swal.fire({
        icon: "success",
        title: "Remarks saved",
        text: "Student remarks have been updated successfully.",
        timer: 1500,
        showConfirmButton: false,
      });

      onRemarksSaved?.(student.id, remarks);
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Unable to save remarks",
        text: err.response?.data?.message || "Something went wrong while saving remarks.",
      });
    } finally {
      setSavingRemarks(false);
    }
  };

  return (
    <Modal title="Student Profile" width={900} onClose={onClose} C={C}>
      {loading ? (
        <div className="py-20 text-center text-sm" style={{ color: C.muted }}>
          Loading student profile...
        </div>
      ) : (
        <>
          <div
            className="rounded-2xl p-5 mb-6 flex items-center justify-between"
            style={{ background: C.panel2, border: `1px solid ${C.hairline}` }}
          >
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold"
                style={{ background: C.brassSoft, color: C.brass }}
              >
                {student?.first_name?.[0]}
                {student?.last_name?.[0]}
              </div>

              <div>
                <h2 className="text-xl font-bold" style={{ color: C.text }}>
                  {student?.first_name} {student?.last_name}
                </h2>
                <p className="text-sm mt-1" style={{ color: C.muted }}>
                  {student?.email}
                </p>
                <p className="font-semibold mt-1" style={{ color: C.text }}>
                  {student?.roll_number || "—"}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <Section title="Personal Information" C={C}>
              <Info label="Application No." value={student?.application_number} />
              <Info label="Gender" value={student?.gender} />
              <Info label="DOB" value={formatDate(student?.date_of_birth)} />
              <Info label="Blood Group" value={student?.blood_group} />
              <Info label="Mobile" value={student?.mobile_number} />
            </Section>

            <Section title="Parent Details" C={C}>
              <Info label="Father" value={student?.father_name} />
              <Info label="Father Mobile" value={student?.guardian1_mobile} />
              <Info label="Mother" value={student?.mother_name} />
              <Info label="Mother Mobile" value={student?.guardian2_mobile} />
            </Section>

            <Section title="Location" C={C}>
              <Info label="State" value={student?.state} />
              <Info label="Country" value={student?.country} />
              <Info label="Nationality" value={student?.nationality} />
            </Section>

            <Section title="Onboarding" C={C}>
              <Info label="Expected Arrival" value={formatDate(student?.expected_date)} />
              <Info label="Actual Arrival" value={formatDate(student?.arrival_date)} />
              <Info label="Admission Year" value={student?.admission_year} />
            </Section>
          </div>

          <div className="mt-6 rounded-2xl p-5" style={{ background: C.panel2, border: `1px solid ${C.hairline}` }}>
            <label className="block text-sm font-semibold mb-3" style={{ color: C.text }}>
              Internal Remarks
            </label>
            <textarea
              rows={4}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Add remarks..."
              className="w-full rounded-xl p-3 resize-none outline-none"
              style={{ background: C.panel, border: `1px solid ${C.hairline}`, color: C.text }}
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <GhostButton C={C} onClick={onClose}>
              Close
            </GhostButton>
            <PrimaryButton C={C} onClick={handleSaveRemarks} disabled={savingRemarks}>
              {savingRemarks ? "Saving..." : "Save Remarks"}
            </PrimaryButton>
          </div>
        </>
      )}
    </Modal>
  );
}

function Section({ title, children, C }) {
  return (
    <div className="rounded-2xl p-5" style={{ background: C.panel2, border: `1px solid ${C.hairline}` }}>
      <h3 className="text-sm font-semibold mb-4" style={{ color: C.text }}>
        {title}
      </h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <div className="text-xs text-slate-500 mb-1">{label}</div>
      <div className="font-medium">{value || "—"}</div>
    </div>
  );
}

function DeskChecklistFilterControl({ desk, filter, onChange, C }) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(filter?.type === "eq" ? String(filter.value) : "");
  const wrapRef = useRef(null);
  const Icon = desk.icon;

  useEffect(() => {
    setInputValue(filter?.type === "eq" ? String(filter.value) : "");
  }, [filter]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const label =
    filter?.type === "pending"
      ? "Pending"
      : filter?.type === "verified"
      ? "Verified"
      : filter?.type === "eq"
      ? `= ${filter.value}`
      : null;

  const applyEqual = () => {
    const trimmed = inputValue.trim();
    if (trimmed === "") return;
    const num = Number(trimmed);
    if (Number.isNaN(num) || num < 0) return;
    onChange({ type: "eq", value: num });
    setOpen(false);
  };

  const selectOption = (type) => {
    onChange(filter?.type === type ? null : { type });
    setOpen(false);
  };

  return (
    <div className="relative" ref={wrapRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-colors"
        style={
          filter
            ? { background: C.brass, borderColor: C.brass, color: "#fff" }
            : { background: C.panel2, borderColor: C.hairline, color: C.text }
        }
      >
        <Icon size={14} />
        {desk.title}
        {label && (
          <span
            className="text-[11px] font-semibold px-1.5 py-0.5 rounded-full"
            style={{ background: "rgba(255,255,255,0.25)" }}
          >
            {label}
          </span>
        )}
        <ChevronDown
          size={12}
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 150ms ease" }}
        />
      </button>

      {open && (
        <div
          className="absolute z-30 mt-2 w-56 rounded-xl p-2"
          style={{ background: C.panel, border: `1px solid ${C.hairline}`, boxShadow: C.cardShadow }}
        >
          <button
            onClick={() => selectOption("pending")}
            className="w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between"
            style={{ color: C.text, background: filter?.type === "pending" ? C.panel2 : "transparent" }}
          >
            Pending
            {filter?.type === "pending" && <Check size={14} style={{ color: C.brass }} />}
          </button>

          <button
            onClick={() => selectOption("verified")}
            className="w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between"
            style={{ color: C.text, background: filter?.type === "verified" ? C.panel2 : "transparent" }}
          >
            Verified
            {filter?.type === "verified" && <Check size={14} style={{ color: C.brass }} />}
          </button>

          <div className="px-3 py-2 mt-1" style={{ borderTop: `1px solid ${C.hairline}` }}>
            <p className="text-xs font-medium mb-1.5 mt-1" style={{ color: C.muted }}>
              Equal to
            </p>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                min={0}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                  }
                }}
                placeholder="e.g. 3"
                className="w-full px-2 py-1.5 rounded-lg outline-none text-sm"
                style={{ background: C.panel2, border: `1px solid ${C.hairline}`, color: C.text }}
              />
              <button
                onClick={applyEqual}
                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-white shrink-0"
                style={{ background: C.brass }}
              >
                Go
              </button>
            </div>
          </div>

          {filter && (
            <button
              onClick={() => {
                onChange(null);
                setOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-xs mt-1 font-medium"
              style={{ color: C.rose }}
            >
              Clear filter
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   PAGE
   ============================================================ */

export default function AdmissionOverviewPage() {
  const { dark, toggleDark, C } = useTheme();
  const user = JSON.parse(localStorage.getItem("user"));
  const { setOpen: setSidebarOpen } = useOutletContext();
  const [students, setStudents] = useState([]);
  const [desks, setDesks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState("all");
  const [statusTab, setStatusTab] = useState("all");
  const [search, setSearch] = useState("");
  const [exportLoading, setExportLoading] = useState(false);

  const [activeCategory, setActiveCategory] = useState(null);
  const toggleCategory = (key) => {
    setActiveCategory((prev) => (prev === key ? null : key));
  };
  const filterBarRef = useRef(null);
  const [activeFilters, setActiveFilters] = useState([]);

  const [deskChecklistFilters, setDeskChecklistFilters] = useState({});
  const [filtersApplying, setFiltersApplying] = useState(false);
  const applyingTimeoutRef = useRef(null);

  const setDeskChecklistFilter = (deskKey, filter) => {
    setDeskChecklistFilters((prev) => {
      const next = { ...prev };
      if (!filter) {
        delete next[deskKey];
      } else {
        next[deskKey] = filter;
      }
      return next;
    });

    setFiltersApplying(true);
    if (applyingTimeoutRef.current) window.clearTimeout(applyingTimeoutRef.current);
    applyingTimeoutRef.current = window.setTimeout(() => setFiltersApplying(false), 450);
  };

  const removeDeskChecklistFilter = (deskKey) => setDeskChecklistFilter(deskKey, null);

  useEffect(() => {
    return () => {
      if (applyingTimeoutRef.current) window.clearTimeout(applyingTimeoutRef.current);
    };
  }, []);

  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentProfile, setStudentProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [notExpectedCount, setNotExpectedCount] = useState(null);

  const [checklistOpen, setChecklistOpen] = useState(false);
  const [checklistLoading, setChecklistLoading] = useState(false);
  const [checklistItems, setChecklistItems] = useState([]);
  const [checklistDesk, setChecklistDesk] = useState(null);
  const [checklistStudent, setChecklistStudent] = useState(null);

  const [, setChecklistCacheState] = useState({});
  const checklistCacheRef = useRef({});
  const commitChecklistCache = (next) => {
    checklistCacheRef.current = next;
    setChecklistCacheState(next);
  };

  const mergeCachedCounts = (studentsList, desksList) => {
    const cache = checklistCacheRef.current;
    if (Object.keys(cache).length === 0) return studentsList;
    const checklistDesks = desksList.filter((d) => d.hasChecklist !== false);

    return studentsList.map((s) => {
      let nextCells = s.cells;
      let touched = false;
      checklistDesks.forEach((d) => {
        const items = cache[cacheKey(s.id, d.id)];
        if (!items) return;
         const countable = items.filter(isCountableItem);
          const total = countable.length;
      const checked = countable.filter((i) => isItemMarked(i)).length;
        const prevCell = nextCells[d.key] || {};
        nextCells = { ...nextCells, [d.key]: { ...prevCell, checkedCount: checked, totalCount: total } };
        touched = true;
      });
      if (!touched) return s;
      const completedCount = Object.values(nextCells).filter((c) => c.time).length;
      return {
        ...s,
        cells: nextCells,
        completedCount,
        progress: s.totalDesks > 0 ? Math.round((completedCount / s.totalDesks) * 100) : s.progress,
        status: computeStatus(completedCount, s.totalDesks, s.arrivalDate),
      };
    });
  };

  const syncCellProgress = (student, desk, items) => {
    if (!student || !desk) return;
  const countable = items.filter(isCountableItem);
  const total = countable.length;
  const checked = countable.filter((i) => isItemMarked(i)).length;
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== student.id) return s;
        const prevCell = s.cells[desk.key] || {};
        const nextCells = { ...s.cells, [desk.key]: { ...prevCell, checkedCount: checked, totalCount: total } };
        const completedCount = Object.values(nextCells).filter((c) => c.time).length;
        return {
          ...s,
          cells: nextCells,
          completedCount,
          progress: s.totalDesks > 0 ? Math.round((completedCount / s.totalDesks) * 100) : s.progress,
          status: computeStatus(completedCount, s.totalDesks, s.arrivalDate),
        };
      })
    );
  };


  const openDeskChecklist = async (student, desk, e) => {
    e.stopPropagation();
    setChecklistStudent(student);
    setChecklistDesk(desk);
    setChecklistOpen(true);

    const key = cacheKey(student.id, desk.id);
    const cached = checklistCacheRef.current[key];
    if (cached) {
      setChecklistItems(cached);
      setChecklistLoading(false);
      return;
    }

    setChecklistLoading(true);
    try {
      const { data } = await getStudentChecklistLogs(student.id, desk.id);
      const rows = data?.data || data || [];
      setChecklistItems(rows);
      
      commitChecklistCache({ ...checklistCacheRef.current, [key]: rows });
      syncCellProgress(student, desk, rows);
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Unable to load checklist",
        text: err.response?.data?.message || "Something went wrong.",
      });
    } finally {
      setChecklistLoading(false);
    }
  };

  const closeDeskChecklist = () => {
    setChecklistOpen(false);
    setChecklistItems([]);
    setChecklistDesk(null);
    setChecklistStudent(null);
  };

  // `value` is what the modal wants to persist for this item:
  //  - "1"  -> checkbox checked
  //  - null -> checkbox unchecked / text field cleared
  //  - any other string -> the entered text for a text-type item
  const handleToggleChecklistItem = async (item, value) => {
    if (!checklistStudent || !checklistDesk) return;
    const key = cacheKey(checklistStudent.id, checklistDesk.id);
    const previousChecked = item.checked;

    const nextValue = value !== undefined ? value : (isItemMarked(item) ? null : "1");

    const optimisticItems = checklistItems.map((i) =>
      i.checklist_item_id === item.checklist_item_id ? { ...i, checked: nextValue, saving: true } : i
    );
    setChecklistItems(optimisticItems);
    commitChecklistCache({ ...checklistCacheRef.current, [key]: optimisticItems });
    syncCellProgress(checklistStudent, checklistDesk, optimisticItems);

    try {
      await updateChecklistItem(
        checklistStudent.id,
        checklistDesk.id,
        item.checklist_item_id,
        nextValue,
        user.id
      );

      const settledItems = optimisticItems.map((i) =>
        i.checklist_item_id === item.checklist_item_id ? { ...i, saving: false } : i
      );
      setChecklistItems(settledItems);
      commitChecklistCache({ ...checklistCacheRef.current, [key]: settledItems });
      syncCellProgress(checklistStudent, checklistDesk, settledItems);
      loadStudents({ silent: true });
    } catch (err) {
      console.error(err);
      const revertedItems = optimisticItems.map((i) =>
        i.checklist_item_id === item.checklist_item_id ? { ...i, checked: previousChecked, saving: false } : i
      );
      setChecklistItems(revertedItems);
      commitChecklistCache({ ...checklistCacheRef.current, [key]: revertedItems });
      syncCellProgress(checklistStudent, checklistDesk, revertedItems);
      Swal.fire({
        icon: "error",
        title: "Unable to update item",
        text: err.response?.data?.message || "Something went wrong.",
      });
    }
  };

  const openStudentProfile = async (student) => {
    try {
      setSelectedStudent(student);
      setLoadingProfile(true);
      const { data } = await getStudentInfo(student.email);
      setStudentProfile(data.student);
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Unable to load student",
        text: err.response?.data?.message || "Something went wrong.",
      });
    } finally {
      setLoadingProfile(false);
    }
  };

  const deskAccentPalette = [C.brass, C.rose, C.green, C.amber];
  const deskAccentSoft = [C.brassSoft, C.roseSoft, C.greenSoft, C.amberSoft];
const CHECKLIST_PREFETCH_CONCURRENCY = 6;
const loadStudents = async ({ silent = false } = {}) => {
  try {
    if (!silent) setLoading(true);
    setError(null);

    const res = await getStudentOverview();
    const overviewData = res.data.data;

    const checklistLogs = {};
    const pairs = [];
    overviewData.students.forEach((student) => {
      overviewData.desks.forEach((desk) => {
        pairs.push({ student, desk });
      });
    });

    await mapWithConcurrency(pairs, CHECKLIST_PREFETCH_CONCURRENCY, async ({ student, desk }) => {
      const { data } = await getStudentChecklistLogs(student.id, desk.id);
      const rows = data?.data || data || [];
      checklistLogs[cacheKey(student.id, desk.id)] = rows;
    });

    // NEW: this sweep already fetched everything prefetchAllChecklists would
    // fetch again — feed it straight into the cache so the second pass is
    // unnecessary.
    commitChecklistCache({ ...checklistCacheRef.current, ...checklistLogs });

    const { desks: normalizedDesks, students: normalizedStudents } =
      normalizeOverview({ ...overviewData, checklistLogs });

    setDesks(normalizedDesks);
    setStudents(mergeCachedCounts(normalizedStudents, normalizedDesks));

    return { desks: normalizedDesks, students: normalizedStudents };
  } catch (err) {
    console.error(err);
    setError("Couldn't load student data. Please try again.");
    return null;
  } finally {
    if (!silent) setLoading(false);
  }
};

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search, selectedDate, statusTab, activeFilters, deskChecklistFilters]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await getDashboardData({
          mode: selectedDate === "all" ? "overall" : "daywise",
          date: selectedDate === "all" ? null : selectedDate,
        });
        if (cancelled) return;
        setNotExpectedCount(Number(res.data.stats?.notExpected?.value ?? 0));
      } catch (err) {
        if (!cancelled) setNotExpectedCount(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedDate]);

  const dates = useMemo(
    () => Array.from(new Set(students.map((s) => s.expectedDateKey).filter(Boolean))).sort(),
    [students]
  );

  const dateFiltered = useMemo(
    () => (selectedDate === "all" ? students : students.filter((s) => s.expectedDateKey === selectedDate)),
    [students, selectedDate]
  );

  const searchFiltered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return dateFiltered;
    return dateFiltered.filter(
      (s) => (s.email || "").toLowerCase().includes(q) || (s.name || "").toLowerCase().includes(q)
    );
  }, [dateFiltered, search]);

  const selectedDeskKeys = useMemo(
    () => activeFilters.filter((f) => f.category === "desk").map((f) => f.value),
    [activeFilters]
  );
  const selectedGenders = useMemo(
    () => activeFilters.filter((f) => f.category === "gender").map((f) => f.value),
    [activeFilters]
  );
  const selectedArrived = useMemo(
    () => activeFilters.filter((f) => f.category === "arrived").map((f) => f.value),
    [activeFilters]
  );

  const isFilterSelected = (category, value) => activeFilters.some((f) => f.category === category && f.value === value);

  const toggleFilter = (category, value, label) => {
    setActiveFilters((prev) =>
      prev.some((f) => f.category === category && f.value === value)
        ? prev.filter((f) => !(f.category === category && f.value === value))
        : [...prev, { category, value, label }]
    );
  };

  const removeFilter = (category, value) => {
    setActiveFilters((prev) => prev.filter((f) => !(f.category === category && f.value === value)));
  };

  const clearAllFilters = () => {
    setActiveFilters([]);
    setSelectedDate("all");
    setDeskChecklistFilters({});
  };

  const matchesDeskChecklistFilters = (s) =>
    Object.entries(deskChecklistFilters).every(([deskKey, f]) => {
      const cell = s.cells[deskKey];
      const checked = cell?.checkedCount ?? 0;
      const total = cell?.totalCount ?? 0;
      if (f.type === "pending") return checked === 0;
      if (f.type === "verified") return total > 0 && checked === total;
      if (f.type === "eq") return checked === Number(f.value);
      return true;
    });

  const deskFiltered = useMemo(
    () =>
      searchFiltered.filter((s) => {
        const deskOk = selectedDeskKeys.length === 0 || selectedDeskKeys.every((key) => Boolean(s.cells[key]?.time));
        const genderOk = selectedGenders.length === 0 || selectedGenders.includes((s.gender || "").toLowerCase());
        const arrivedOk =
          selectedArrived.length === 0 ||
          selectedArrived.includes(s.remarks && s.remarks.trim() !== "" ? "yes" : "no");
        return deskOk && genderOk && arrivedOk && matchesDeskChecklistFilters(s);
      }),
    [searchFiltered, selectedDeskKeys, selectedGenders, selectedArrived, deskChecklistFilters]
  );

  const unexpectedArrivals = useMemo(() => {
    const q = search.trim().toLowerCase();

    const base = students.filter((s) => {
      if (selectedDate === "all") {
        return s.isUnexpectedArrival;
      }
      return s.arrivalDateKey === selectedDate && s.expectedDateKey !== selectedDate;
    });

    return base.filter((s) => {
      const searchOk = !q || (s.email || "").toLowerCase().includes(q) || (s.name || "").toLowerCase().includes(q);
      const deskOk = selectedDeskKeys.length === 0 || selectedDeskKeys.every((key) => Boolean(s.cells[key]?.time));
      const genderOk = selectedGenders.length === 0 || selectedGenders.includes((s.gender || "").toLowerCase());
      const arrivedOk = selectedArrived.length === 0 || selectedArrived.includes(s.arrivalDate ? "yes" : "no");
      return searchOk && deskOk && genderOk && arrivedOk && matchesDeskChecklistFilters(s);
    });
  }, [students, selectedDate, search, selectedDeskKeys, selectedGenders, selectedArrived, deskChecklistFilters]);

  const hasExtraFilters =
    Boolean(search.trim()) ||
    selectedDeskKeys.length > 0 ||
    selectedGenders.length > 0 ||
    selectedArrived.length > 0 ||
    Object.keys(deskChecklistFilters).length > 0;

  const counts = useMemo(() => {
    const c = {
      all: deskFiltered.length,
      completed: 0,
      inprogress: 0,
      expected: 0,
      unexpected: hasExtraFilters ? unexpectedArrivals.length : (notExpectedCount ?? unexpectedArrivals.length),
    };
    deskFiltered.forEach((s) => {
      const key = s.status.toLowerCase();
      if (key === "completed") c.completed++;
      else if (key === "in_progress") c.inprogress++;
      else c.expected++;
    });
    return c;
  }, [deskFiltered, unexpectedArrivals, notExpectedCount, hasExtraFilters]);

  const visibleStudents = useMemo(() => {
    if (statusTab === "all") return deskFiltered;
    if (statusTab === "completed") return deskFiltered.filter((s) => s.status === "COMPLETED");
    if (statusTab === "inprogress") return deskFiltered.filter((s) => s.status === "IN_PROGRESS");
    if (statusTab === "unexpected") return unexpectedArrivals;
    return deskFiltered.filter((s) => s.status === "EXPECTED");
  }, [deskFiltered, statusTab, unexpectedArrivals]);

  const totalPages = Math.max(1, Math.ceil(visibleStudents.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginatedStudents = useMemo(
    () => visibleStudents.slice((safePage - 1) * pageSize, safePage * pageSize),
    [visibleStudents, safePage]
  );
  const pageNumbers = getPageNumbers(safePage, totalPages);
  const rangeStart = visibleStudents.length === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const rangeEnd = Math.min(safePage * pageSize, visibleStudents.length);

  const statusTabs = [
    { key: "all", label: "All Students", icon: Users, count: counts.all },
    { key: "completed", label: "Completed", icon: CheckCircle2, count: counts.completed },
    { key: "inprogress", label: "In Progress", icon: Clock3, count: counts.inprogress },
    { key: "expected", label: "Not Arrived", icon: CircleDashed, count: counts.expected },
    { key: "unexpected", label: "Unexpected Arrivals", icon: AlertTriangle, count: counts.unexpected },
  ];

const handleExport = async () => {
    setExportLoading(true);
    try {
        const { data } = await exportReport({
            date: selectedDate,
            status: statusTab
        });
        console.log(data);
       const today = new Date().toISOString().split("T")[0];

      generateWorkbook(
        data.data,
        `Onboarding_Report_${today}.xlsx`
      );
    } catch (err) {
        console.error(err);
    } finally {
        setExportLoading(false);
    }
};

const checklistFilterDesks = useMemo(
  () => desks.filter((d) => d.hasChecklist !== false),
  [desks]
);

  const filterCategories = [
    { key: "daywise", label: "Daywise", icon: Calendar },
    { key: "desk", label: "Desk", icon: LayoutGrid },
    { key: "gender", label: "Gender", icon: UserIcon },
    { key: "arrived", label: "Has Remarks", icon: Check },
  ];

  const totalActiveFilterCount =
    activeFilters.length + (selectedDate !== "all" ? 1 : 0) + Object.keys(deskChecklistFilters).length;

  const deskChecklistFilterLabel = (f) => {
    if (f.type === "pending") return "Pending";
    if (f.type === "verified") return "Verified";
    if (f.type === "eq") return `= ${f.value}`;
    return "";
  };

  const checklistCompletionTime =
    checklistStudent && checklistDesk ? checklistStudent.cells[checklistDesk.key]?.time : null;

  return (
    <div style={{ background: C.bg, minHeight: "100%" }} className="transition-colors duration-300 p-6 md:p-10">
      <div className="mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 lg:hidden"
              style={{ background: C.panel, border: `1px solid ${C.hairline}`, color: C.text, boxShadow: C.cardShadow }}
            >
              <Menu size={18} />
            </button>
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] uppercase" style={{ color: C.brass }}>
                Student Operations
              </p>
              <h1 className="text-4xl md:text-5xl font-semibold mt-2" style={{ color: C.text }}>
                Student Wise Detail
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleDark}
              className="w-11 h-11 rounded-xl flex items-center justify-center transition shrink-0"
              style={{ background: C.panel, border: `1px solid ${C.hairline}`, color: C.brass, boxShadow: C.cardShadow }}
              title={dark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {dark ? <Sun size={17} /> : <Moon size={17} />}
            </button>
          </div>
        </div>

        <p className="text-sm mb-4" style={{ color: C.muted }}>
          Browse onboarding progress by day and status.
        </p>

        {error && (
          <div
            className="rounded-2xl p-4 mb-4 flex items-center justify-between gap-4"
            style={{ background: C.roseSoft, border: `1px solid ${C.rose}` }}
          >
            <p className="text-sm font-medium" style={{ color: C.rose }}>
              {error}
            </p>
            <button
              onClick={loadStudents}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white shrink-0"
              style={{ background: C.rose }}
            >
              Retry
            </button>
          </div>
        )}

        {loading && students.length === 0 && !error ? (
          <div className="rounded-2xl py-20 text-center" style={{ background: C.panel, border: `1px solid ${C.hairline}` }}>
            <p className="text-sm" style={{ color: C.muted }}>
              Loading students…
            </p>
          </div>
        ) : (
          <>
            <div className="rounded-2xl p-4 mb-3" style={{ background: C.panel, border: `1px solid ${C.hairline}`, boxShadow: C.cardShadow }}>
              {(activeFilters.length > 0 || selectedDate !== "all" || Object.keys(deskChecklistFilters).length > 0) && (
                <div className="mb-4 pb-4" style={{ borderBottom: `1px solid ${C.hairline}` }}>
                  <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: C.brass }}>
                    Selected Filters
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {selectedDate !== "all" && (
                      <span
                        className="inline-flex items-center gap-2 pl-3 pr-1.5 py-1.5 rounded-lg text-xs font-medium"
                        style={{ background: C.brassSoft, color: C.brass, border: `1px solid ${C.brass}` }}
                      >
                        {formatDate(selectedDate)}
                        <button
                          onClick={() => setSelectedDate("all")}
                          className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                          style={{ background: C.brass, color: "#fff" }}
                        >
                          <X size={10} />
                        </button>
                      </span>
                    )}
                    {activeFilters.map((f) => (
                      <span
                        key={`${f.category}-${f.value}`}
                        className="inline-flex items-center gap-2 pl-3 pr-1.5 py-1.5 rounded-lg text-xs font-medium"
                        style={{ background: C.brassSoft, color: C.brass, border: `1px solid ${C.brass}` }}
                      >
                        {f.label}
                        <button
                          onClick={() => removeFilter(f.category, f.value)}
                          className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                          style={{ background: C.brass, color: "#fff" }}
                        >
                          <X size={10} />
                        </button>
                      </span>
                    ))}
                    {Object.entries(deskChecklistFilters).map(([deskKey, f]) => {
                      const desk = desks.find((d) => d.key === deskKey);
                      return (
                        <span
                          key={`deskchk-${deskKey}`}
                          className="inline-flex items-center gap-2 pl-3 pr-1.5 py-1.5 rounded-lg text-xs font-medium"
                          style={{ background: C.brassSoft, color: C.brass, border: `1px solid ${C.brass}` }}
                        >
                          {desk?.title || deskKey}: {deskChecklistFilterLabel(f)}
                          <button
                            onClick={() => removeDeskChecklistFilter(deskKey)}
                            className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                            style={{ background: C.brass, color: "#fff" }}
                          >
                            <X size={10} />
                          </button>
                        </span>
                      );
                    })}
                    {totalActiveFilterCount > 0 && (
                      <button onClick={clearAllFilters} className="flex items-center gap-1 text-xs font-medium ml-1" style={{ color: C.muted }}>
                        <X size={12} /> Clear all
                      </button>
                    )}
                  </div>
                </div>
              )}

              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: C.brass }}>
                    Filter by
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {filterCategories.map((cat) => {
                      const Icon = cat.icon;
                      const isOpen = activeCategory === cat.key;
                      const activeCount =
                        cat.key === "daywise"
                          ? selectedDate !== "all"
                            ? 1
                            : 0
                          : cat.key === "desk"
                          ? activeFilters.filter((f) => f.category === "desk").length +
                            Object.keys(deskChecklistFilters).filter((key) =>
                              checklistFilterDesks.some((d) => d.key === key)
                            ).length
                          : activeFilters.filter((f) => f.category === cat.key).length;

                      return (
                        <button
                          key={cat.key}
                          onClick={() => toggleCategory(cat.key)}
                          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors"
                          style={{
                            background: isOpen || activeCount > 0 ? C.brassSoft : C.panel2,
                            borderColor: isOpen || activeCount > 0 ? C.brass : C.hairline,
                            color: isOpen || activeCount > 0 ? C.brass : C.text,
                          }}
                        >
                          <Icon size={15} />
                          {cat.label}
                          {activeCount > 0 && (
                            <span
                              className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[11px] font-semibold text-white"
                              style={{ background: C.brass }}
                            >
                              {activeCount}
                            </span>
                          )}
                          <ChevronDown
                            size={14}
                            style={{
                              transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                              transition: "transform 150ms ease",
                            }}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex gap-2.5">
                  <div className="relative w-full lg:w-64">
                    <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: C.muted }} />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search student by name or email..."
                      className="w-full pl-10 pr-4 h-11 rounded-xl outline-none transition text-sm"
                      style={{ background: C.panel2, border: `1px solid ${C.hairline}`, color: C.text }}
                    />
                  </div>
                  <button
                    onClick={handleExport}
                    disabled={exportLoading}
                    className="h-11 px-4 rounded-xl flex items-center gap-2 text-sm font-medium text-white transition-all duration-200 shrink-0 disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{
                      background: C.brass,
                      cursor: exportLoading ? "not-allowed" : "pointer",
                    }}
                  >
                    {exportLoading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Exporting Excel...
                      </>
                    ) : (
                      <>
                        <Download size={16} />
                        Export Excel
                      </>
                    )}
                  </button>
                </div>
              </div>

              {activeCategory && (
                <div ref={filterBarRef} className="flex flex-wrap items-center gap-2 mt-4 pt-4" style={{ borderTop: `1px solid ${C.hairline}` }}>
                  {activeCategory === "daywise" &&
                    dates.map((d) => {
                      const active = selectedDate === d;
                      return (
                        <button
                          key={d}
                          onClick={() => setSelectedDate(active ? "all" : d)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-colors"
                          style={
                            active
                              ? { background: C.brass, borderColor: C.brass, color: "#fff" }
                              : { background: C.panel2, borderColor: C.hairline, color: C.text }
                          }
                        >
                          <Calendar size={14} />
                          {formatDate(d)}
                        </button>
                      );
                    })}
                  {activeCategory === "daywise" && dates.length === 0 && (
                    <p className="text-xs" style={{ color: C.mutedSoft }}>
                      No admission dates yet
                    </p>
                  )}

                  {activeCategory === "desk" &&
                    desks.map((col) => {
                      const isChecklistFilterDesk = checklistFilterDesks.some((d) => d.key === col.key);
                      if (isChecklistFilterDesk) {
                        return (
                          <DeskChecklistFilterControl
                            key={col.key}
                            desk={col}
                            filter={deskChecklistFilters[col.key] || null}
                            onChange={(filter) => setDeskChecklistFilter(col.key, filter)}
                            C={C}
                          />
                        );
                      }
                      const DeskIcon = col.icon;
                      const active = isFilterSelected("desk", col.key);
                      return (
                        <button
                          key={col.key}
                          onClick={() => toggleFilter("desk", col.key, col.title)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-colors"
                          style={
                            active
                              ? { background: C.brass, borderColor: C.brass, color: "#fff" }
                              : { background: C.panel2, borderColor: C.hairline, color: C.text }
                          }
                        >
                          <DeskIcon size={14} />
                          {col.title}
                        </button>
                      );
                    })}

                  {activeCategory === "gender" &&
                    ["Male", "Female"].map((g) => {
                      const value = g.toLowerCase();
                      const active = isFilterSelected("gender", value);
                      return (
                        <button
                          key={g}
                          onClick={() => toggleFilter("gender", value, g)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-colors"
                          style={
                            active
                              ? { background: C.brass, borderColor: C.brass, color: "#fff" }
                              : { background: C.panel2, borderColor: C.hairline, color: C.text }
                          }
                        >
                          <UserIcon size={14} />
                          {g}
                        </button>
                      );
                    })}

                  {activeCategory === "arrived" &&
                    [
                      { value: "yes", label: "Remarks" },
                      { value: "no", label: "No remarks" },
                    ].map((r) => {
                      const active = isFilterSelected("arrived", r.value);
                      return (
                        <button
                          key={r.value}
                          onClick={() => toggleFilter("arrived", r.value, r.label)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-colors"
                          style={
                            active
                              ? { background: C.brass, borderColor: C.brass, color: "#fff" }
                              : { background: C.panel2, borderColor: C.hairline, color: C.text }
                          }
                        >
                          {r.value === "yes" ? <Check size={10} /> : <Minus size={10} />}
                          {r.label}
                        </button>
                      );
                    })}
                </div>
              )}
            </div>

            <div className="mb-5">
              <div
                className="inline-flex flex-wrap rounded-2xl p-1 gap-1"
                style={{ background: C.panel, border: `1px solid ${C.hairline}`, boxShadow: C.cardShadow }}
              >
                {statusTabs.map((tab) => {
                  const Icon = tab.icon;
                  const active = statusTab === tab.key;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setStatusTab(tab.key)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all"
                      style={{ background: active ? C.brass : "transparent", color: active ? "#fff" : C.muted }}
                    >
                      <Icon size={14} />
                      {tab.label}
                      <span
                        className="inline-flex items-center justify-center min-w-[20px] h-[20px] px-1 rounded-full text-xs font-semibold"
                        style={{ background: active ? "rgba(255,255,255,0.25)" : C.hairlineSoft, color: active ? "#fff" : C.muted }}
                      >
                        {tab.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="relative">
              {filtersApplying && (
                <div
                  className="absolute inset-0 z-40 flex items-center justify-center rounded-2xl"
                  style={{ background: `${C.panel}dd`, backdropFilter: "blur(1px)" }}
                >
                  <div
                    className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium"
                    style={{ background: C.panel, border: `1px solid ${C.hairline}`, color: C.brass, boxShadow: C.cardShadow }}
                  >
                    <Loader2 size={18} className="animate-spin" />
                    Applying filters...
                  </div>
                </div>
              )}

              {visibleStudents.length === 0 ? (
                <div className="rounded-2xl py-16 text-center" style={{ background: C.panel, border: `1px solid ${C.hairline}` }}>
                  <p className="text-sm" style={{ color: C.muted }}>
                    No students match this search, date, filter and status combination.
                  </p>
                </div>
              ) : statusTab === "expected" ? (
                <div className="rounded-2xl overflow-hidden" style={{ background: C.panel, border: `1px solid ${C.hairline}`, boxShadow: C.cardShadow }}>
                  <table className="w-full table-auto">
                    <thead style={{ borderBottom: `1px solid ${C.hairline}` }}>
                      <tr>
                        <th className="px-5 py-4 text-left text-xs uppercase tracking-wider w-14" style={{ color: C.muted }}>
                          S.No.
                        </th>
                        <th className="px-5 py-4 text-left text-xs uppercase tracking-wider" style={{ color: C.muted }}>
                          Student
                        </th>
                        <th className="px-5 py-4 text-left text-xs uppercase tracking-wider w-[150px]" style={{ color: C.muted }}>
                          Onboarding day
                        </th>
                        <th className="px-5 py-4 text-right text-xs uppercase tracking-wider w-[160px]" style={{ color: C.muted }}>
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedStudents.map((student, index) => (
                        <tr
                          key={student.id}
                          onClick={() => openStudentProfile(student)}
                          className="cursor-pointer transition-colors"
                          style={{ borderBottom: `1px solid ${C.hairline}` }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = C.panel2)}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        >
                          <td className="px-3 py-3.5">
                            <span
                              className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-medium"
                              style={{ background: C.panel2, color: C.muted }}
                            >
                              {rangeStart + index}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <StudentIdentity student={student} C={C} />
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="text-sm" style={{ color: C.text }}>
                              {formatDate(student.expectedDate)}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <span
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border border-dashed"
                              style={{ color: C.muted, borderColor: C.hairline }}
                            >
                              <CircleDashed size={12} />
                              Awaiting check-in
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : statusTab === "unexpected" ? (
                <div className="rounded-2xl overflow-hidden" style={{ background: C.panel, border: `1px solid ${C.hairline}`, boxShadow: C.cardShadow }}>
                  <table className="w-full table-auto">
                    <thead style={{ borderBottom: `1px solid ${C.hairline}` }}>
                      <tr>
                        <th className="px-5 py-4 text-left text-xs uppercase tracking-wider w-14" style={{ color: C.muted }}>
                          S.No.
                        </th>
                        <th className="px-5 py-4 text-left text-xs uppercase tracking-wider" style={{ color: C.muted }}>
                          Student
                        </th>
                        <th className="px-5 py-4 text-left text-xs uppercase tracking-wider w-[150px]" style={{ color: C.muted }}>
                          Expected day
                        </th>
                        <th className="px-5 py-4 text-left text-xs uppercase tracking-wider w-[150px]" style={{ color: C.muted }}>
                          Actual arrival
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedStudents.map((student, index) => (
                        <tr
                          key={student.id}
                          onClick={() => openStudentProfile(student)}
                          className="cursor-pointer transition-colors"
                          style={{ borderBottom: `1px solid ${C.hairline}` }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = C.panel2)}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        >
                          <td className="px-3 py-3.5">
                            <span
                              className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-medium"
                              style={{ background: C.panel2, color: C.muted }}
                            >
                              {rangeStart + index}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <StudentIdentity student={student} C={C} />
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="text-sm" style={{ color: C.text }}>
                              {formatDate(student.expectedDate)}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="text-sm font-medium" style={{ color: C.rose }}>
                              {formatDate(student.arrivalDate)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="rounded-2xl overflow-hidden" style={{ background: C.panel, border: `1px solid ${C.hairline}`, boxShadow: C.cardShadow }}>
                  <div className="overflow-x-auto">
                    <table
                      className="table-auto"
                      style={{ minWidth: `${644 + desks.length * 78}px`, width: "100%" }}
                    >
                      <thead className="sticky top-0 z-20" style={{ background: C.panel, borderBottom: `1px solid ${C.hairline}` }}>
                        <tr>
                          <th className="px-2 py-4 text-left text-xs uppercase tracking-wider w-9" style={{ color: C.muted }}>
                            #
                          </th>
                          <th className="px-4 py-4 text-left text-xs uppercase tracking-wider w-[200px]" style={{ color: C.muted }}>
                            Student
                          </th>
                          <th className="px-3 py-4 text-left text-xs uppercase tracking-wider w-[70px]" style={{ color: C.muted }}>
                            Expected
                          </th>
                          <th className="px-3 py-4 text-left text-xs uppercase tracking-wider w-[70px]" style={{ color: C.muted }}>
                            Arrival
                          </th>
                          <th className="px-3 py-4 text-left text-xs uppercase tracking-wider w-[70px]" style={{ color: C.muted }}>
                            Progress
                          </th>

                          {desks.map((col, i) => {
                            const Icon = col.icon;
                            const accent = deskAccentPalette[i % deskAccentPalette.length];
                            const accentSoft = deskAccentSoft[i % deskAccentSoft.length];
                            return (
                              <th key={col.key} className="px-2 py-3 text-center w-[78px]">
                                <div className="flex flex-col items-center gap-1">
                                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: accentSoft }}>
                                    <Icon size={13} style={{ color: accent }} />
                                  </div>
                                  <span className="text-[12px] font-semibold leading-tight text-center" style={{ color: C.text }}>
                                    {col.title}
                                  </span>
                                </div>
                              </th>
                            );
                          })}
                          <th className="px-2 py-3 text-center w-[78px]">
                            <div className="flex flex-col items-center gap-1">
                              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: C.brassSoft }}>
                                <Tag size={13} style={{ color: C.brass }} />
                              </div>
                              <span className="text-[12px] font-semibold" style={{ color: C.text }}>
                                Remarks
                              </span>
                            </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedStudents.map((student, index) => {
                          const progress = student.progress;
                          const isMismatch = student.isUnexpectedArrival;
                          return (
                            <tr
                              key={student.id}
                              onClick={() => openStudentProfile(student)}
                              className="cursor-pointer transition-colors"
                              style={{
                                borderBottom: `1px solid ${C.hairline}`,
                                boxShadow: isMismatch ? `inset 0 0 0 1px ${C.rose}` : "none",
                                background: isMismatch ? C.roseSoft : "transparent",
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.background = isMismatch ? C.roseSoft : C.panel2)}
                              onMouseLeave={(e) => (e.currentTarget.style.background = isMismatch ? C.roseSoft : "transparent")}
                            >
                              <td className="px-2 py-3">
                                <span
                                  className="inline-flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-medium"
                                  style={{ background: C.panel2, color: C.muted }}
                                >
                                  {rangeStart + index}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <StudentIdentity student={student} C={C} alert={isMismatch} />
                              </td>
                              <td className="px-3 py-3">
                                <span className="text-xs" style={{ color: C.text }}>
                                  {formatDate(student.expectedDate)}
                                </span>
                              </td>
                              <td className="px-3 py-3">
                                <span className="text-xs font-medium" style={{ color: isMismatch ? C.rose : C.text }}>
                                  {student.arrivalDate ? formatDate(student.arrivalDate) : "—"}
                                </span>
                              </td>
                             <td className="px-3 py-3">
                                <div className="flex flex-col items-center justify-center gap-1">
                                  <CircularProgress progress={progress} C={C} />

                                  <span
                                    className="text-[11px] font-semibold"
                                    style={{
                                      color:
                                        student.completedCount === student.totalDesks
                                          ? C.green
                                          : C.mutedSoft,
                                    }}
                                  >
                                    {student.completedCount}/{student.totalDesks}
                                  </span>
                                </div>
                              </td>
                              {desks.map((col) => {
                                const cell = student.cells[col.key] || {};
                                const isClickable = col.hasChecklist !== false && cell.totalCount !== 0;
                                return (
                                  <td key={col.key} className="px-2 py-3">
                                    <Cell
                                      time={cell.time}
                                      checkedCount={cell.checkedCount}
                                      totalCount={cell.totalCount}
                                      C={C}
                                      clickable={isClickable}
                                      onClick={(e) => openDeskChecklist(student, col, e)}
                                    />
                                  </td>
                                );
                              })}
                              <td className="px-2 py-3">
                                <div className="flex justify-center">
                                  {student.remarks?.trim() ? (
                                    <span
                                      className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium"
                                      style={{ background: C.greenSoft, color: C.green }}
                                    >
                                      <Check size={9} />
                                      Yes
                                    </span>
                                  ) : (
                                    <span
                                      className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium"
                                      style={{ background: C.panel2, color: C.mutedSoft, border: `1px solid ${C.hairline}` }}
                                    >
                                      No
                                    </span>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {visibleStudents.length > 0 && (
              <div className="mt-5 rounded-2xl" style={{ background: C.panel, border: `1px solid ${C.hairline}`, boxShadow: C.cardShadow }}>
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 px-5 py-4">
                  <div>
                    <p className="text-sm font-medium" style={{ color: C.text }}>
                      Showing <span className="font-bold">{rangeStart}–{rangeEnd}</span> of{" "}
                      <span className="font-bold">{visibleStudents.length}</span> students
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: C.muted }}>
                      Page {safePage} of {totalPages}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      disabled={safePage === 1}
                      onClick={() => setPage(1)}
                      className="w-9 h-9 rounded-lg flex items-center justify-center transition disabled:opacity-40"
                      style={{ border: `1px solid ${C.hairline}`, color: C.muted }}
                    >
                      <ChevronsLeft size={16} />
                    </button>
                    <button
                      disabled={safePage === 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className="w-9 h-9 rounded-lg flex items-center justify-center transition disabled:opacity-40"
                      style={{ border: `1px solid ${C.hairline}`, color: C.muted }}
                    >
                      <ChevronLeft size={16} />
                    </button>

                    {pageNumbers.map((p, i) =>
                      p === "..." ? (
                        <div key={`e-${i}`} className="px-1 font-semibold" style={{ color: C.muted }}>
                          ...
                        </div>
                      ) : (
                        <button
                          key={p}
                          onClick={() => setPage(p)}
                          className="w-9 h-9 rounded-lg font-semibold transition"
                          style={p === safePage ? { background: C.brass, color: "#fff" } : { color: C.text }}
                        >
                          {p}
                        </button>
                      )
                    )}

                    <button
                      disabled={safePage === totalPages}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      className="w-9 h-9 rounded-lg flex items-center justify-center transition disabled:opacity-40"
                      style={{ border: `1px solid ${C.hairline}`, color: C.muted }}
                    >
                      <ChevronRight size={16} />
                    </button>
                    <button
                      disabled={safePage === totalPages}
                      onClick={() => setPage(totalPages)}
                      className="w-9 h-9 rounded-lg flex items-center justify-center transition disabled:opacity-40"
                      style={{ border: `1px solid ${C.hairline}`, color: C.muted }}
                    >
                      <ChevronsRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      <StudentProfileModal
        open={!!selectedStudent}
        student={studentProfile}
        loading={loadingProfile}
        onClose={() => {
          setSelectedStudent(null);
          setStudentProfile(null);
        }}
        onRemarksSaved={(studentId, remarks) => {
          setStudentProfile((prev) => ({ ...prev, remarks }));
          setStudents((prev) =>
            prev.map((student) => (student.id === studentId ? { ...student, remarks } : student))
          );
        }}
        C={C}
      />
      <DeskChecklistModal
        open={checklistOpen}
        onClose={closeDeskChecklist}
        loading={checklistLoading}
        desk={checklistDesk}
        student={checklistStudent}
        items={checklistItems}
        completionTime={checklistCompletionTime}
        onToggleItem={handleToggleChecklistItem}
        C={C}
      />
    </div>
  );
}