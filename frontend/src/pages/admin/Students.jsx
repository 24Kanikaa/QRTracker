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
  SlidersHorizontal,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  CircleDashed,
  X,
  MessageSquare,
  Check,
  Minus,
  User as UserIcon,
  Tag,
} from "lucide-react";
import { getStudentOverview, } from "../../services/deskService";
import {getStudentInfo,updateStudentRemarks} from  "../../services/settingServices";
import Swal from "sweetalert2";
import { useTheme } from "../../context/ThemeContext";
import { GhostButton,Modal,PrimaryButton } from "./Settings";


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
  return (deskName || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "") || "desk";
}

/* ============================================================
   NORMALIZATION — maps the raw { desks, students } payload from
   getStudents() into the shape this page renders.
   ============================================================ */

function normalizeOverview(payload) {
  const desksRaw = payload?.desks || [];
  const studentsRaw = payload?.students || [];

  const desks = desksRaw.map((d) => ({
    key: slugifyDeskName(d.desk_name),
    name: d.desk_name,
    title: d.desk_name,
    icon: getDeskIcon(d.desk_name),
  }));

  const students = studentsRaw.map((s) => {
    const totalDesks = s.totalDesks ?? desks.length;
    const completedCount = s.completedCount ?? 0;

    let status = "EXPECTED";
    if (totalDesks > 0 && completedCount === totalDesks) status = "COMPLETED";
    else if (completedCount > 0) status = "IN_PROGRESS";

    const progress = totalDesks > 0 ? Math.round((completedCount / totalDesks) * 100) : 0;

    const cells = {};
    desks.forEach((col) => {
      const entry = s.desks?.[col.name];
      cells[col.key] =
        entry && entry.status === "completed" && entry.time
          ? new Date(entry.time).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
      : null;
    });

    return {
      id: s.id,
      name: s.name,
      rollNumber: s.rollNumber,
      applicationNumber: s.applicationNumber,
      email: s.email,
      gender: s.gender,
      expectedDate: s.expectedDate,
      arrivalDate: s.arrivalDate,
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

function Cell({ value, C }) {
  if (!value) {
    return (
      <div className="flex justify-center">
        <span className="px-2 py-1 rounded-full text-xs font-medium border border-dashed whitespace-nowrap" style={{ color: C.mutedSoft, borderColor: C.hairline }}>
          Pending
        </span>
      </div>
    );
  }
  return (
    <div className="flex justify-center">
      <span className="inline-flex items-center px-2.5 py-1 rounded-full border whitespace-nowrap" style={{ background: C.greenSoft, borderColor: C.greenSoft }}>
        <span className="text-xs font-medium whitespace-nowrap" style={{ color: C.green }}>{value}</span>
      </span>
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
        <h3 className="font-semibold text-sm" style={{ color: C.text }}>{name}</h3>
        <p className="text-xs" style={{ color: C.muted }}>
          {student.email}
          {/* {student.rollNumber ? ` | ${student.rollNumber}` : ""} */}
        </p>
      </div>
    </div>
  );
}

function StudentProfileModal({
  open,
  student,
  loading,
  onClose,
  C,
  onRemarksSaved,
}) {

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

      // Update the parent/table data
      onRemarksSaved?.(student.id, remarks);

    } catch (err) {
      console.error(err);

      Swal.fire({
        icon: "error",
        title: "Unable to save remarks",
        text:
          err.response?.data?.message ||
          "Something went wrong while saving remarks.",
      });
    } finally {
      setSavingRemarks(false);
    }
  };

  return (
    <Modal
      title="Student Profile"
      width={900}
      onClose={onClose}
      C={C}
    >
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
                <h2
                  className="text-xl font-bold"
                  style={{ color: C.text }}
                >
                  {student?.first_name} {student?.last_name}
                </h2>

                <p
                  className="text-sm mt-1"
                  style={{ color: C.muted }}
                >
                  {student?.email}  
                </p>
                <p
                className="font-semibold mt-1"
                style={{ color: C.text }}
              >
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

            {/* Personal */}
            <Section title="Personal Information" C={C}>
              <Info label="Application No." value={student?.application_number} />
              <Info label="Gender" value={student?.gender} />
              <Info label="DOB" value={formatDate(student?.date_of_birth)} />
              <Info label="Blood Group" value={student?.blood_group} />
              <Info label="Mobile" value={student?.mobile_number} />
            </Section>

            {/* Parents */}
            <Section title="Parent Details" C={C}>
              <Info label="Father" value={student?.father_name} />
              <Info label="Father Mobile" value={student?.guardian1_mobile} />
              <Info label="Mother" value={student?.mother_name} />
              <Info label="Mother Mobile" value={student?.guardian2_mobile} />
            </Section>

            {/* Address */}
            <Section title="Location" C={C}>
              <Info label="State" value={student?.state} />
              <Info label="Country" value={student?.country} />
              <Info label="Nationality" value={student?.nationality} />
            </Section>

            {/* Admission */}
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
            <label
              className="block text-sm font-semibold mb-3"
              style={{ color: C.text }}
            >
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

            <PrimaryButton
            C={C}
            onClick={handleSaveRemarks}
            disabled={savingRemarks}
          >
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
      <h3
        className="text-sm font-semibold mb-4"
        style={{ color: C.text }}
      >
        {title}
      </h3>

      <div className="space-y-3">
        {children}
      </div>
    </div>
  );
}


function Info({ label, value }) {
    return (
        <div>
            <div className="text-xs text-slate-500 mb-1">
                {label}
            </div>

            <div className="font-medium">
                {value || "—"}
            </div>
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
  const [filterOpen, setFilterOpen] = useState(false);
  const handleFilterToggle = () => {
  setFilterOpen((prev) => {
    const next = !prev;

    if (!next) {
      setActiveCategory(null);
    }

    return next;
  });
};

  // which single category dropdown is currently open (desk | gender | remarks | null)
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

  const loadStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getStudentOverview();
      const { desks: normalizedDesks, students: normalizedStudents } = normalizeOverview(res.data.data);
      setDesks(normalizedDesks);
      setStudents(normalizedStudents);
    } catch (err) {
      console.error(err);
      setError("Couldn't load student data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search, selectedDate, statusTab, activeFilters]);

  const dates = useMemo(
    () => Array.from(new Set(students.map((s) => s.expectedDate).filter(Boolean))).sort(),
    [students]
  );

  const dateFiltered = useMemo(
    () => (selectedDate === "all" ? students : students.filter((s) => s.expectedDate === selectedDate)),
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
  const selectedRemarks = useMemo(
    () => activeFilters.filter((f) => f.category === "remarks").map((f) => f.value),
    [activeFilters]
  );

  const isFilterSelected = (category, value) =>
    activeFilters.some((f) => f.category === category && f.value === value);

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

  const clearAllFilters = () => setActiveFilters([]);

  // desks: student must have completed ALL selected desks
  // gender / remarks: student must match ANY selected value in that category
  const deskFiltered = useMemo(
    () =>
      searchFiltered.filter((s) => {
        const deskOk = selectedDeskKeys.length === 0 || selectedDeskKeys.every((key) => Boolean(s.cells[key]));
        const genderOk =
          selectedGenders.length === 0 || selectedGenders.includes((s.gender || "").toLowerCase());
        const remarksOk =
          selectedRemarks.length === 0 || selectedRemarks.includes(s.remarks?.trim() ? "yes" : "no");
        return deskOk && genderOk && remarksOk;
      }),
    [searchFiltered, selectedDeskKeys, selectedGenders, selectedRemarks]
  );

  const counts = useMemo(() => {
    const c = { all: deskFiltered.length, completed: 0, inprogress: 0, expected: 0 };
    deskFiltered.forEach((s) => {
      const key = s.status.toLowerCase();
      if (key === "completed") c.completed++;
      else if (key === "in_progress") c.inprogress++;
      else c.expected++;
    });
    return c;
  }, [deskFiltered]);

  const visibleStudents = useMemo(() => {
    if (statusTab === "all") return deskFiltered;
    if (statusTab === "completed") return deskFiltered.filter((s) => s.status === "COMPLETED");
    if (statusTab === "inprogress") return deskFiltered.filter((s) => s.status === "IN_PROGRESS");
    return deskFiltered.filter((s) => s.status === "EXPECTED");
  }, [deskFiltered, statusTab]);

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
  ];

  const handleExport = () => {
    const isExpected = statusTab === "expected";
    let header, rows;
    if (isExpected) {
      header = ["#", "Name", "Email", "Onboarding Day", "Status"];
      rows = visibleStudents.map((s, i) => [i + 1, s.name, s.email, formatDate(s.expectedDate), "Awaiting check-in"]);
    } else {
      header = ["#", "Name", "Email", "Progress %", "Current Desk", ...desks.map((d) => d.title), "Remarks"];
      rows = visibleStudents.map((s, i) => [
        i + 1,
        s.name,
        s.email,
        s.progress,
        s.currentDesk || "—",
        ...desks.map((d) => s.cells[d.key] || "Pending"),
        s.remarks?.trim() ? "Yes" : "No",
      ]);
    }
    downloadCSV(rows, header, `students-${statusTab}-${selectedDate}.csv`);
  };

  const filterCategories = [
    { key: "desk", label: "Desk", icon: LayoutGrid },
    { key: "gender", label: "Gender", icon: UserIcon },
    { key: "remarks", label: "Remarks", icon: Tag },
  ];

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
            <div className="relative w-full sm:w-52 shrink-0">
              <Calendar size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: C.muted }} />
              <select
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full appearance-none pl-9 pr-8 h-11 rounded-xl text-sm font-medium outline-none transition"
                style={{ background: C.panel, border: `1px solid ${C.hairline}`, color: C.text, boxShadow: C.cardShadow }}
              >
                <option value="all">All dates</option>
                {dates.map((d) => (
                  <option key={d} value={d}>{formatDate(d)}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: C.muted }} />
            </div>

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
            <p className="text-sm font-medium" style={{ color: C.rose }}>{error}</p>
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
            <p className="text-sm" style={{ color: C.muted }}>Loading students…</p>
          </div>
        ) : (
          <>
            {/* ---- filters bar ---- */}
            <div className="rounded-2xl p-4 mb-3" style={{ background: C.panel, border: `1px solid ${C.hairline}`, boxShadow: C.cardShadow }}>
              <div className="flex flex-col lg:flex-row gap-3 justify-between">
                <div className="relative w-full lg:max-w-md">
                  <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: C.muted }} />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search student by name or email..."
                    className="w-full pl-10 pr-4 h-11 rounded-xl outline-none transition text-sm"
                    style={{ background: C.panel2, border: `1px solid ${C.hairline}`, color: C.text }}
                  />
                </div>

                <div className="flex gap-2.5">
                  <button
                     onClick={handleFilterToggle}
                    className="h-11 px-4 rounded-xl flex items-center gap-2 text-sm font-medium transition relative"
                    style={{
                      background: filterOpen ? C.brassSoft : C.panel,
                      border: `1px solid ${filterOpen ? C.brass : C.hairline}`,
                      color: filterOpen ? C.brass : C.text,
                    }}
                  >
                    <SlidersHorizontal size={16} />
                    Filters
                    {activeFilters.length > 0 && (
                      <span
                        className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[11px] font-semibold text-white"
                        style={{ background: C.brass }}
                      >
                        {activeFilters.length}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={handleExport}
                    className="h-11 px-4 rounded-xl flex items-center gap-2 text-sm font-medium text-white transition"
                    style={{ background: C.brass }}
                  >
                    <Download size={16} />
                    Export CSV
                  </button>
                </div>
              </div>

              {/* expandable filter panel: compact side-by-side category pills, each with its own dropdown */}
              <div className={`grid transition-all duration-300 ease-out ${filterOpen ? "grid-rows-[1fr] opacity-100 mt-4" : "grid-rows-[0fr] opacity-0"}`}>
                <div className={filterOpen ? "overflow-visible" : "overflow-hidden"}>
                  <div className="pt-4" style={{ borderTop: `1px solid ${C.hairline}` }}>

                    {/* active filter chips */}
                    {activeFilters.length > 0 && (
                      <div className="flex items-start justify-between gap-3 flex-wrap mb-4">
                        <div className="flex flex-wrap gap-2">
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
                        <button
                          onClick={clearAllFilters}
                          className="flex items-center gap-1 text-xs font-medium shrink-0"
                          style={{ color: C.muted }}
                        >
                          <X size={12} /> Clear all
                        </button>
                      </div>
                    )}

                    {/* ---- side-by-side category pills, each with its own dropdown ---- */}
                    <div ref={filterBarRef} className="space-y-3">

                      {/* Main filter categories */}
                      <div className="flex items-center gap-2 flex-wrap">

                        {filterCategories.map((cat) => {
                          const Icon = cat.icon;
                          const isOpen = activeCategory === cat.key;

                          const activeCount = activeFilters.filter(
                            (f) => f.category === cat.key
                          ).length;

                          return (
                            <button
                              key={cat.key}
                              onClick={() => toggleCategory(cat.key)}
                              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors"
                              style={{
                                background:
                                  isOpen || activeCount > 0
                                    ? C.brassSoft
                                    : C.panel2,

                                borderColor:
                                  isOpen || activeCount > 0
                                    ? C.brass
                                    : C.hairline,

                                color:
                                  isOpen || activeCount > 0
                                    ? C.brass
                                    : C.text,
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
                                  transform: isOpen
                                    ? "rotate(180deg)"
                                    : "rotate(0deg)",
                                  transition: "transform 150ms ease",
                                }}
                              />
                            </button>
                          );
                        })}
                      </div>


                      {/* Filter options row */}
                      {activeCategory && (
                        <div
                          className="flex flex-wrap items-center gap-2 pt-3"
                          style={{
                            borderTop: `1px solid ${C.hairline}`,
                          }}
                        >

                          {/* DESK OPTIONS */}
                          {activeCategory === "desk" &&
                            desks.map((col) => {
                              const DeskIcon = col.icon;

                              const active = isFilterSelected(
                                "desk",
                                col.key
                              );

                              return (
                                <button
                                  key={col.key}
                                  onClick={() =>
                                    toggleFilter(
                                      "desk",
                                      col.key,
                                      col.title
                                    )
                                  }
                                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-colors"
                                  style={
                                    active
                                      ? {
                                          background: C.brass,
                                          borderColor: C.brass,
                                          color: "#fff",
                                        }
                                      : {
                                          background: C.panel2,
                                          borderColor: C.hairline,
                                          color: C.text,
                                        }
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

                              const active = isFilterSelected(
                                "gender",
                                value
                              );

                              return (
                                <button
                                  key={g}
                                  onClick={() =>
                                    toggleFilter(
                                      "gender",
                                      value,
                                      g
                                    )
                                  }
                                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-colors"
                                  style={
                                    active
                                      ? {
                                          background: C.brass,
                                          borderColor: C.brass,
                                          color: "#fff",
                                        }
                                      : {
                                          background: C.panel2,
                                          borderColor: C.hairline,
                                          color: C.text,
                                        }
                                  }
                                >
                                  <UserIcon size={14} />
                                  {g}
                                </button>
                              );
                            })}


                          {/* REMARKS OPTIONS */}
                          {activeCategory === "remarks" &&
                            [
                              {
                                value: "yes",
                                label: "Has remarks",
                              },
                              {
                                value: "no",
                                label: "No remarks",
                              },
                            ].map((r) => {
                              const active = isFilterSelected(
                                "remarks",
                                r.value
                              );

                              return (
                                <button
                                  key={r.value}
                                  onClick={() =>
                                    toggleFilter(
                                      "remarks",
                                      r.value,
                                      r.label
                                    )
                                  }
                                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-colors"
                                  style={
                                    active
                                      ? {
                                          background: C.brass,
                                          borderColor: C.brass,
                                          color: "#fff",
                                        }
                                      : {
                                          background: C.panel2,
                                          borderColor: C.hairline,
                                          color: C.text,
                                        }
                                  }
                                >
                                  {r.value === "yes" ? (
                                    <Check size={10} />
                                  ) : (
                                    <Minus size={10} />
                                  )}

                                  {r.label}
                                </button>
                              );
                            })}

                        </div>
                      )}

                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ---- status tabs ---- */}
            <div className="mb-5">
              <div className="inline-flex flex-wrap rounded-2xl p-1 gap-1" style={{ background: C.panel, border: `1px solid ${C.hairline}`, boxShadow: C.cardShadow }}>
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
                        style={{ background: active ? "rgba(255,255,255,0.25)" : C.hairlineSoft, color: active ? "#fff" : C.muted}}
                      >
                        {tab.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ---- table / expected list ---- */}
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
                      <th className="px-5 py-4 text-left text-xs uppercase tracking-wider w-14" style={{ color: C.muted }}>#</th>
                      <th className="px-5 py-4 text-left text-xs uppercase tracking-wider" style={{ color: C.muted }}>Student</th>
                      <th className="px-5 py-4 text-left text-xs uppercase tracking-wider w-[150px]" style={{ color: C.muted }}>Onboarding day</th>
                      <th className="px-5 py-4 text-right text-xs uppercase tracking-wider w-[160px]" style={{ color: C.muted }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedStudents.map((student, index) => (
                      <tr
                          key={student.id}
                          onClick={() => openStudentProfile(student)}
                          className="cursor-pointer transition-colors"
                          style={{
                              borderBottom: `1px solid ${C.hairline}`,
                          }}
                          onMouseEnter={(e) =>
                              (e.currentTarget.style.background = C.panel2)
                          }
                          onMouseLeave={(e) =>
                              (e.currentTarget.style.background = "transparent")
                          }
                      >
                        <td className="px-3 py-3.5">
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-medium" style={{ background: C.panel2, color: C.muted }}>
                            {rangeStart + index}
                          </span>
                        </td>
                        <td className="px-5 py-3.5"><StudentIdentity student={student} C={C} /></td>
                        <td className="px-5 py-3.5"><span className="text-sm" style={{ color: C.text }}>{formatDate(student.expectedDate)}</span></td>
                        <td className="px-5 py-3.5 text-right">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border border-dashed" style={{ color: C.muted, borderColor: C.hairline }}>
                            <CircleDashed size={12} />
                            Awaiting check-in
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
                        <th className="px-5 py-4 text-left text-xs uppercase tracking-wider w-14" style={{ color: C.muted }}>#</th>
                        <th className="px-5 py-4 text-left text-xs uppercase tracking-wider w-[260px]" style={{ color: C.muted }}>Student</th>
                        <th className="px-5 py-4 text-left text-xs uppercase tracking-wider w-[130px]" style={{ color: C.muted }}>Progress</th>
                       
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
                                <span className="text-xs font-semibold" style={{ color: C.text }}>{col.title}</span>
                              </div>
                            </th>
                          );
                        })}
                        <th className="px-3 py-3.5 text-center w-[110px]">
                          <div className="flex flex-col items-center gap-1.5">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: C.brassSoft }}>
                              <Tag size={16} style={{ color: C.brass }} />
                            </div>
                            <span className="text-xs font-semibold" style={{ color: C.text }}>Remarks</span>
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
                            style={{
                                borderBottom: `1px solid ${C.hairline}`,
                            }}
                            onMouseEnter={(e) =>
                                (e.currentTarget.style.background = C.panel2)
                            }
                            onMouseLeave={(e) =>
                                (e.currentTarget.style.background = "transparent")
                            }
                          >
                            <td className="px-3 py-3.5">
                              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-medium" style={{ background: C.panel2, color: C.muted }}>
                                {rangeStart + index}
                              </span>
                            </td>
                            <td className="px-5 py-3.5"><StudentIdentity student={student} C={C} /></td>
                            <td className="px-5 py-3.5">
                              <div className="w-[120px]">
                                <div className="flex justify-between text-xs mb-2" >
                                  <span className="font-semibold" style={{ color: isComplete ? C.green : C.text }}>{progress}%</span>
                                  <span style={{ color: C.mutedSoft }}>{student.completedCount}/{student.totalDesks}</span>
                                </div>
                                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: C.hairlineSoft }}>
                                  <div className="h-1.5 rounded-full transition-all duration-300" style={{ width: `${progress}%`, background: isComplete ? C.green : C.brass }} />
                                </div>
                              </div>
                            </td>
                            {desks.map((col) => (
                              <td key={col.key} className="px-3.5 py-3.5"><Cell value={student.cells[col.key]} C={C} /></td>
                            ))}
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
                      Showing <span className="font-bold" >{rangeStart}–{rangeEnd}</span> of{" "}
                      <span className="font-bold" >{visibleStudents.length}</span> students
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: C.muted }}>Page {safePage} of {totalPages}</p>
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
                        <div key={`e-${i}`} className="px-1 font-semibold" style={{ color: C.muted }}>...</div>
                      ) : (
                        <button
                          key={p}
                          onClick={() => setPage(p)}
                          className="w-9 h-9 rounded-lg font-semibold transition"
                          style={p === safePage ? { background: C.brass, color: "#fff"} : { color: C.text }}
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
    </div>
    
  );
}