import { useEffect, useMemo, useState } from "react";
import {
  Users,
  UserCheck,
  Clock3,
  CheckCircle2,
  Sun,
  Moon,
  DoorOpen,
  Building2,
  Home,
  Laptop,
  UtensilsCrossed,
  IdCard,
  Library,
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
} from "lucide-react";

/* ============================================================
   TOKENS — same teal/brass theme as the merged dashboard page
   ============================================================ */

const LIGHT = {
  bg: "#F2F8F7",
  panel: "#FFFFFF",
  panel2: "#F6FBFA",
  hairline: "#E1EFEC",
  hairlineSoft: "#EDF6F4",
  text: "#12302C",
  muted: "#5E7D79",
  mutedSoft: "#93B0AC",
  brass: "#0D9488",
  brassSoft: "#0D94881A",
  rose: "#F43F5E",
  roseSoft: "#F43F5E1A",
  green: "#10B981",
  greenSoft: "#10B9811A",
  amber: "#D97706",
  amberSoft: "#D977061A",
  cardShadow: "0 1px 2px rgba(18,48,44,0.04)",
};

const DARK = {
  bg: "#07211D",
  panel: "#0E322D",
  panel2: "#0B2824",
  hairline: "#1D5148",
  hairlineSoft: "#153E37",
  text: "#EAF7F3",
  muted: "#8FC7BC",
  mutedSoft: "#5C978B",
  brass: "#0D9488",
  brassSoft: "#0D948826",
  rose: "#F97362",
  roseSoft: "#F9736226",
  green: "#4ADE9A",
  greenSoft: "#4ADE9A26",
  amber: "#F0B860",
  amberSoft: "#F0B86026",
  cardShadow: "0 1px 2px rgba(0,0,0,0.3)",
};

const MONO = "ui-monospace, SFMono-Regular, 'JetBrains Mono', Menlo, monospace";
const DISPLAY = "'Open Sans', sans-serif";

/* ============================================================
   DEMO DATA
   ============================================================ */

const columns = [
  { title: "Gate", key: "gate", icon: DoorOpen },
  { title: "Admission", key: "admission", icon: Building2 },
  { title: "Hostel", key: "hostel", icon: Home },
  { title: "IT", key: "it", icon: Laptop },
  { title: "Mess", key: "mess", icon: UtensilsCrossed },
  { title: "ID", key: "idcard", icon: IdCard },
  { title: "Library", key: "library", icon: Library },
];

const DEMO_STUDENTS = [
  { id: 1, name: "Ananya Sharma", email: "ananya.sharma@campus.edu", progress: 100, date: "2026-07-18", gate: "8:58 AM", admission: "9:12 AM", hostel: "9:40 AM", it: "10:05 AM", mess: "10:30 AM", idcard: "10:52 AM", library: "11:10 AM" },
  { id: 2, name: "Rohan Mehta", email: "rohan.mehta@campus.edu", progress: 45, date: "2026-07-18", gate: "9:05 AM", admission: "9:22 AM", hostel: "9:50 AM", it: false, mess: false, idcard: false, library: false },
  { id: 3, name: "Ishita Verma", email: "ishita.verma@campus.edu", progress: 0, date: "2026-07-18", gate: false, admission: false, hostel: false, it: false, mess: false, idcard: false, library: false },
  { id: 4, name: "Kabir Singh", email: "kabir.singh@campus.edu", progress: 100, date: "2026-07-18", gate: "8:40 AM", admission: "8:58 AM", hostel: "9:20 AM", it: "9:45 AM", mess: "10:10 AM", idcard: "10:30 AM", library: "10:50 AM" },
  { id: 5, name: "Meera Nair", email: "meera.nair@campus.edu", progress: 70, date: "2026-07-18", gate: "9:00 AM", admission: "9:18 AM", hostel: "9:45 AM", it: "10:10 AM", mess: "10:35 AM", idcard: false, library: false },
  { id: 6, name: "Aditya Rao", email: "aditya.rao@campus.edu", progress: 0, date: "2026-07-19", gate: false, admission: false, hostel: false, it: false, mess: false, idcard: false, library: false },
  { id: 7, name: "Simran Kaur", email: "simran.kaur@campus.edu", progress: 30, date: "2026-07-19", gate: "9:10 AM", admission: "9:28 AM", hostel: false, it: false, mess: false, idcard: false, library: false },
  { id: 8, name: "Devansh Gupta", email: "devansh.gupta@campus.edu", progress: 100, date: "2026-07-19", gate: "8:50 AM", admission: "9:05 AM", hostel: "9:30 AM", it: "9:55 AM", mess: "10:15 AM", idcard: "10:40 AM", library: "11:00 AM" },
  { id: 9, name: "Priya Iyer", email: "priya.iyer@campus.edu", progress: 15, date: "2026-07-19", gate: "9:20 AM", admission: false, hostel: false, it: false, mess: false, idcard: false, library: false },
  { id: 10, name: "Vivaan Joshi", email: "vivaan.joshi@campus.edu", progress: 85, date: "2026-07-19", gate: "8:45 AM", admission: "9:02 AM", hostel: "9:28 AM", it: "9:50 AM", mess: "10:12 AM", idcard: "10:35 AM", library: false },
];

