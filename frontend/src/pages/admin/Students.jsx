import { useMemo, useState } from "react";
import {
  Users,
  UserCheck,
  Clock3,
  CheckCircle2,
  Gauge,
  Activity,
  ArrowRight,
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
} from "lucide-react";
import AdminLayout from "../../layouts/AdminLayout";

/* ============================================================
   TOKENS — teal operations-console theme (shared with the desk card)
   ============================================================ */

function useTokens(dark) {
  return dark
    ? {
        bg: "#0E1613",
        panel: "#16211D",
        panelAlt: "#1C2A25",
        hairline: "rgba(255,255,255,0.08)",
        text: "#EAF3EF",
        muted: "#8FA39D",
        teal: "#2DBE99",
        tealSoft: "rgba(45,190,153,0.14)",
        cyan: "#38C6E0",
        cyanSoft: "rgba(56,198,224,0.14)",
        amber: "#F0B429",
        amberSoft: "rgba(240,180,41,0.14)",
        cardShadow: "0 8px 24px rgba(0,0,0,0.35)",
      }
    : {
        bg: "#F5FAF8",
        panel: "#FFFFFF",
        panelAlt: "#F0F8F5",
        hairline: "#DCEDE7",
        text: "#16231F",
        muted: "#64756F",
        teal: "#0F6E56",
        tealSoft: "#E1F5EE",
        cyan: "#0E7490",
        cyanSoft: "#E0F2F5",
        amber: "#B45309",
        amberSoft: "#FCEED4",
        cardShadow: "0 4px 16px rgba(15,110,86,0.07)",
      };
}

const MONO = "ui-monospace, SFMono-Regular, 'JetBrains Mono', Menlo, monospace";
const DISPLAY = "'Fraunces', serif";

/* ============================================================
   DEMO DATA
   ============================================================ */

const DESK_BREAKDOWN = [
  { title: "Gate", icon: DoorOpen, count: 540 },
  { title: "Admission", icon: Building2, count: 512 },
  { title: "Hostel", icon: Home, count: 470 },
  { title: "IT", icon: Laptop, count: 431 },
  { title: "Mess", icon: UtensilsCrossed, count: 418 },
  { title: "ID Card", icon: IdCard, count: 415 },
  { title: "Library", icon: Library, count: 414 },
];

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

/* ============================================================
   SHARED PIECES
   ============================================================ */

function SummaryStat({ C, accent, accentSoft, icon, label, value, sub }) {
  return (
    <div
      className="rounded-2xl p-5 transition-all duration-300 hover:-translate-y-0.5"
      style={{ background: C.panel, border: `1px solid ${C.hairline}`, boxShadow: C.cardShadow }}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide" style={{ color: C.muted }}>
            {label}
          </p>
          <h2 className="text-3xl font-semibold mt-2" style={{ color: C.text, fontFamily: MONO }}>
            {value}
          </h2>
        </div>
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: accentSoft, color: accent }}
        >
          {icon}
        </div>
      </div>
      <p className="text-xs mt-3" style={{ color: C.muted }}>
        {sub}
      </p>
    </div>
  );
}

function ProgressRing({ percent, color, hairline }) {
  const size = 68;
  const stroke = 6;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative w-[68px] h-[68px] shrink-0">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={hairline} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-semibold text-xs" style={{ fontFamily: MONO }}>
          {percent}%
        </span>
      </div>
    </div>
  );
}

function Progress({ progress, C }) {
  const isComplete = progress >= 100;
  return (
    <div className="w-[120px]">
      <div className="flex justify-between text-xs mb-2" style={{ fontFamily: MONO }}>
        <span className="font-semibold" style={{ color: isComplete ? C.teal : C.text }}>
          {progress}%
        </span>
        <span style={{ color: C.muted }}>{Math.round((progress / 100) * 7)}/7</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: C.hairline }}>
        <div
          className="h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${progress}%`, background: isComplete ? C.teal : C.amber }}
        />
      </div>
    </div>
  );
}

