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
  updateChecklistItem, // TODO: point this at your real update route (see note below)
} from "../../services/deskService";
import { getStudentInfo, updateStudentRemarks } from "../../services/settingServices";
import { getDashboardData } from "../../services/Dashboardservice";
import Swal from "sweetalert2";
import { useTheme } from "../../context/ThemeContext";
import { GhostButton, Modal, PrimaryButton } from "./Settings";

/* ============================================================
   DESK ICON MAPPING — desks now come from the backend, so we
   match known desk names to a nice icon and fall back to a
   generic one for anything we don't recognize.
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


function computeStatus(completedCount, totalDesks, arrivalDate) {
  if (totalDesks > 0 && completedCount === totalDesks) return "COMPLETED";
  if (arrivalDate) return "IN_PROGRESS";
  return "EXPECTED";
}

function normalizeOverview(payload) {
  const desksRaw = payload?.desks || [];
  const studentsRaw = payload?.students || [];

  const desks = desksRaw.map((d) => {
    // hasChecklist: prefer an explicit flag/count from the backend. Falls
    // back to `true` (clickable) if the backend doesn't send this yet —
    // add `has_checklist` (boolean) or `checklist_count` (number) to the
    // /desks payload to get the "no checklist -> not clickable" behavior.
    const hasChecklist =
      d.has_checklist ??
      d.hasChecklist ??
      (typeof d.checklist_count === "number" ? d.checklist_count > 0 : true);

    return {
      key: slugifyDeskName(d.desk_name),
      name: d.desk_name,
      id: d.id ?? d.desk_id,
      title: d.desk_name,
      icon: getDeskIcon(d.desk_name),
      hasChecklist,
    };
  });

  const students = studentsRaw.map((s) => {
    const totalDesks = s.totalDesks ?? desks.length;
    const completedCount = s.completedCount ?? 0;
    const arrivalDate = s.arrivalDate;

    const status = computeStatus(completedCount, totalDesks, arrivalDate);
    const progress = totalDesks > 0 ? Math.round((completedCount / totalDesks) * 100) : 0;

    // Each cell now carries the completion time (when done) AND, if the
    // backend sends it, the running checklist progress for that desk
    // (checked_count / total_count). This lets the table show "5/8"
    // while a desk is partway through, and the completion time once
    // every item on that desk is checked. Add `checked_count` /
    // `total_count` (or camelCase equivalents) to each desk entry in the
    // /overview payload to light this up — until then it gracefully
    // falls back to the old "Pending" label.
    const cells = {};
    desks.forEach((col) => {
      const entry = s.desks?.[col.name];

      const checkedCount = entry?.checkedCount ?? entry?.checked_count ?? null;
      const totalCount = entry?.totalCount ?? entry?.total_count ?? null;

      const time =
        entry && entry.status === "completed" && entry.time
          ? new Date(entry.time).toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            })
          : null;

      cells[col.key] = { time, checkedCount, totalCount };
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
      // Plain "YYYY-MM-DD" keys computed by MySQL (DATE_FORMAT), and a
      // ready-made unexpected-arrival flag computed with the exact same
      // predicate the dashboard's SQL uses. No date parsing/timezone
      // guessing needed on the frontend anymore.
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

// Runs `worker` over `items` with at most `limit` requests in flight at
// once. Used to bulk-prefetch every student/desk checklist without
// firing hundreds of requests simultaneously. A failure on one item is
// swallowed — that one pair just stays uncached rather than aborting
// the whole batch.
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

/* ============================================================
   DESK CHECKLIST MODAL — editable checklist for a single
   student + desk. Header shows "checked/total" while items are
   still outstanding, and swaps to the desk's completion time
   once every item is checked.
   ============================================================ */