function deriveStatus(progress) {
  if (progress >= 100) return "completed";
  if (progress > 0) return "inprogress";
  return "expected";
}

function formatDate(value) {
  if (value === "all") return "All dates";
  const d = new Date(value);
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


function Progress({ progress, C }) {
  const isComplete = progress >= 100;
  return (
    <div className="w-[120px]">
      <div className="flex justify-between text-xs mb-2" style={{ fontFamily: MONO }}>
        <span className="font-semibold" style={{ color: isComplete ? C.green : C.text }}>{progress}%</span>
        <span style={{ color: C.mutedSoft }}>{Math.round((progress / 100) * 7)}/7</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: C.hairlineSoft }}>
        <div className="h-1.5 rounded-full transition-all duration-300" style={{ width: `${progress}%`, background: isComplete ? C.green : C.brass }} />
      </div>
    </div>
  );
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
        <span className="text-xs font-medium whitespace-nowrap" style={{ color: C.green, fontFamily: MONO }}>{value}</span>
      </span>
    </div>
  );
}

function StudentIdentity({ student, C }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="w-9 h-9 rounded-full text-white flex items-center justify-center font-semibold shadow-sm shrink-0"
        style={{ background: `linear-gradient(135deg, ${C.brass}, ${C.green})`, fontFamily: DISPLAY }}
      >
        {student.name.charAt(0)}
      </div>
      <div className="min-w-0">
        <h3 className="font-semibold truncate text-sm" style={{ color: C.text }}>{student.name}</h3>
        <p className="text-xs truncate" style={{ color: C.muted }}>{student.email}</p>
      </div>
    </div>
  );
}

/* ============================================================
   PAGE
   ============================================================ */