function Cell({ value, C }) {
  if (!value) {
    return (
      <div className="flex justify-center">
        <span
          className="px-2 py-1 rounded-full text-xs font-medium border border-dashed"
          style={{ color: C.muted, borderColor: C.hairline }}
        >
          Pending
        </span>
      </div>
    );
  }
  return (
    <div className="flex justify-center">
      <span
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border"
        style={{ background: C.tealSoft, borderColor: C.hairline }}
      >
        <CheckCircle2 size={13} style={{ color: C.teal }} />
        <span className="text-xs font-medium" style={{ color: C.teal, fontFamily: MONO }}>
          {value}
        </span>
      </span>
    </div>
  );
}

function StudentIdentity({ student, C }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="w-9 h-9 rounded-full text-white flex items-center justify-center font-semibold shadow-sm shrink-0"
        style={{ background: `linear-gradient(135deg, ${C.teal}, ${C.cyan})`, fontFamily: DISPLAY }}
      >
        {student.name.charAt(0)}
      </div>
      <div className="min-w-0">
        <h3 className="font-semibold truncate text-sm" style={{ color: C.text }}>
          {student.name}
        </h3>
        <p className="text-xs truncate" style={{ color: C.muted }}>
          {student.email}
        </p>
      </div>
    </div>
  );
}

/* ============================================================
   PAGE
   ============================================================ */