function DeskChecklistModal({ open, onClose, loading, desk, student, items, completionTime, onToggleItem, C }) {
  if (!open) return null;

  const total = items.length;
  const checkedCount = items.filter((i) => i.checked === 1 || i.checked === true).length;
  const allDone = total > 0 && checkedCount === total;

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
            <div className="flex items-center gap-2">
              {allDone ? (
                <CheckCircle2 size={16} style={{ color: C.green }} />
              ) : (
                <Clock3 size={16} style={{ color: C.brass }} />
              )}
              <span className="text-sm font-semibold" style={{ color: allDone ? C.green : C.text }}>
                {allDone
                  ? completionTime
                    ? `Completed at ${completionTime}`
                    : "All items verified"
                  : `${checkedCount}/${total} items verified`}
              </span>
            </div>
            {!allDone && (
              <span className="text-xs font-medium" style={{ color: C.muted }}>
                {total - checkedCount} remaining
              </span>
            )}
          </div>

          <div className="space-y-3">
            {items.map((item) => {
              const isChecked = item.checked === 1 || item.checked === true;
              const isSaving = Boolean(item.saving);
              return (
                <label
                  key={item.checklist_item_id}
                  className="rounded-xl p-4 flex items-start gap-3 cursor-pointer"
                  style={{ background: C.panel2, border: `1px solid ${C.hairline}` }}
                >
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
                        onChange={() => onToggleItem(item)}
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
                    {item.remarks ? (
                      <p className="text-xs mt-1" style={{ color: C.muted }}>
                        {item.remarks}
                      </p>
                    ) : null}
                  </div>
                </label>
              );
            })}
          </div>
        </>
      )}
    </Modal>
  );
}