export default function AdmissionOverviewPage() {
  const [dark, setDark] = useState(false);
  const [selectedDate, setSelectedDate] = useState("all");
  const [statusTab, setStatusTab] = useState("all");
  const [search, setSearch] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [deskFilter, setDeskFilter] = useState([]);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const C = dark ? DARK : LIGHT;
  const deskAccentPalette = [C.brass, C.rose, C.green, C.amber];
  const deskAccentSoft = [C.brassSoft, C.roseSoft, C.greenSoft, C.amberSoft];

  const dates = useMemo(() => Array.from(new Set(DEMO_STUDENTS.map((s) => s.date))).sort(), []);

  const dateFiltered = useMemo(
    () => (selectedDate === "all" ? DEMO_STUDENTS : DEMO_STUDENTS.filter((s) => s.date === selectedDate)),
    [selectedDate]
  );

  const searchFiltered = useMemo(
    () =>
      search.trim() === ""
        ? dateFiltered
        : dateFiltered.filter(
            (s) =>
              s.email.toLowerCase().includes(search.trim().toLowerCase()) ||
              s.name.toLowerCase().includes(search.trim().toLowerCase())
          ),
    [dateFiltered, search]
  );

  const deskFiltered = useMemo(
    () => (deskFilter.length === 0 ? searchFiltered : searchFiltered.filter((s) => deskFilter.some((key) => Boolean(s[key])))),
    [searchFiltered, deskFilter]
  );

  const counts = useMemo(() => {
    const c = { all: deskFiltered.length, completed: 0, inprogress: 0, expected: 0 };
    deskFiltered.forEach((s) => {
      c[deriveStatus(s.progress)] += 1;
    });
    return c;
  }, [deskFiltered]);

  const visibleStudents = useMemo(
    () => (statusTab === "all" ? deskFiltered : deskFiltered.filter((s) => deriveStatus(s.progress) === statusTab)),
    [deskFiltered, statusTab]
  );

  useEffect(() => {
    setPage(1);
  }, [search, selectedDate, statusTab, deskFilter]);

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

  const toggleDesk = (key) => {
    setDeskFilter((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  };

  const handleExport = () => {
    const isExpected = statusTab === "expected";
    let header, rows;
    if (isExpected) {
      header = ["#", "Name", "Email", "Admission Day", "Status"];
      rows = visibleStudents.map((s, i) => [i + 1, s.name, s.email, formatDate(s.date), "Awaiting check-in"]);
    } else {
      header = ["#", "Name", "Email", "Progress %", "Gate", "Admission", "Hostel", "IT", "Mess", "ID Card", "Library"];
      rows = visibleStudents.map((s, i) => [
        i + 1,
        s.name,
        s.email,
        s.progress,
        s.gate || "Pending",
        s.admission || "Pending",
        s.hostel || "Pending",
        s.it || "Pending",
        s.mess || "Pending",
        s.idcard || "Pending",
        s.library || "Pending",
      ]);
    }
    downloadCSV(rows, header, `students-${statusTab}-${selectedDate}.csv`);
  };

  return (
      <div style={{ background: C.bg, minHeight: "100%" }} className="transition-colors duration-300 p-6 md:p-10">
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Open+Sans:opsz,wght@9..144,400;9..144,600;9..144,700&display=swap');`}</style>

        <div className="mx-auto">
          {/* ============ HEADER ============ */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] uppercase" style={{ color: C.brass }}>
                Student Operations
              </p>
              <h1 className="text-4xl md:text-5xl font-semibold mt-2" style={{ color: C.text, fontFamily: DISPLAY }}>
                Student Wise Detail 
              </h1>
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
                onClick={() => setDark((d) => !d)}
                className="w-11 h-11 rounded-xl flex items-center justify-center transition shrink-0"
                style={{ background: C.panel, border: `1px solid ${C.hairline}`, color: C.brass, boxShadow: C.cardShadow }}
                title={dark ? "Switch to light mode" : "Switch to dark mode"}
              >
                {dark ? <Sun size={17} /> : <Moon size={17} />}
              </button>
            </div>
          </div>

          <p className="text-sm mb-4" style={{ color: C.muted }}>
            Browse onboarding progress by admission day and status.
          </p>

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
                  onClick={() => setFilterOpen((v) => !v)}
                  className="h-11 px-4 rounded-xl flex items-center gap-2 text-sm font-medium transition relative"
                  style={{
                    background: filterOpen ? C.brassSoft : C.panel,
                    border: `1px solid ${filterOpen ? C.brass : C.hairline}`,
                    color: filterOpen ? C.brass : C.text,
                  }}
                >
                  <SlidersHorizontal size={16} />
                  Filters
                  {deskFilter.length > 0 && (
                    <span
                      className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[11px] font-semibold text-white"
                      style={{ background: C.brass }}
                    >
                      {deskFilter.length}
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

            {/* expandable desk filter panel */}
            <div className={`grid transition-all duration-300 ease-out ${filterOpen ? "grid-rows-[1fr] opacity-100 mt-4" : "grid-rows-[0fr] opacity-0"}`}>
              <div className="overflow-hidden">
                <div className="pt-4" style={{ borderTop: `1px solid ${C.hairline}` }}>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: C.muted }}>
                      Filter by desk checked in
                    </p>
                    {deskFilter.length > 0 && (
                      <button
                        onClick={() => setDeskFilter([])}
                        className="flex items-center gap-1 text-xs font-medium"
                        style={{ color: C.muted }}
                      >
                        <X size={12} /> Clear
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {columns.map((col) => {
                      const Icon = col.icon;
                      const active = deskFilter.includes(col.key);
                      return (
                        <button
                          key={col.key}
                          onClick={() => toggleDesk(col.key)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-colors"
                          style={
                            active
                              ? { background: C.brass, borderColor: C.brass, color: "#fff" }
                              : { background: C.panel2, borderColor: C.hairline, color: C.text }
                          }
                        >
                          <Icon size={14} />
                          {col.title}
                        </button>
                      );
                    })}
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
                      style={{ background: active ? "rgba(255,255,255,0.25)" : C.hairlineSoft, color: active ? "#fff" : C.muted, fontFamily: MONO }}
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
                No students match this search, date, desk and status combination.
              </p>
            </div>
          ) : statusTab === "expected" ? (
            <div className="rounded-2xl overflow-hidden" style={{ background: C.panel, border: `1px solid ${C.hairline}`, boxShadow: C.cardShadow }}>
              <table className="w-full table-auto">
                <thead style={{ borderBottom: `1px solid ${C.hairline}` }}>
                  <tr>
                    <th className="px-5 py-4 text-left text-xs uppercase tracking-wider w-14" style={{ color: C.muted }}>#</th>
                    <th className="px-5 py-4 text-left text-xs uppercase tracking-wider" style={{ color: C.muted }}>Student</th>
                    <th className="px-5 py-4 text-left text-xs uppercase tracking-wider w-[150px]" style={{ color: C.muted }}>Admission day</th>
                    <th className="px-5 py-4 text-right text-xs uppercase tracking-wider w-[160px]" style={{ color: C.muted }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedStudents.map((student, index) => (
                    <tr key={student.id} style={{ borderBottom: `1px solid ${C.hairline}` }}>
                      <td className="px-3 py-3.5">
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-medium" style={{ background: C.panel2, color: C.muted, fontFamily: MONO }}>
                          {rangeStart + index}
                        </span>
                      </td>
                      <td className="px-5 py-3.5"><StudentIdentity student={student} C={C} /></td>
                      <td className="px-5 py-3.5"><span className="text-sm" style={{ color: C.text }}>{formatDate(student.date)}</span></td>
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
                      {columns.map((col, i) => {
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
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedStudents.map((student, index) => (
                      <tr key={student.id} style={{ borderBottom: `1px solid ${C.hairline}` }}>
                        <td className="px-3 py-3.5">
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-medium" style={{ background: C.panel2, color: C.muted, fontFamily: MONO }}>
                            {rangeStart + index}
                          </span>
                        </td>
                        <td className="px-5 py-3.5"><StudentIdentity student={student} C={C} /></td>
                        <td className="px-5 py-3.5"><Progress progress={student.progress} C={C} /></td>
                        {columns.map((col) => (
                          <td key={col.key} className="px-3.5 py-3.5"><Cell value={student[col.key]} C={C} /></td>
                        ))}
                      </tr>
                    ))}
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
                    Showing <span className="font-bold" style={{ fontFamily: MONO }}>{rangeStart}–{rangeEnd}</span> of{" "}
                    <span className="font-bold" style={{ fontFamily: MONO }}>{visibleStudents.length}</span> students
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
                        style={p === safePage ? { background: C.brass, color: "#fff", fontFamily: MONO } : { color: C.text, fontFamily: MONO }}
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
        </div>
      </div>
  );
}