export default function AdmissionOverviewPage() {
  const [dark, setDark] = useState(false);
  const [overviewTab, setOverviewTab] = useState("pipeline");
  const [selectedDate, setSelectedDate] = useState("all");
  const [statusTab, setStatusTab] = useState("all");
  const [search, setSearch] = useState("");

  const C = useTokens(dark);
  const deskAccentPalette = [C.teal, C.cyan, C.teal, C.amber];
  const deskAccentSoft = [C.tealSoft, C.cyanSoft, C.tealSoft, C.amberSoft];

  const stats = [
    { title: "Total Students", value: 640, sub: "+28 expected today", icon: <Users size={18} />, accent: C.teal, accentSoft: C.tealSoft },
    { title: "Checked In", value: 512, sub: "80% attendance", icon: <UserCheck size={18} />, accent: C.cyan, accentSoft: C.cyanSoft },
    { title: "In Progress", value: 98, sub: "Across all desks", icon: <Clock3 size={18} />, accent: C.amber, accentSoft: C.amberSoft },
    { title: "Completed", value: 414, sub: "64.7% finished", icon: <CheckCircle2 size={18} />, accent: C.teal, accentSoft: C.tealSoft },
  ];

  const overallProgress = Math.round((512 / 640) * 100);
  const maxDeskCount = Math.max(...DESK_BREAKDOWN.map((d) => d.count));

  const dates = useMemo(() => Array.from(new Set(DEMO_STUDENTS.map((s) => s.date))).sort(), []);

  const dateFiltered = useMemo(
    () => (selectedDate === "all" ? DEMO_STUDENTS : DEMO_STUDENTS.filter((s) => s.date === selectedDate)),
    [selectedDate]
  );

  const searchFiltered = useMemo(
    () =>
      search.trim() === ""
        ? dateFiltered
        : dateFiltered.filter((s) => s.email.toLowerCase().includes(search.trim().toLowerCase())),
    [dateFiltered, search]
  );

  const counts = useMemo(() => {
    const c = { all: searchFiltered.length, completed: 0, inprogress: 0, expected: 0 };
    searchFiltered.forEach((s) => {
      c[deriveStatus(s.progress)] += 1;
    });
    return c;
  }, [searchFiltered]);

  const visibleStudents = useMemo(
    () => (statusTab === "all" ? searchFiltered : searchFiltered.filter((s) => deriveStatus(s.progress) === statusTab)),
    [searchFiltered, statusTab]
  );

  const statusTabs = [
    { key: "all", label: "All Students", icon: Users, count: counts.all },
    { key: "completed", label: "Completed", icon: CheckCircle2, count: counts.completed },
    { key: "inprogress", label: "In Progress", icon: Clock3, count: counts.inprogress },
    { key: "expected", label: "Expected", icon: CircleDashed, count: counts.expected },
  ];

  return (
    <AdminLayout>
      <div style={{ background: C.bg, minHeight: "100%" }} className="transition-colors duration-300 p-6 md:p-10">
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&display=swap');`}</style>

        <div className="max-w-7xl mx-auto">
          {/* ============ HEADER (single, shared by whole page) ============ */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] uppercase" style={{ color: C.teal }}>
                Student Operations
              </p>
              <h1 className="text-4xl md:text-5xl font-semibold mt-2" style={{ color: C.text, fontFamily: DISPLAY }}>
                Admission Overview
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
                    <option key={d} value={d}>
                      {formatDate(d)}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: C.muted }} />
              </div>

              <span
                className="h-11 px-4 rounded-xl flex items-center gap-2 font-medium text-sm whitespace-nowrap"
                style={{ background: C.tealSoft, color: C.teal, border: `1px solid ${C.hairline}` }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: C.teal, animation: "pulse 1.6s ease-in-out infinite" }} />
                Live
              </span>

              <button
                onClick={() => setDark((d) => !d)}
                className="w-11 h-11 rounded-xl flex items-center justify-center transition shrink-0"
                style={{ background: C.panel, border: `1px solid ${C.hairline}`, color: C.teal, boxShadow: C.cardShadow }}
                title={dark ? "Switch to light mode" : "Switch to dark mode"}
              >
                {dark ? <Sun size={17} /> : <Moon size={17} />}
              </button>
            </div>
          </div>

          {/* ============ SUMMARY STATS ============ */}
          <div className="grid xl:grid-cols-4 md:grid-cols-2 gap-4">
            {stats.map((item) => (
              <SummaryStat key={item.title} C={C} accent={item.accent} accentSoft={item.accentSoft} icon={item.icon} label={item.title} value={item.value} sub={item.sub} />
            ))}
          </div>

          {/* ============ OVERVIEW TABS: pipeline / desk breakdown ============ */}
          <div className="mt-6">
            <div className="inline-flex rounded-2xl p-1" style={{ background: C.panel, border: `1px solid ${C.hairline}`, boxShadow: C.cardShadow }}>
              <button
                onClick={() => setOverviewTab("pipeline")}
                className="px-5 py-2.5 rounded-xl font-medium text-sm transition-all"
                style={{ background: overviewTab === "pipeline" ? C.teal : "transparent", color: overviewTab === "pipeline" ? "#fff" : C.muted }}
              >
                Admission Pipeline
              </button>
              <button
                onClick={() => setOverviewTab("desks")}
                className="px-5 py-2.5 rounded-xl font-medium text-sm transition-all"
                style={{ background: overviewTab === "desks" ? C.teal : "transparent", color: overviewTab === "desks" ? "#fff" : C.muted }}
              >
                Desk Breakdown ({DESK_BREAKDOWN.length})
              </button>
            </div>
          </div>

          <div className="mt-4 rounded-2xl overflow-hidden" style={{ background: C.panel, border: `1px solid ${C.hairline}`, boxShadow: C.cardShadow }}>
            <div className="h-[3px]" style={{ background: C.teal }} />

            {overviewTab === "pipeline" ? (
              <div className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                  <div className="flex items-center gap-2 sm:w-52 shrink-0">
                    <Activity size={15} style={{ color: C.teal }} />
                    <h3 className="text-xs font-semibold tracking-wide uppercase" style={{ color: C.text }}>
                      Admission Pipeline
                    </h3>
                  </div>

                  <div className="flex-1 flex flex-col sm:flex-row items-stretch gap-2">
                    {stats.map((item, i) => {
                      const isLast = i === stats.length - 1;
                      return (
                        <div key={item.title} className="flex items-center flex-1 gap-2">
                          <div className="flex-1 rounded-xl px-3.5 py-2.5 flex items-center gap-3" style={{ background: C.panelAlt }}>
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: item.accentSoft, color: item.accent }}>
                              {item.icon}
                            </div>
                            <div className="min-w-0">
                              <p className="text-base font-bold" style={{ color: C.text, fontFamily: MONO }}>
                                {item.value}
                              </p>
                              <p className="text-xs truncate" style={{ color: C.muted }}>
                                {item.title}
                              </p>
                            </div>
                          </div>
                          {!isLast && <ArrowRight size={15} className="hidden sm:block shrink-0" style={{ color: C.hairline }} />}
                        </div>
                      );
                    })}
                  </div>

                  <ProgressRing percent={overallProgress} color={C.teal} hairline={C.hairline} />
                </div>
              </div>
            ) : (
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Gauge size={15} style={{ color: C.teal }} />
                  <h3 className="text-xs font-semibold tracking-wide uppercase" style={{ color: C.text }}>
                    Checked in by desk
                  </h3>
                </div>

                <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-3.5">
                  {DESK_BREAKDOWN.map((desk, i) => {
                    const Icon = desk.icon;
                    const pct = Math.round((desk.count / maxDeskCount) * 100);
                    const accent = deskAccentPalette[i % deskAccentPalette.length];
                    const accentSoft = deskAccentSoft[i % deskAccentSoft.length];
                    return (
                      <div key={desk.title} className="rounded-xl p-3.5" style={{ background: C.panelAlt, border: `1px solid ${C.hairline}` }}>
                        <div className="flex items-center gap-2 mb-2.5">
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: accentSoft, color: accent }}>
                            <Icon size={14} />
                          </div>
                          <span className="text-xs font-medium" style={{ color: C.text }}>
                            {desk.title}
                          </span>
                        </div>
                        <p className="text-xl font-semibold" style={{ color: C.text, fontFamily: MONO }}>
                          {desk.count}
                        </p>
                        <div className="h-1.5 rounded-full mt-2.5 overflow-hidden" style={{ background: C.hairline }}>
                          <div className="h-full rounded-full transition-all duration-300" style={{ width: `${pct}%`, background: accent }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* ============ STUDENT RECORDS SECTION ============ */}
          <div className="mt-10 mb-5">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase" style={{ color: C.teal }}>
              Admission Operations
            </p>
            <h2 className="text-2xl font-semibold mt-1.5" style={{ color: C.text, fontFamily: DISPLAY }}>
              Student Records
            </h2>
            <p className="text-sm mt-1" style={{ color: C.muted }}>
              Browse onboarding progress by admission day and status.
            </p>
          </div>

          {/* ---- filters bar ---- */}
          <div className="rounded-2xl p-4 mb-5" style={{ background: C.panel, border: `1px solid ${C.hairline}`, boxShadow: C.cardShadow }}>
            <div className="flex flex-col lg:flex-row gap-3 justify-between">
              <div className="relative w-full lg:max-w-md">
                <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: C.muted }} />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search student by email..."
                  className="w-full pl-10 pr-4 h-11 rounded-xl outline-none transition text-sm"
                  style={{ background: C.panelAlt, border: `1px solid ${C.hairline}`, color: C.text }}
                />
              </div>

              <div className="flex gap-2.5">
                <button
                  className="h-11 px-4 rounded-xl flex items-center gap-2 text-sm font-medium transition"
                  style={{ background: C.panel, border: `1px solid ${C.hairline}`, color: C.text }}
                >
                  <SlidersHorizontal size={16} />
                  Filters
                </button>
                <button
                  className="h-11 px-4 rounded-xl flex items-center gap-2 text-sm font-medium text-white transition"
                  style={{ background: C.teal }}
                >
                  <Download size={16} />
                  Export CSV
                </button>
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
                    style={{ background: active ? C.teal : "transparent", color: active ? "#fff" : C.muted }}
                  >
                    <Icon size={14} />
                    {tab.label}
                    <span
                      className="inline-flex items-center justify-center min-w-[20px] h-[20px] px-1 rounded-full text-xs font-semibold"
                      style={{ background: active ? "rgba(255,255,255,0.25)" : C.hairline, color: active ? "#fff" : C.muted, fontFamily: MONO }}
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
                No students match this date and status combination.
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
                  {visibleStudents.map((student, index) => (
                    <tr key={student.id} style={{ borderBottom: `1px solid ${C.hairline}` }}>
                      <td className="px-3 py-3.5">
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-medium" style={{ background: C.panelAlt, color: C.muted, fontFamily: MONO }}>
                          {index + 1}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <StudentIdentity student={student} C={C} />
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-sm" style={{ color: C.text }}>{formatDate(student.date)}</span>
                      </td>
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
                          <th key={col.key} className="px-3 py-3.5 text-center w-[84px]">
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
                    {visibleStudents.map((student, index) => (
                      <tr key={student.id} style={{ borderBottom: `1px solid ${C.hairline}` }}>
                        <td className="px-3 py-3.5">
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-medium" style={{ background: C.panelAlt, color: C.muted, fontFamily: MONO }}>
                            {index + 1}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <StudentIdentity student={student} C={C} />
                        </td>
                        <td className="px-5 py-3.5">
                          <Progress progress={student.progress} C={C} />
                        </td>
                        {columns.map((col) => (
                          <td key={col.key} className="px-3.5 py-3.5">
                            <Cell value={student[col.key]} C={C} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ---- pagination ---- */}
          <div className="mt-5 rounded-2xl" style={{ background: C.panel, border: `1px solid ${C.hairline}`, boxShadow: C.cardShadow }}>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 px-5 py-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div>
                  <p className="text-sm font-medium" style={{ color: C.text }}>
                    Showing <span className="font-bold" style={{ fontFamily: MONO }}>1–{visibleStudents.length}</span> of{" "}
                    <span className="font-bold" style={{ fontFamily: MONO }}>640</span> students
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: C.muted }}>Page 1 of 64</p>
                </div>

                <div className="hidden md:flex items-center gap-2">
                  <span className="text-sm" style={{ color: C.muted }}>Rows</span>
                  <select
                    className="rounded-lg px-3 py-1.5 text-sm outline-none"
                    style={{ background: C.panelAlt, border: `1px solid ${C.hairline}`, color: C.text }}
                  >
                    <option>10</option>
                    <option>25</option>
                    <option>50</option>
                    <option>100</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button className="w-9 h-9 rounded-lg flex items-center justify-center transition" style={{ border: `1px solid ${C.hairline}`, color: C.muted }}>
                  <ChevronsLeft size={16} />
                </button>
                <button className="w-9 h-9 rounded-lg flex items-center justify-center transition" style={{ border: `1px solid ${C.hairline}`, color: C.muted }}>
                  <ChevronLeft size={16} />
                </button>
                <button className="w-9 h-9 rounded-lg font-semibold text-white" style={{ background: C.teal, fontFamily: MONO }}>1</button>
                <button className="w-9 h-9 rounded-lg transition" style={{ color: C.text, fontFamily: MONO }}>2</button>
                <button className="w-9 h-9 rounded-lg transition" style={{ color: C.text, fontFamily: MONO }}>3</button>
                <div className="px-1 font-semibold" style={{ color: C.muted }}>...</div>
                <button className="w-9 h-9 rounded-lg transition" style={{ color: C.text, fontFamily: MONO }}>64</button>
                <button className="w-9 h-9 rounded-lg flex items-center justify-center transition" style={{ border: `1px solid ${C.hairline}`, color: C.muted }}>
                  <ChevronRight size={16} />
                </button>
                <button className="w-9 h-9 rounded-lg flex items-center justify-center transition" style={{ border: `1px solid ${C.hairline}`, color: C.muted }}>
                  <ChevronsRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <style>{`@keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.3 } }`}</style>
      </div>
    </AdminLayout>
  );
}