// Table-cell summary of a single desk for a single student.
//  - time set, counts known  -> completed, show "9:45 | 10/10" (green)
//  - time set, no counts     -> completed, show just the time (green)
//  - no time, checkedCount>0 -> in progress, show "8/10" instead of
//                                "Pending" (brass)
//  - neither                 -> nothing started yet, show "Pending" (dashed)
// `clickable` is false when the desk has no checklist configured at all,
// or when this specific student/desk pair reports totalCount === 0 — in
// both cases the cell renders as plain text, not a button.
function Cell({ time, checkedCount, totalCount, C, onClick, clickable = true }) {
  const hasCounts = typeof totalCount === "number" && totalCount > 0;
  const hasVerified = hasCounts && (checkedCount ?? 0) > 0;

  let content;
  if (time) {
    content = (
      <span
        className="inline-flex items-center px-2.5 py-1 rounded-full border whitespace-nowrap"
        style={{ background: C.greenSoft, borderColor: C.greenSoft }}
      >
        <span className="text-xs font-medium whitespace-nowrap" style={{ color: C.green }}>
          {hasCounts ? `${time} | ${checkedCount ?? 0}/${totalCount}` : time}
        </span>
      </span>
    );
  } else if (hasVerified) {
    content = (
      <span
        className="inline-flex items-center px-2.5 py-1 rounded-full border whitespace-nowrap"
        style={{ background: C.brassSoft, borderColor: C.brassSoft }}
      >
        <span className="text-xs font-medium whitespace-nowrap" style={{ color: C.brass }}>
          {checkedCount}/{totalCount}
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

function StudentIdentity({ student, C }) {
  const name = student.name || "—";
  return (
    <div className="flex items-center gap-3">
      <div
        className="w-9 h-9 rounded-full text-white flex items-center justify-center font-semibold shrink-0"
        style={{ background: `linear-gradient(135deg,${C.brass},${C.green})` }}
      >
        {name.charAt(0).toUpperCase()}
      </div>
      <div>
        <h3 className="font-semibold text-sm" style={{ color: C.text }}>
          {name}
        </h3>
        <p className="text-xs" style={{ color: C.muted }}>
          {student.email}
        </p>
      </div>
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
          {/* Header */}
          <div
            className="rounded-2xl p-5 mb-6 flex items-center justify-between"
            style={{
              background: C.panel2,
              border: `1px solid ${C.hairline}`,
            }}
          >
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold"
                style={{
                  background: C.brassSoft,
                  color: C.brass,
                }}
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

                <div className="flex gap-2 mt-2">
                  <span
                    className="px-3 py-1 rounded-full text-xs font-medium"
                    style={{
                      background: C.greenSoft,
                      color: C.green,
                    }}
                  >
                    {student?.status}
                  </span>

                  <span
                    className="px-3 py-1 rounded-full text-xs font-medium"
                    style={{
                      background: C.panel,
                      color: C.muted,
                    }}
                  >
                    {student?.admission_year}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Sections */}
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

          {/* Remarks */}
          <div
            className="mt-6 rounded-2xl p-5"
            style={{
              background: C.panel2,
              border: `1px solid ${C.hairline}`,
            }}
          >
            <label className="block text-sm font-semibold mb-3" style={{ color: C.text }}>
              Internal Remarks
            </label>

            <textarea
              rows={4}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Add remarks..."
              className="w-full rounded-xl p-3 resize-none outline-none"
              style={{
                background: C.panel,
                border: `1px solid ${C.hairline}`,
                color: C.text,
              }}
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
    <div
      className="rounded-2xl p-5"
      style={{
        background: C.panel2,
        border: `1px solid ${C.hairline}`,
      }}
    >
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

/* ============================================================
   PAGE
   ============================================================ */

export default function AdmissionOverviewPage() {
  const { dark, toggleDark, C } = useTheme();
  const { setOpen: setSidebarOpen } = useOutletContext();
  const [students, setStudents] = useState([]);
  const [desks, setDesks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState("all");
  const [statusTab, setStatusTab] = useState("all");
  const [search, setSearch] = useState("");

  // which single category dropdown is currently open (daywise | desk | gender | arrived | null)
  const [activeCategory, setActiveCategory] = useState(null);
  const toggleCategory = (key) => {
    setActiveCategory((prev) => (prev === key ? null : key));
  };
  const filterBarRef = useRef(null);
  const [activeFilters, setActiveFilters] = useState([]);

  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentProfile, setStudentProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Authoritative "not expected" count, sourced from the same dashboard
  // endpoint the Dashboard page uses: getOverallDashboardData when viewing
  // "All dates" (selectedDate === "all"), or getDaywiseDashboardData when
  // a specific date is selected. This guarantees both pages always agree.
  const [notExpectedCount, setNotExpectedCount] = useState(null);

  // ---- desk checklist modal state ----
  const [checklistOpen, setChecklistOpen] = useState(false);
  const [checklistLoading, setChecklistLoading] = useState(false);
  const [checklistItems, setChecklistItems] = useState([]);
  const [checklistDesk, setChecklistDesk] = useState(null);
  const [checklistStudent, setChecklistStudent] = useState(null);

  // ---- checklist cache ---------------------------------------------
  // Every (student, desk) checklist is fetched once, in bulk, right
  // after the overview loads — not lazily when a cell is clicked. That's
  // what makes "8/10"-style counts visible on every row immediately,
  // instead of only after opening that cell's modal. Keyed by
  // "<studentId>:<deskId>". A ref mirrors the state so reads are always
  // synchronous and never see a stale value while updates are in flight.
  const [, setChecklistCacheState] = useState({});
  const checklistCacheRef = useRef({});
  const commitChecklistCache = (next) => {
    checklistCacheRef.current = next;
    setChecklistCacheState(next);
  };
  const cacheKey = (studentId, deskId) => `${studentId}:${deskId}`;

  // Overlays every cached checklist's checked/total counts onto a
  // students list. Used both right after the bulk prefetch, and after
  // any background overview refresh, so a fresh fetch from /overview
  // (which likely doesn't know per-item counts at all) never wipes out
  // counts we've already learned from the checklist endpoint.
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
        const total = items.length;
        const checked = items.filter((i) => i.checked === 1 || i.checked === true).length;
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

  // Pushes the live checked/total counts for one student+desk straight
  // into the `students` table state — used for instant optimistic
  // updates while a single checkbox is being toggled.
  const syncCellProgress = (student, desk, items) => {
    if (!student || !desk) return;
    const total = items.length;
    const checked = items.filter((i) => i.checked === 1 || i.checked === true).length;
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

  const CHECKLIST_PREFETCH_CONCURRENCY = 6;

  // Fetches every (student, desk-with-a-checklist) pair once, bounded to
  // a handful of requests in flight at a time, right after the overview
  // loads. After this settles every cell already knows its real
  // checked/total counts — no per-row click required.
  //
  // NOTE: this is N(students) x M(desks with checklists) requests. Fine
  // for a few hundred rows; for a much larger roster the real fix is
  // having /overview return `checked_count`/`total_count` per desk
  // directly (see normalizeOverview above) so this prefetch becomes
  // unnecessary entirely. Until then, this is the batched, "fetch it all
  // up front" approach.
  const prefetchAllChecklists = async (studentsList, desksList) => {
    const checklistDesks = desksList.filter((d) => d.hasChecklist !== false);
    if (checklistDesks.length === 0 || studentsList.length === 0) return;

    const pairs = [];
    studentsList.forEach((s) => {
      checklistDesks.forEach((d) => pairs.push({ student: s, desk: d }));
    });

    const fetched = { ...checklistCacheRef.current };

    await mapWithConcurrency(pairs, CHECKLIST_PREFETCH_CONCURRENCY, async ({ student, desk }) => {
      const { data } = await getStudentChecklistLogs(student.id, desk.id);
      const rows = data?.data || data || [];
      fetched[cacheKey(student.id, desk.id)] = rows;
    });

    commitChecklistCache(fetched);
    setStudents((prev) => mergeCachedCounts(prev, desksList));
  };

  const openDeskChecklist = async (student, desk, e) => {
    e.stopPropagation(); // don't trigger the row's profile-open click
    setChecklistStudent(student);
    setChecklistDesk(desk);
    setChecklistOpen(true);

    const key = cacheKey(student.id, desk.id);
    const cached = checklistCacheRef.current[key];
    if (cached) {
      // Already fetched during the bulk prefetch (or a prior open) —
      // opens instantly, no spinner, no extra request.
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

  const handleToggleChecklistItem = async (item) => {
    if (!checklistStudent || !checklistDesk) return;
    const key = cacheKey(checklistStudent.id, checklistDesk.id);
    const previousChecked = item.checked;
    const nextChecked = previousChecked === 1 || previousChecked === true ? 0 : 1;

    // optimistic update, mark this row as saving, and reflect the new
    // count in the table and the cache immediately.
    const optimisticItems = checklistItems.map((i) =>
      i.checklist_item_id === item.checklist_item_id ? { ...i, checked: nextChecked, saving: true } : i
    );
    setChecklistItems(optimisticItems);
    commitChecklistCache({ ...checklistCacheRef.current, [key]: optimisticItems });
    syncCellProgress(checklistStudent, checklistDesk, optimisticItems);

    try {
      // TODO: adjust to match your real backend route/method for
      // updating a single checklist item's checked state.
      await updateChecklistItem(checklistStudent.id, checklistDesk.id, item.checklist_item_id, nextChecked);

      const settledItems = optimisticItems.map((i) =>
        i.checklist_item_id === item.checklist_item_id ? { ...i, saving: false } : i
      );
      setChecklistItems(settledItems);
      commitChecklistCache({ ...checklistCacheRef.current, [key]: settledItems });
      syncCellProgress(checklistStudent, checklistDesk, settledItems);

      // Silent background refresh, purely to pick up the completion
      // time/status once every item on this desk is checked — we merge
      // the cache back in afterwards, so this never reverts the counts
      // we already know.
      loadStudents({ silent: true });
    } catch (err) {
      console.error(err);
      // revert on failure
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
      // console.log(data);

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

  const loadStudents = async ({ silent = false } = {}) => {
    try {
      if (!silent) setLoading(true);
      setError(null);
      const res = await getStudentOverview();
      const { desks: normalizedDesks, students: normalizedStudents } = normalizeOverview(res.data.data);
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
    (async () => {
      const result = await loadStudents();
      if (result) {
        // Kick off the bulk checklist fetch once we know who the
        // students and desks are — it runs in the background and fills
        // in counts as it completes, it doesn't block the table.
        prefetchAllChecklists(result.students, result.desks);
      }
    })();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search, selectedDate, statusTab, activeFilters]);

  // Fetch the authoritative "not expected" count from the same endpoints
  // the Dashboard page uses. "All dates" -> overall mode (global count,
  // across every student). A specific date -> daywise mode (scoped to
  // that single date), matching each backend query exactly.
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

  // ---- derive per-category selections from activeFilters ----
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
  };

  // desks: student must have completed ALL selected desks
  // gender / arrived: student must match ANY selected value in that category
  const deskFiltered = useMemo(
    () =>
      searchFiltered.filter((s) => {
        const deskOk = selectedDeskKeys.length === 0 || selectedDeskKeys.every((key) => Boolean(s.cells[key]?.time));
        const genderOk = selectedGenders.length === 0 || selectedGenders.includes((s.gender || "").toLowerCase());
       const arrivedOk =
        selectedArrived.length === 0 ||
        selectedArrived.includes(
          s.remarks && s.remarks.trim() !== "" ? "yes" : "no"
        );
        // console.log(s.arrivedOk);
        // console.log(s);
        return deskOk && genderOk && arrivedOk;
      }),
    [searchFiltered, selectedDeskKeys, selectedGenders, selectedArrived]
  );

  // Students whose arrival date doesn't match their expected date.
  // Uses the backend's precomputed keys directly — no date parsing here:
  //  - "All dates": isUnexpectedArrival (arrival_date IS NOT NULL AND
  //     DATE(arrival_date) <> expected_date, computed by MySQL)
  //  - Specific date: arrivalDateKey === date AND expectedDateKey !== date
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
      return searchOk && deskOk && genderOk && arrivedOk;
    });
  }, [students, selectedDate, search, selectedDeskKeys, selectedGenders, selectedArrived]);

  // Are any search/desk/gender/arrived filters currently narrowing the
  // list? Only in this "nothing extra applied" state does the backend's
  // global notExpectedCount describe the same population as
  // unexpectedArrivals — so it's only safe to show it then.
  const hasExtraFilters =
    Boolean(search.trim()) || selectedDeskKeys.length > 0 || selectedGenders.length > 0 || selectedArrived.length > 0;

  const counts = useMemo(() => {
    const c = {
      all: deskFiltered.length,
      completed: 0,
      inprogress: 0,
      expected: 0,
      // The badge must always describe what's actually rendered in the
      // "Unexpected Arrivals" tab. unexpectedArrivals already applies
      // search/desk/gender/arrived filters, so use its length directly.
      // Only when no extra filters are active do we additionally prefer
      // the backend's authoritative count (it matches the Dashboard
      // exactly in that unfiltered case) — falling back to the local
      // count if it hasn't loaded yet or the call failed.
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

  const handleExport = () => {
    const isExpected = statusTab === "expected";
    const isUnexpected = statusTab === "unexpected";
    let header, rows;

    // Renders each desk's cell as CSV-friendly text, matching what's
    // shown in the table: "9:45 | 10/10" once done, "8/10" while partly
    // verified, otherwise "Pending".
    const cellText = (s, d) => {
      const cell = s.cells[d.key];
      if (!cell) return "Pending";
      const hasCounts = typeof cell.totalCount === "number" && cell.totalCount > 0;
      if (cell.time) {
        return hasCounts ? `${cell.time} | ${cell.checkedCount ?? 0}/${cell.totalCount}` : cell.time;
      }
      if (hasCounts && (cell.checkedCount ?? 0) > 0) {
        return `${cell.checkedCount}/${cell.totalCount}`;
      }
      return "Pending";
    };

    if (isExpected) {
      header = ["#", "Name", "Email", "Onboarding Day", "Status"];
      rows = visibleStudents.map((s, i) => [i + 1, s.name, s.email, formatDate(s.expectedDate), "Awaiting check-in"]);
    } else if (isUnexpected) {
      header = ["#", "Name", "Email", "Expected Day", "Arrival Date"];
      rows = visibleStudents.map((s, i) => [i + 1, s.name, s.email, formatDate(s.expectedDate), formatDate(s.arrivalDate)]);
    } else {
      header = ["#", "Name", "Email", "Progress %", "Current Desk", ...desks.map((d) => d.title), "Remarks"];
      rows = visibleStudents.map((s, i) => [
        i + 1,
        s.name,
        s.email,
        s.progress,
        s.currentDesk || "—",
        ...desks.map((d) => cellText(s, d)),
        s.remarks?.trim() ? "Yes" : "No",
      ]);
    }
    downloadCSV(rows, header, `students-${statusTab}-${selectedDate}.csv`);
  };

  const filterCategories = [
    { key: "daywise", label: "Daywise", icon: Calendar },
    { key: "desk", label: "Desk", icon: LayoutGrid },
    { key: "gender", label: "Gender", icon: UserIcon },
    { key: "arrived", label: "Has Remarks", icon: Check },
  ];

  const totalActiveFilterCount = activeFilters.length + (selectedDate !== "all" ? 1 : 0);

  // Completion time for the desk currently open in the checklist modal —
  // reuses the same formatted time already rendered in the table cell.
  const checklistCompletionTime =
    checklistStudent && checklistDesk ? checklistStudent.cells[checklistDesk.key]?.time : null;

  return (
    <div style={{ background: C.bg, minHeight: "100%" }} className="transition-colors duration-300 p-6 md:p-10">
      <div className="mx-auto">
        {/* ============ HEADER ============ */}
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

        {/* ---- error state ---- */}
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

        {/* ---- loading state ---- */}
        {loading && students.length === 0 && !error ? (
          <div className="rounded-2xl py-20 text-center" style={{ background: C.panel, border: `1px solid ${C.hairline}` }}>
            <p className="text-sm" style={{ color: C.muted }}>
              Loading students…
            </p>
          </div>
        ) : (
          <>
            {/* ---- filters bar (always visible, no toggle) ---- */}
            <div className="rounded-2xl p-4 mb-3" style={{ background: C.panel, border: `1px solid ${C.hairline}`, boxShadow: C.cardShadow }}>
              {/* selected filters — shown above the "Filter by" list */}
              {(activeFilters.length > 0 || selectedDate !== "all") && (
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
                  </div>
                </div>
              )}

              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                {/* category pills */}
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

                    {totalActiveFilterCount > 0 && (
                      <button onClick={clearAllFilters} className="flex items-center gap-1 text-xs font-medium ml-1" style={{ color: C.muted }}>
                        <X size={12} /> Clear all
                      </button>
                    )}
                  </div>
                </div>

                {/* search + export, in place of the old Filters toggle button */}
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
                    className="h-11 px-4 rounded-xl flex items-center gap-2 text-sm font-medium text-white transition shrink-0"
                    style={{ background: C.brass }}
                  >
                    <Download size={16} />
                    Export CSV
                  </button>
                </div>
              </div>

              {/* expanded options for the currently active category */}
              {activeCategory && (
                <div ref={filterBarRef} className="flex flex-wrap items-center gap-2 mt-4 pt-4" style={{ borderTop: `1px solid ${C.hairline}` }}>
                  {/* DAYWISE OPTIONS — single select, drives selectedDate */}
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

                  {/* DESK OPTIONS */}
                  {activeCategory === "desk" &&
                    desks.map((col) => {
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

                  {/* GENDER OPTIONS */}
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

                  {/* HAS ARRIVED OPTIONS */}
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

            {/* ---- status tabs ---- */}
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

            {/* ---- table / expected list / unexpected arrivals list ---- */}
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
                        #
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
                        #
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
                <div className="overflow-x-auto lg:overflow-x-visible">
                  <table className="w-full table-auto">
                    <thead className="sticky top-0 z-20" style={{ background: C.panel, borderBottom: `1px solid ${C.hairline}` }}>
                      <tr>
                        <th className="px-5 py-4 text-left text-xs uppercase tracking-wider w-14" style={{ color: C.muted }}>
                          #
                        </th>
                        <th className="px-5 py-4 text-left text-xs uppercase tracking-wider w-[260px]" style={{ color: C.muted }}>
                          Student
                        </th>
                        <th className="px-5 py-4 text-left text-xs uppercase tracking-wider w-[130px]" style={{ color: C.muted }}>
                          Progress
                        </th>

                        {desks.map((col, i) => {
                          const Icon = col.icon;
                          const accent = deskAccentPalette[i % deskAccentPalette.length];
                          const accentSoft = deskAccentSoft[i % deskAccentSoft.length];
                          return (
                            <th key={col.key} className="px-3 py-3.5 text-center w-[100px]">
                              <div className="flex flex-col items-center gap-1.5">
                                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: accentSoft }}>
                                  <Icon size={16} style={{ color: accent }} />
                                </div>
                                <span className="text-xs font-semibold" style={{ color: C.text }}>
                                  {col.title}
                                </span>
                              </div>
                            </th>
                          );
                        })}
                        <th className="px-3 py-3.5 text-center w-[110px]">
                          <div className="flex flex-col items-center gap-1.5">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: C.brassSoft }}>
                              <Tag size={16} style={{ color: C.brass }} />
                            </div>
                            <span className="text-xs font-semibold" style={{ color: C.text }}>
                              Remarks
                            </span>
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedStudents.map((student, index) => {
                        const progress = student.progress;
                        const isComplete = progress >= 100;
                        return (
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
                              <div className="w-[120px]">
                                <div className="flex justify-between text-xs mb-2">
                                  <span className="font-semibold" style={{ color: isComplete ? C.green : C.text }}>
                                    {progress}%
                                  </span>
                                  <span style={{ color: C.mutedSoft }}>
                                    {student.completedCount}/{student.totalDesks}
                                  </span>
                                </div>
                                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: C.hairlineSoft }}>
                                  <div
                                    className="h-1.5 rounded-full transition-all duration-300"
                                    style={{ width: `${progress}%`, background: isComplete ? C.green : C.brass }}
                                  />
                                </div>
                              </div>
                            </td>
                            {desks.map((col) => {
                              const cell = student.cells[col.key] || {};
                              // Not clickable when the desk itself has no
                              // checklist configured, OR when this specific
                              // student/desk pair explicitly reports zero
                              // checklist items (totalCount === 0).
                              const isClickable = col.hasChecklist !== false && cell.totalCount !== 0;
                              return (
                                <td key={col.key} className="px-3.5 py-3.5">
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
                            <td className="px-3.5 py-3.5">
                              <div className="flex justify-center">
                                {student.remarks?.trim() ? (
                                  <span
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                                    style={{
                                      background: C.greenSoft,
                                      color: C.green,
                                    }}
                                  >
                                    <Check size={10} />
                                    Yes
                                  </span>
                                ) : (
                                  <span
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                                    style={{
                                      background: C.panel2,
                                      color: C.mutedSoft,
                                      border: `1px solid ${C.hairline}`,
                                    }}
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

            {/* ---- pagination (functional) ---- */}
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
          setStudentProfile((prev) => ({
            ...prev,
            remarks,
          }));

          setStudents((prev) =>
            prev.map((student) =>
              student.id === studentId
                ? {
                    ...student,
                    remarks,
                  }
                : student
            )
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