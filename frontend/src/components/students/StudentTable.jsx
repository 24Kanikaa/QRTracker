import { useMemo, useState } from "react";
import {
  DoorOpen,
  Building2,
  Home,
  Laptop,
  UtensilsCrossed,
  IdCard,
  Library,
  CheckCircle2,
  Clock3,
  CircleDashed,
  Users,
  Calendar,
  ChevronDown,
  Sun,
  Moon,
} from "lucide-react";

/* ---------- desk columns (accent assigned cyclically below) ---------- */

const columns = [
  { title: "Gate", key: "gate", icon: DoorOpen },
  { title: "Admission", key: "admission", icon: Building2 },
  { title: "Hostel", key: "hostel", icon: Home },
  { title: "IT", key: "it", icon: Laptop },
  { title: "Mess", key: "mess", icon: UtensilsCrossed },
  { title: "ID", key: "idcard", icon: IdCard },
  { title: "Library", key: "library", icon: Library },
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

/* ---------- demo data — swap for real students prop ---------- */

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

/* ---------- shared bits (token-driven) ---------- */

function Progress({ progress, C }) {
  const isComplete = progress >= 100;
  return (
    <div className="w-[120px]">
      <div className="flex justify-between text-xs mb-2">
        <span className="font-semibold" style={{ color: isComplete ? C.green : C.text }}>
          {progress}%
        </span>
        <span style={{ color: C.muted }}>{Math.round((progress / 100) * 7)}/7</span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: C.hairline }}>
        <div
          className="h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%`, background: isComplete ? C.green : C.brass }}
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
        className="inline-flex items-center gap-2 px-3 py-1 rounded-full border"
        style={{ background: `${C.green}14`, borderColor: `${C.green}30` }}
      >
        <CheckCircle2 size={14} style={{ color: C.green }} />
        <span className="text-sm font-medium" style={{ color: C.green }}>
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
        className="w-10 h-10 rounded-full text-white flex items-center justify-center font-semibold shadow-sm shrink-0"
        style={{ background: `linear-gradient(135deg, ${C.brass}, ${C.amber})`, fontFamily: "'Fraunces', serif" }}
      >
        {student.name.charAt(0)}
      </div>
      <div className="min-w-0">
        <h3 className="font-semibold truncate" style={{ color: C.text }}>
          {student.name}
        </h3>
        <p className="text-xs truncate" style={{ color: C.muted }}>
          {student.email}
        </p>
      </div>
    </div>
  );
}

/* ---------- full desk-timing table (All / Completed / In Progress) ---------- */

function DeskTimingTable({ students, C, deskAccent }) {
  return (
    <div className="rounded-3xl overflow-hidden" style={{ background: C.panel, border: `1px solid ${C.hairline}`, boxShadow: C.cardShadow }}>
      <div className="overflow-x-auto lg:overflow-x-visible">
        <table className="w-full table-auto">
          <thead className="sticky top-0 z-20" style={{ background: C.panel, borderBottom: `1px solid ${C.hairline}` }}>
            <tr>
              <th className="px-5 py-5 text-left text-xs uppercase tracking-wider w-14" style={{ color: C.muted }}>#</th>
              <th className="px-5 py-5 text-left text-xs uppercase tracking-wider w-[280px]" style={{ color: C.muted }}>Student</th>
              <th className="px-5 py-5 text-left text-xs uppercase tracking-wider w-[140px]" style={{ color: C.muted }}>Progress</th>
              {columns.map((col, i) => {
                const Icon = col.icon;
                const accent = deskAccent(i);
                return (
                  <th key={col.key} className="px-3 py-4 text-center w-[90px]">
                    <div className="flex flex-col items-center gap-2">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ background: `${accent}18` }}
                      >
                        <Icon size={18} style={{ color: accent }} />
                      </div>
                      <span className="text-xs font-semibold" style={{ color: C.text }}>{col.title}</span>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {students.map((student, index) => (
              <tr
                key={student.id}
                className="transition-colors duration-200"
                style={{ borderBottom: `1px solid ${C.hairline}` }}
              >
                <td className="px-3 py-4">
                  <span
                    className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-medium"
                    style={{ background: C.hairline, color: C.muted }}
                  >
                    {index + 1}
                  </span>
                </td>
                <td className="px-5 py-5">
                  <StudentIdentity student={student} C={C} />
                </td>
                <td className="px-5 py-5">
                  <Progress progress={student.progress} C={C} />
                </td>
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-5">
                    <Cell value={student[col.key]} C={C} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------- simple list (Expected only — nothing checked in yet) ---------- */

function ExpectedList({ students, C }) {
  return (
    <div className="rounded-3xl overflow-hidden" style={{ background: C.panel, border: `1px solid ${C.hairline}`, boxShadow: C.cardShadow }}>
      <table className="w-full table-auto">
        <thead style={{ borderBottom: `1px solid ${C.hairline}` }}>
          <tr>
            <th className="px-5 py-5 text-left text-xs uppercase tracking-wider w-14" style={{ color: C.muted }}>#</th>
            <th className="px-5 py-5 text-left text-xs uppercase tracking-wider" style={{ color: C.muted }}>Student</th>
            <th className="px-5 py-5 text-left text-xs uppercase tracking-wider w-[160px]" style={{ color: C.muted }}>Admission day</th>
            <th className="px-5 py-5 text-right text-xs uppercase tracking-wider w-[160px]" style={{ color: C.muted }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student, index) => (
            <tr key={student.id} className="transition-colors duration-200" style={{ borderBottom: `1px solid ${C.hairline}` }}>
              <td className="px-3 py-4">
                <span
                  className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-medium"
                  style={{ background: C.hairline, color: C.muted }}
                >
                  {index + 1}
                </span>
              </td>
              <td className="px-5 py-5">
                <StudentIdentity student={student} C={C} />
              </td>
              <td className="px-5 py-5">
                <span className="text-sm" style={{ color: C.text }}>{formatDate(student.date)}</span>
              </td>
              <td className="px-5 py-5 text-right">
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
  );
}

/* ---------- main component ---------- */

export default function StudentTable({ students = DEMO_STUDENTS }) {
  const [dark, setDark] = useState(false);
  const [selectedDate, setSelectedDate] = useState("all");
  const [activeTab, setActiveTab] = useState("all");

  const C = dark
    ? {
        bg: "#131110",
        panel: "#1C1916",
        hairline: "rgba(255,255,255,0.08)",
        text: "#F5F1EA",
        muted: "#A39C90",
        brass: "#C9A24B",
        rose: "#D98E82",
        green: "#7FB88A",
        amber: "#D9B45C",
        cardShadow: "0 8px 24px rgba(0,0,0,0.35)",
      }
    : {
        bg: "#F7F4EC",
        panel: "#FFFFFF",
        hairline: "#E7E1D4",
        text: "#28241E",
        muted: "#7A7368",
        brass: "#B8863B",
        rose: "#B2564A",
        green: "#3F7D5C",
        amber: "#A67C2E",
        cardShadow: "0 4px 16px rgba(40,36,30,0.06)",
      };

  const deskAccentPalette = [C.brass, C.rose, C.green, C.amber];
  const deskAccent = (i) => deskAccentPalette[i % deskAccentPalette.length];

  const dates = useMemo(() => Array.from(new Set(students.map((s) => s.date))).sort(), [students]);

  const dateFiltered = useMemo(
    () => (selectedDate === "all" ? students : students.filter((s) => s.date === selectedDate)),
    [students, selectedDate]
  );

  const counts = useMemo(() => {
    const c = { all: dateFiltered.length, completed: 0, inprogress: 0, expected: 0 };
    dateFiltered.forEach((s) => {
      c[deriveStatus(s.progress)] += 1;
    });
    return c;
  }, [dateFiltered]);

  const visibleStudents = useMemo(
    () =>
      activeTab === "all"
        ? dateFiltered
        : dateFiltered.filter((s) => deriveStatus(s.progress) === activeTab),
    [dateFiltered, activeTab]
  );

  const tabs = [
    { key: "all", label: "All Students", icon: Users, count: counts.all },
    { key: "completed", label: "Completed", icon: CheckCircle2, count: counts.completed },
    { key: "inprogress", label: "In Progress", icon: Clock3, count: counts.inprogress },
    { key: "expected", label: "Expected", icon: CircleDashed, count: counts.expected },
  ];

  return (
    <div style={{ background: C.bg, minHeight: "100%" }} className="transition-colors duration-300 p-6 md:p-10 rounded-3xl">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&display=swap');`}</style>

      <div className="max-w-7xl mx-auto">
        {/* header: title + date filter + dark toggle */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] uppercase" style={{ color: C.brass }}>
              Admission Operations
            </p>
            <h1 className="text-4xl md:text-5xl font-semibold mt-2" style={{ color: C.text, fontFamily: "'Fraunces', serif" }}>
              Student Records
            </h1>
            <p className="text-sm mt-2" style={{ color: C.muted }}>
              Browse onboarding progress by admission day and status.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-full sm:w-56 shrink-0">
              <Calendar size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: C.muted }} />
              <select
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full appearance-none pl-10 pr-9 h-11 rounded-xl text-sm font-medium outline-none transition"
                style={{ background: C.panel, border: `1px solid ${C.hairline}`, color: C.text, boxShadow: C.cardShadow }}
              >
                <option value="all">All dates</option>
                {dates.map((d) => (
                  <option key={d} value={d}>
                    {formatDate(d)}
                  </option>
                ))}
              </select>
              <ChevronDown size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: C.muted }} />
            </div>

            <button
              onClick={() => setDark((d) => !d)}
              className="w-11 h-11 rounded-xl flex items-center justify-center transition shrink-0"
              style={{ background: C.panel, border: `1px solid ${C.hairline}`, color: C.brass, boxShadow: C.cardShadow }}
              title={dark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>

        {/* status tabs */}
        <div className="mb-6">
          <div
            className="inline-flex flex-wrap rounded-2xl p-1 gap-1"
            style={{ background: C.panel, border: `1px solid ${C.hairline}`, boxShadow: C.cardShadow }}
          >
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl font-medium text-sm transition-all"
                  style={{
                    background: active ? C.brass : "transparent",
                    color: active ? "#fff" : C.muted,
                  }}
                >
                  <Icon size={15} />
                  {tab.label}
                  <span
                    className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1 rounded-full text-xs font-semibold"
                    style={{ background: active ? "rgba(255,255,255,0.25)" : C.hairline, color: active ? "#fff" : C.muted }}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* table area */}
        {visibleStudents.length === 0 ? (
          <div className="rounded-3xl py-16 text-center" style={{ background: C.panel, border: `1px solid ${C.hairline}` }}>
            <p className="text-sm" style={{ color: C.muted }}>
              No students match this date and status combination.
            </p>
          </div>
        ) : activeTab === "expected" ? (
          <ExpectedList students={visibleStudents} C={C} />
        ) : (
          <DeskTimingTable students={visibleStudents} C={C} deskAccent={deskAccent} />
        )}
      </div>
    </div>
  );
}