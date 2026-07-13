import { useState, useEffect, useMemo, useRef } from "react";
import { useOutletContext } from "react-router-dom";
import {
  Users,
  UserCheck,
  Clock3,
  Building2,
  Home,
  Laptop,
  UtensilsCrossed,
  Library,
  Radio,
  ArrowUpRight,
  ArrowDownRight,
  Menu,
  Sun,
  Moon,
  ChevronDown,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
} from "recharts";
import { useTheme } from "../../context/ThemeContext";

/* ---------------------------------------------------------
   DATASETS
   "live"    -> today, still filling up
   "overall" -> historical, keyed by date filter (all / date1 / date2)
   Same shape for every entry so the UI below never branches on
   which one is active — it just reads from `data`.
--------------------------------------------------------- */

const DATASETS = {
  live: {
    heading: "Cumulative check-ins by hour, today",
    stats: {
      expected: { value: "1,200", subtitle: "Students registered", delta: "On target", direction: "up", spark: [{ v: 1180 }, { v: 1185 }, { v: 1190 }, { v: 1195 }, { v: 1198 }, { v: 1200 }, { v: 1200 }] },
      checkedIn: { value: "845", subtitle: "70% of expected", delta: "+12% / hr", direction: "up", spark: [{ v: 40 }, { v: 135 }, { v: 285 }, { v: 465 }, { v: 555 }, { v: 725 }, { v: 845 }] },
      completed: { value: "631", subtitle: "Finished all desks", delta: "+8% / hr", direction: "up", spark: [{ v: 20 }, { v: 90 }, { v: 210 }, { v: 340 }, { v: 420 }, { v: 540 }, { v: 631 }] },
      waiting: { value: "214", subtitle: "Currently in queue", delta: "Rising", direction: "down", spark: [{ v: 20 }, { v: 45 }, { v: 75 }, { v: 125 }, { v: 135 }, { v: 185 }, { v: 214 }] },
    },
    arrivalData: [
      { hour: "8a", cumulative: 40 }, { hour: "9a", cumulative: 135 }, { hour: "10a", cumulative: 285 },
      { hour: "11a", cumulative: 465 }, { hour: "12p", cumulative: 555 }, { hour: "1p", cumulative: 615 },
      { hour: "2p", cumulative: 725 }, { hour: "3p", cumulative: 795 }, { hour: "4p", cumulative: 835 }, { hour: "5p", cumulative: 845 },
    ],
    overallPct: 53,
    overallSubtitle: "631 of 1,200 fully onboarded",
    deskPerformanceRaw: [
      { name: "Admission", value: 84 }, { name: "Hostel", value: 72 }, { name: "IT Setup", value: 95 },
      { name: "Mess", value: 58 }, { name: "Library", value: 63 },
    ],
    recentStudents: [
      { name: "Ananya Sharma", id: "AD-2026-0841", desk: "Hostel", time: "10:34 AM", status: "Completed" },
      { name: "Rohit Verma", id: "AD-2026-0842", desk: "IT Setup", time: "10:31 AM", status: "Completed" },
      { name: "Priya Nair", id: "AD-2026-0843", desk: "Admission", time: "10:28 AM", status: "In Progress" },
      { name: "Karan Mehta", id: "AD-2026-0844", desk: "Library", time: "10:22 AM", status: "Completed" },
      { name: "Simran Kaur", id: "AD-2026-0845", desk: "Mess", time: "10:15 AM", status: "Waiting" },
    ],
  },

  overall: {
    all: {
      heading: "Cumulative check-ins by hour, across both days",
      stats: {
        expected: { value: "1,200", subtitle: "Students registered", delta: "2 days", direction: "up", spark: [{ v: 600 }, { v: 900 }, { v: 1050 }, { v: 1120 }, { v: 1160 }, { v: 1190 }, { v: 1200 }] },
        checkedIn: { value: "1,198", subtitle: "99.8% of expected", delta: "+1,198 total", direction: "up", spark: [{ v: 300 }, { v: 620 }, { v: 880 }, { v: 1020 }, { v: 1120 }, { v: 1170 }, { v: 1198 }] },
        completed: { value: "1,178", subtitle: "Finished all desks", delta: "98.3% completion", direction: "up", spark: [{ v: 250 }, { v: 560 }, { v: 820 }, { v: 980 }, { v: 1090 }, { v: 1150 }, { v: 1178 }] },
        waiting: { value: "20", subtitle: "Never completed", direction: "down", delta: "Follow up", spark: [{ v: 60 }, { v: 48 }, { v: 40 }, { v: 33 }, { v: 27 }, { v: 22 }, { v: 20 }] },
      },
      arrivalData: [
        { hour: "8a", cumulative: 80 }, { hour: "9a", cumulative: 270 }, { hour: "10a", cumulative: 560 },
        { hour: "11a", cumulative: 900 }, { hour: "12p", cumulative: 1060 }, { hour: "1p", cumulative: 1120 },
        { hour: "2p", cumulative: 1155 }, { hour: "3p", cumulative: 1180 }, { hour: "4p", cumulative: 1195 }, { hour: "5p", cumulative: 1198 },
      ],
      overallPct: 98,
      overallSubtitle: "1,178 of 1,200 fully onboarded",
      deskPerformanceRaw: [
        { name: "Admission", value: 97 }, { name: "Hostel", value: 95 }, { name: "IT Setup", value: 99 },
        { name: "Mess", value: 91 }, { name: "Library", value: 93 },
      ],
      recentStudents: [
        { name: "Devansh Gupta", id: "AD-2026-0921", desk: "Library", time: "Day 2 · 6:48 PM", status: "Completed" },
        { name: "Priya Iyer", id: "AD-2026-0918", desk: "Mess", time: "Day 2 · 6:40 PM", status: "Completed" },
        { name: "Kabir Singh", id: "AD-2026-0902", desk: "IT Setup", time: "Day 1 · 5:52 PM", status: "Completed" },
        { name: "Meera Nair", id: "AD-2026-0897", desk: "Hostel", time: "Day 1 · 5:31 PM", status: "Completed" },
        { name: "Ishita Verma", id: "AD-2026-0888", desk: "Admission", time: "Day 1 · 4:12 PM", status: "Waiting" },
      ],
    },

    date1: {
      heading: "Cumulative check-ins by hour, 18 July 2026",
      stats: {
        expected: { value: "600", subtitle: "Students registered", delta: "Day 1", direction: "up", spark: [{ v: 300 }, { v: 450 }, { v: 520 }, { v: 560 }, { v: 580 }, { v: 595 }, { v: 600 }] },
        checkedIn: { value: "600", subtitle: "100% of expected", delta: "All arrived", direction: "up", spark: [{ v: 120 }, { v: 260 }, { v: 400 }, { v: 500 }, { v: 560 }, { v: 590 }, { v: 600 }] },
        completed: { value: "588", subtitle: "Finished all desks", delta: "98% completion", direction: "up", spark: [{ v: 90 }, { v: 220 }, { v: 360 }, { v: 460 }, { v: 520 }, { v: 570 }, { v: 588 }] },
        waiting: { value: "12", subtitle: "Never completed", direction: "down", delta: "Follow up", spark: [{ v: 30 }, { v: 24 }, { v: 20 }, { v: 17 }, { v: 15 }, { v: 13 }, { v: 12 }] },
      },
      arrivalData: [
        { hour: "8a", cumulative: 40 }, { hour: "9a", cumulative: 135 }, { hour: "10a", cumulative: 285 },
        { hour: "11a", cumulative: 465 }, { hour: "12p", cumulative: 540 }, { hour: "1p", cumulative: 575 },
        { hour: "2p", cumulative: 590 }, { hour: "3p", cumulative: 596 }, { hour: "4p", cumulative: 599 }, { hour: "5p", cumulative: 600 },
      ],
      overallPct: 98,
      overallSubtitle: "588 of 600 fully onboarded",
      deskPerformanceRaw: [
        { name: "Admission", value: 99 }, { name: "Hostel", value: 96 }, { name: "IT Setup", value: 100 },
        { name: "Mess", value: 92 }, { name: "Library", value: 95 },
      ],
      recentStudents: [
        { name: "Kabir Singh", id: "AD-2026-0902", desk: "IT Setup", time: "5:52 PM", status: "Completed" },
        { name: "Meera Nair", id: "AD-2026-0897", desk: "Hostel", time: "5:31 PM", status: "Completed" },
        { name: "Ananya Sharma", id: "AD-2026-0891", desk: "Library", time: "5:02 PM", status: "Completed" },
        { name: "Ishita Verma", id: "AD-2026-0888", desk: "Admission", time: "4:12 PM", status: "Waiting" },
        { name: "Rohan Mehta", id: "AD-2026-0879", desk: "Mess", time: "3:40 PM", status: "Completed" },
      ],
    },

    date2: {
      heading: "Cumulative check-ins by hour, 19 July 2026",
      stats: {
        expected: { value: "600", subtitle: "Students registered", delta: "Day 2", direction: "up", spark: [{ v: 300 }, { v: 450 }, { v: 520 }, { v: 560 }, { v: 585 }, { v: 596 }, { v: 600 }] },
        checkedIn: { value: "598", subtitle: "99.7% of expected", delta: "2 no-shows", direction: "down", spark: [{ v: 110 }, { v: 250 }, { v: 390 }, { v: 480 }, { v: 545 }, { v: 585 }, { v: 598 }] },
        completed: { value: "590", subtitle: "Finished all desks", delta: "98.7% completion", direction: "up", spark: [{ v: 80 }, { v: 210 }, { v: 350 }, { v: 450 }, { v: 520 }, { v: 570 }, { v: 590 }] },
        waiting: { value: "8", subtitle: "Never completed", direction: "down", delta: "Follow up", spark: [{ v: 20 }, { v: 17 }, { v: 14 }, { v: 12 }, { v: 10 }, { v: 9 }, { v: 8 }] },
      },
      arrivalData: [
        { hour: "8a", cumulative: 35 }, { hour: "9a", cumulative: 120 }, { hour: "10a", cumulative: 260 },
        { hour: "11a", cumulative: 420 }, { hour: "12p", cumulative: 500 }, { hour: "1p", cumulative: 545 },
        { hour: "2p", cumulative: 570 }, { hour: "3p", cumulative: 588 }, { hour: "4p", cumulative: 595 }, { hour: "5p", cumulative: 598 },
      ],
      overallPct: 98,
      overallSubtitle: "590 of 600 fully onboarded",
      deskPerformanceRaw: [
        { name: "Admission", value: 95 }, { name: "Hostel", value: 94 }, { name: "IT Setup", value: 98 },
        { name: "Mess", value: 90 }, { name: "Library", value: 91 },
      ],
      recentStudents: [
        { name: "Devansh Gupta", id: "AD-2026-0921", desk: "Library", time: "6:48 PM", status: "Completed" },
        { name: "Priya Iyer", id: "AD-2026-0918", desk: "Mess", time: "6:40 PM", status: "Completed" },
        { name: "Vivaan Joshi", id: "AD-2026-0913", desk: "Admission", time: "5:10 PM", status: "Completed" },
        { name: "Simran Kaur", id: "AD-2026-0907", desk: "Hostel", time: "4:45 PM", status: "In Progress" },
        { name: "Aditya Rao", id: "AD-2026-0904", desk: "IT Setup", time: "4:02 PM", status: "Waiting" },
      ],
    },
  },
};

const DESK_ICONS = {
  Admission: Building2,
  Hostel: Home,
  "IT Setup": Laptop,
  Mess: UtensilsCrossed,
  Library: Library,
};

// First "tab" is a dropdown: today's date (live), then each other date.
// The button itself always just reads "Day Wise" — it's the list inside
// the dropdown that shows today's actual date as the selected entry.
const TODAY_LABEL = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

const DAYWISE_OPTIONS = [
  { key: "live", label: `${TODAY_LABEL} (Today)` },
  { key: "date1", label: "18 July 2026" },
  { key: "date2", label: "19 July 2026" },
];

/* ----------------------------- Chart bits ----------------------------- */

function Sparkline({ data, color }) {
  return (
    <div style={{ width: 88, height: 34 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={`spark-${color}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.45} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="v" stroke={color} strokeWidth={2} fill={`url(#spark-${color})`} isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function StatCard({ title, stat, icon, sparkColor, C }) {
  return (
    <div className="rounded-2xl p-5" style={{ background: C.panel, border: `1px solid ${C.hairline}`, boxShadow: C.cardShadow }}>
      <div className="flex items-start justify-between">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `${sparkColor}17`, color: sparkColor, border: `1px solid ${sparkColor}30` }}
        >
          {icon}
        </div>
        <div
          className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full"
          style={{
            color: stat.direction === "up" ? C.green : C.rose,
            background: stat.direction === "up" ? C.greenSoft : C.roseSoft,
          }}
        >
          {stat.direction === "up" ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {stat.delta}
        </div>
      </div>

      <p className="text-sm mt-4" style={{ color: C.muted }}>{title}</p>

      <div className="flex items-end justify-between mt-1">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight" style={{ color: C.text, fontFamily: "'Open Sans', sans-serif" }}>{stat.value}</h2>
          <p className="text-xs mt-1" style={{ color: C.mutedSoft }}>{stat.subtitle}</p>
        </div>
        <Sparkline data={stat.spark} color={sparkColor} />
      </div>
    </div>
  );
}

function LiveClock({ C }) {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const time = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const date = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  return (
    <div className="text-right">
      <div className="flex items-center justify-end gap-2">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: C.clockAccent }} />
          <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: C.clockAccent }} />
        </span>
        <span className="text-xs font-semibold tracking-widest" style={{ color: C.clockAccent }}>LIVE</span>
      </div>
      <p className="text-2xl font-semibold mt-1 tabular-nums" style={{ color: C.clockText}}>{time}</p>
      <p className="text-xs mt-0.5" style={{ color: C.clockDate }}>{date}</p>
    </div>
  );
}

function makeTooltip(C) {
  return function CustomTooltip({ active, payload, label }) {
    if (!active || !payload || !payload.length) return null;
    return (
      <div className="rounded-lg px-3 py-2 text-xs" style={{ background: C.tooltipBg, color: C.tooltipText }}>
        <p style={{ color: C.tooltipMuted }}>{label}</p>
        {payload.map((p) => (
          <p key={p.dataKey}>
            {p.name}: <span style={{ fontWeight: 600 }}>{p.value}</span>
          </p>
        ))}
      </div>
    );
  };
}

/* ----------------------------- Page ----------------------------- */

export default function Dashboard() {
  const { dark, toggleDark, C } = useTheme();
  const { setOpen: setSidebarOpen } = useOutletContext();

  // mode: which tab is active. "daywise" covers Live + individual dates
  // (chosen via the dropdown), "overall" is the combined view.
  const [mode, setMode] = useState("daywise");
  const [daywiseSelection, setDaywiseSelection] = useState("live");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const isLive = mode === "daywise" && daywiseSelection === "live";

  // Close the dropdown on outside click.
  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function chooseDaywise(key) {
    // Always fires, even if `key` matches the value already stored —
    // this is what a native <select> won't do when re-picking the
    // option that's already selected, which is why Live could get
    // stuck after visiting Overall.
    setMode("daywise");
    setDaywiseSelection(key);
    setDropdownOpen(false);
  }

  // Single source of truth for everything below.
  const data =
    mode === "overall"
      ? DATASETS.overall.all
      : daywiseSelection === "live"
      ? DATASETS.live
      : DATASETS.overall[daywiseSelection];

  const deskDetails = useMemo(() => {
    const palette = [C.brass, C.sky, C.green, C.rose, C.violet];
    const expectedTotal = Number(data.stats.expected.value.replace(/,/g, ""));
    return data.deskPerformanceRaw.map((d, i) => ({
      ...d,
      icon: DESK_ICONS[d.name] || Building2,
      color: palette[i % palette.length],
      expected: expectedTotal,
      processed: Math.round((expectedTotal * d.value) / 100),
    }));
  }, [data, C]);

  const CustomTooltip = useMemo(() => makeTooltip(C), [dark]);

  const statusStyle = {
    Completed: { bg: C.greenSoft, fg: C.green },
    "In Progress": { bg: C.brassSoft, fg: C.brass },
    Waiting: { bg: C.roseSoft, fg: C.rose },
  };

  const daywiseLabel = DAYWISE_OPTIONS.find((o) => o.key === daywiseSelection)?.label;

  return (
    <div style={{ background: C.bg, minHeight: "100vh", transition: "background 0.25s ease" }}>
      <style>{`
        ::-webkit-scrollbar { height: 6px; width: 6px; }
        ::-webkit-scrollbar-thumb { background: ${C.hairline}; border-radius: 4px; }
        @keyframes pageIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .page-transition { animation: pageIn 0.35s ease; }
      `}</style>

      <div>
        <div className="p-6 md:p-10">
          <div className="flex items-center justify-between gap-4 mb-6 lg:hidden">
            <button
              onClick={() => setSidebarOpen(true)}
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: C.panel, border: `1px solid ${C.hairline}`, color: C.text }}
            >
              <Menu size={20} />
            </button>
            {isLive && (
              <button
                onClick={toggleDark}
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: C.panel, border: `1px solid ${C.hairline}`, color: C.brass }}
              >
                {dark ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            )}
          </div>

          <div className="mb-6">
            <div className="inline-flex items-center rounded-2xl p-1 w-fit" style={{ background: C.panel, border: `1px solid ${C.hairline}`, boxShadow: C.cardShadow }}>
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setDropdownOpen((o) => !o)}
                  className="flex items-center gap-2 pl-5 pr-3 py-2.5 rounded-xl font-medium text-m outline-none cursor-pointer transition-all"
                  style={{
                    background: mode === "daywise" ? C.brass : "transparent",
                    color: mode === "daywise" ? "#fff" : C.muted,
                  }}
                >
                  Day Wise
                  <ChevronDown size={14} style={{ color: mode === "daywise" ? "#fff" : C.mutedSoft }} />
                </button>

                {dropdownOpen && (
                  <div
                    className="absolute top-full left-0 mt-2 rounded-xl overflow-hidden z-20"
                    style={{ background: C.panel, border: `1px solid ${C.hairline}`, boxShadow: C.cardShadow, minWidth: 170 }}
                  >
                    {DAYWISE_OPTIONS.map((opt) => {
                      const isActive = mode === "daywise" && daywiseSelection === opt.key;
                      return (
                        <button
                          key={opt.key}
                          type="button"
                          onClick={() => chooseDaywise(opt.key)}
                          className="w-full text-left px-4 py-2.5 text-sm transition-colors whitespace-nowrap"
                          style={{ color: isActive ? C.brass : C.text, background: isActive ? C.brassSoft : "transparent" }}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
              <button
                onClick={() => {
                  setMode("overall");
                  setDropdownOpen(false);
                }}
                className="px-5 py-2.5 rounded-xl font-medium text-sm transition-all"
                style={{ background: mode === "overall" ? C.brass : "transparent", color: mode === "overall" ? "#fff" : C.muted }}
              >
                Overall
              </button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6">
            <div>
              <div className="flex items-center gap-3">
                <p className="text-xs  tracking-[0.2em] uppercase" style={{ color: C.brass }}>
                  Onboarding Control Room
                </p>
                {isLive && (
                  <span className="flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full" style={{ color: C.brass, background: C.brassSoft }}>
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: C.brass }} />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ background: C.brass }} />
                    </span>
                    LIVE
                  </span>
                )}
              </div>
              <h1
                className="text-4xl md:text-5xl font-semibold mt-2 mb-5"
                style={{
                  color: C.text,
                  fontFamily: "'Open Sans', sans-serif",
                }}
              >
                {mode === "overall" ? "Onboarding Dashboard " : "Onboarding Dashboard (Day Wise)"}
              </h1>
              <p className="mt-2" style={{ color: C.muted }}>
                {mode === "overall"
                  ? "Combined view of onboarding across both admission days"
                  : isLive
                  ? "Live monitoring of today's onboarding process across every desk"
                  : `Onboarding summary for ${daywiseLabel}`}
              </p>
            </div>

            {isLive && (
              <div className="hidden md:flex items-center gap-3">
                <button
                  onClick={toggleDark}
                  className="w-11 h-11 rounded-xl flex items-center justify-center transition"
                  style={{ background: C.panel, border: `1px solid ${C.hairline}`, color: C.brass, boxShadow: C.cardShadow }}
                  title={dark ? "Switch to light mode" : "Switch to dark mode"}
                >
                  {dark ? <Sun size={18} /> : <Moon size={18} />}
                </button>

                <div
                  className="rounded-2xl px-6 py-4"
                  style={{
                    background: C.clockGradient || C.panel,
                    border: C.clockGradient ? "none" : `1px solid ${C.hairline}`,
                    boxShadow: C.clockShadow,
                  }}
                >
                  <LiveClock C={C} />
                </div>
              </div>
            )}
          </div>

          {/* Everything below re-mounts (and re-animates) whenever the
              tab or date filter changes, so it reads as a page change
              rather than a data swap. */}
          <div key={`${mode}-${daywiseSelection}`} className="page-transition">

          {/* Overview */}
          <div className="grid xl:grid-cols-4 md:grid-cols-2 gap-5">
            <StatCard C={C} title="Expected" stat={data.stats.expected} icon={<Users size={20} />} sparkColor={C.sky} />
            <StatCard C={C} title="Checked In" stat={data.stats.checkedIn} icon={<UserCheck size={20} />} sparkColor={C.brass} />
            <StatCard C={C} title="Completed" stat={data.stats.completed} icon={<Building2 size={20} />} sparkColor={C.green} />
            <StatCard C={C} title="Pending" stat={data.stats.waiting} icon={<Clock3 size={20} />} sparkColor={C.rose} />
          </div>

          {mode === "daywise" ? (
            <>
              {/* Charts row: Arrival Flow + Overall Completion — unchanged from the original layout */}
              <div className="grid xl:grid-cols-3 gap-5 mt-6">
                <div className="xl:col-span-2 rounded-2xl p-6" style={{ background: C.panel, border: `1px solid ${C.hairline}`, boxShadow: C.cardShadow }}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-lg font-semibold" style={{ color: C.text }}>Arrival Flow</h2>
                      <p className="text-sm mt-1" style={{ color: C.muted }}>{data.heading}</p>
                    </div>
                    <Radio size={18} style={{ color: C.brass }} />
                  </div>

                  <div className="mt-6" style={{ height: 260 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={data.arrivalData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                        <defs>
                          <linearGradient id="cumFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={C.brass} stopOpacity={0.3} />
                            <stop offset="100%" stopColor={C.brass} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={C.hairlineSoft} vertical={false} />
                        <XAxis dataKey="hour" stroke={C.mutedSoft} fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke={C.mutedSoft} fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="cumulative" name="Checked in" stroke={C.brass} strokeWidth={2.5} fill="url(#cumFill)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="rounded-2xl p-6 flex flex-col" style={{ background: C.panel, border: `1px solid ${C.hairline}`, boxShadow: C.cardShadow }}>
                  <h2 className="text-lg font-semibold" style={{ color: C.text }}>Overall Completion</h2>
                  <p className="text-sm mt-1" style={{ color: C.muted }}>{data.overallSubtitle}</p>

                  <div className="flex-1 flex items-center justify-center" style={{ minHeight: 220 }}>
                    <div style={{ width: "100%", height: 220, position: "relative" }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <RadialBarChart innerRadius="72%" outerRadius="100%" data={[{ name: "Completed", value: data.overallPct, fill: C.brass }]} startAngle={90} endAngle={-270}>
                          <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                          <RadialBar background={{ fill: C.hairlineSoft }} dataKey="value" cornerRadius={12} />
                        </RadialBarChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ pointerEvents: "none" }}>
                        <span className="text-4xl font-semibold" style={{ color: C.text, fontFamily: "'Open Sans', sans-serif" }}>{data.overallPct}%</span>
                        <span className="text-xs mt-1" style={{ color: C.mutedSoft }}>onboarded</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Students takes the spot the Desk Performance chart used to occupy, next to Desk Report */}
              <div className="grid xl:grid-cols-3 gap-5 mt-5">
                <div className="xl:col-span-2 rounded-2xl overflow-hidden" style={{ background: C.panel, border: `1px solid ${C.hairline}`, boxShadow: C.cardShadow }}>
                  <div className="px-6 py-5" style={{ borderBottom: `1px solid ${C.hairline}` }}>
                    <h2 className="text-lg font-semibold" style={{ color: C.text }}>Recent Students</h2>
                    <p className="text-sm mt-1" style={{ color: C.muted }}>
                      {isLive ? "Latest desk activity across campus" : `Desk activity · ${daywiseLabel}`}
                    </p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left" style={{ color: C.mutedSoft }}>
                          <th className="px-6 py-3 font-medium">Student</th>
                          <th className="px-4 py-3 font-medium">ID</th>
                          <th className="px-4 py-3 font-medium">Desk</th>
                          <th className="px-4 py-3 font-medium">Time</th>
                          <th className="px-4 py-3 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.recentStudents.map((s, i) => (
                          <tr key={i} style={{ borderTop: `1px solid ${C.hairlineSoft}` }}>
                            <td className="px-6 py-4 font-medium" style={{ color: C.text }}>{s.name}</td>
                            <td className="px-4 py-4" style={{ color: C.mutedSoft}}>{s.id}</td>
                            <td className="px-4 py-4" style={{ color: C.muted }}>{s.desk}</td>
                            <td className="px-4 py-4" style={{ color: C.muted}}>{s.time}</td>
                            <td className="px-4 py-4">
                              <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ background: statusStyle[s.status].bg, color: statusStyle[s.status].fg }}>
                                {s.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="rounded-2xl p-6" style={{ background: C.panel, border: `1px solid ${C.hairline}`, boxShadow: C.cardShadow }}>
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold" style={{ color: C.text }}>Desk Report</h2>
                    <span className="text-xs font-medium" style={{ color: C.mutedSoft }}>{deskDetails.length} desks</span>
                  </div>
                  <p className="text-sm mt-1" style={{ color: C.muted }}>Processed vs. expected, desk by desk</p>

                  <div className="mt-5 space-y-4">
                    {deskDetails.map((d, i) => {
                      const Icon = d.icon;
                      const remaining = d.expected - d.processed;
                      const statusColor = d.value >= 90 ? C.green : d.value >= 70 ? C.brass : C.rose;
                      const statusBg = d.value >= 90 ? C.greenSoft : d.value >= 70 ? C.brassSoft : C.roseSoft;
                      return (
                        <div key={d.name} className="pb-4" style={{ borderBottom: i < deskDetails.length - 1 ? `1px solid ${C.hairlineSoft}` : "none" }}>
                          <div className="flex gap-3 items-start">
                            <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${d.color}17`, color: d.color }}>
                              <Icon size={16} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-sm font-medium truncate" style={{ color: C.text }}>{d.name}</p>
                                <span className="text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: statusBg, color: statusColor }}>
                                  {d.value}%
                                </span>
                              </div>
                              <p className="text-xs mt-0.5" style={{ color: C.muted }}>
                                <span >{d.processed}</span> of {d.expected} processed
                              </p>
                              <div className="h-1.5 rounded-full mt-2 overflow-hidden" style={{ background: C.hairlineSoft }}>
                                <div className="h-full rounded-full transition-all duration-300" style={{ width: `${d.value}%`, background: d.color }} />
                              </div>
                              <p className="text-xs mt-1.5" style={{ color: remaining === 0 ? C.green : C.mutedSoft }}>
                                {remaining === 0 ? "All done" : `${remaining} left`}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Overall tab: Desk Performance (older bar-chart design, now with quick stats)
                  next to Overall Completion (also with quick stats) */}
              <div className="grid xl:grid-cols-3 gap-5 mt-6">
                <div className="xl:col-span-2 rounded-2xl p-6" style={{ background: C.panel, }}>
                  {/* <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-lg font-semibold" style={{ color: C.text }}>Desk Performance</h2>
                      <p className="text-sm mt-1" style={{ color: C.muted }}>Share of assigned students processed</p>
                    </div>
                    <span className="text-xs font-medium" style={{ color: C.mutedSoft }}>{deskDetails.length} desks</span>
                  </div> */}

                  {/* quick stats */}
                  {/* {deskStats && (
                    <div className="grid grid-cols-3 gap-3 mt-5 mb-10">
                      <div className="rounded-xl p-3" style={{ background: C.panel2, border: `1px solid ${C.hairlineSoft}` }}>
                        <p className="text-xs" style={{ color: C.mutedSoft }}>Top desk</p>
                        <p className="text-sm font-semibold mt-0.5 truncate" style={{ color: C.text }}>{deskStats.best.name}</p>
                        <p className="text-xs mt-0.5 font-medium" style={{ color: C.green }}>{deskStats.best.value}%</p>
                      </div>
                      <div className="rounded-xl p-3" style={{ background: C.panel2, border: `1px solid ${C.hairlineSoft}` }}>
                        <p className="text-xs" style={{ color: C.mutedSoft }}>Needs attention</p>
                        <p className="text-sm font-semibold mt-0.5 truncate" style={{ color: C.text }}>{deskStats.worst.name}</p>
                        <p className="text-xs mt-0.5 font-medium" style={{ color: C.rose }}>{deskStats.worst.value}%</p>
                      </div>
                      <div className="rounded-xl p-3" style={{ background: C.panel2, border: `1px solid ${C.hairlineSoft}` }}>
                        <p className="text-xs" style={{ color: C.mutedSoft }}>Average</p>
                        <p className="text-sm font-semibold mt-0.5" style={{ color: C.text }}>{deskStats.avg}%</p>
                        <p className="text-xs mt-0.5 font-medium" style={{ color: C.brass }}>across all desks</p>
                      </div>
                    </div>
                  )} */}
                  

                  <div className="rounded-2xl p-6" style={{ background: C.panel, border: `1px solid ${C.hairline}`, boxShadow: C.cardShadow }}>
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold" style={{ color: C.text }}>Desk Report</h2>
                    <span className="text-xs font-medium" style={{ color: C.mutedSoft }}>{deskDetails.length} desks</span>
                  </div>
                  <p className="text-sm mt-1" style={{ color: C.muted }}>Processed vs. expected, desk by desk</p>

                  <div className="mt-5 space-y-4">
                    {deskDetails.map((d, i) => {
                      const Icon = d.icon;
                      const remaining = d.expected - d.processed;
                      const statusColor = d.value >= 90 ? C.green : d.value >= 70 ? C.brass : C.rose;
                      const statusBg = d.value >= 90 ? C.greenSoft : d.value >= 70 ? C.brassSoft : C.roseSoft;
                      return (
                        <div key={d.name} className="pb-4" style={{ borderBottom: i < deskDetails.length - 1 ? `1px solid ${C.hairlineSoft}` : "none" }}>
                          <div className="flex gap-3 items-start">
                            <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${d.color}17`, color: d.color }}>
                              <Icon size={16} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-sm font-medium truncate" style={{ color: C.text }}>{d.name}</p>
                                <span className="text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: statusBg, color: statusColor }}>
                                  {d.value}%
                                </span>
                              </div>
                              <p className="text-xs mt-0.5" style={{ color: C.muted }}>
                                <span>{d.processed}</span> of {d.expected} processed
                              </p>
                              <div className="h-1.5 rounded-full mt-2 overflow-hidden" style={{ background: C.hairlineSoft }}>
                                <div className="h-full rounded-full transition-all duration-300" style={{ width: `${d.value}%`, background: d.color }} />
                              </div>
                              <p className="text-xs mt-1.5" style={{ color: remaining === 0 ? C.green : C.mutedSoft }}>
                                {remaining === 0 ? "All done" : `${remaining} left`}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                </div>

                <div className="rounded-2xl p-6 flex flex-col" style={{ background: C.panel, border: `1px solid ${C.hairline}`, boxShadow: C.cardShadow }}>
                  <h2 className="text-lg font-semibold" style={{ color: C.text }}>Overall Completion</h2>
                  <p className="text-sm mt-1" style={{ color: C.muted }}>{data.overallSubtitle}</p>

                  <div className="flex items-center justify-center mt-2" style={{ height: 190 }}>
                    <div style={{ width: "100%", height: "100%", position: "relative" }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <RadialBarChart innerRadius="72%" outerRadius="100%" data={[{ name: "Completed", value: data.overallPct, fill: C.brass }]} startAngle={90} endAngle={-270}>
                          <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                          <RadialBar background={{ fill: C.hairlineSoft }} dataKey="value" cornerRadius={12} />
                        </RadialBarChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ pointerEvents: "none" }}>
                        <span className="text-4xl font-semibold" style={{ color: C.text, fontFamily: "'Open Sans', sans-serif" }}>{data.overallPct}%</span>
                        <span className="text-xs mt-1" style={{ color: C.mutedSoft }}>onboarded</span>
                      </div>
                    </div>
                  </div>

                  {/* quick stats */}
                  <div className="grid grid-cols-3 gap-2 mt-2 pt-4" style={{ borderTop: `1px solid ${C.hairlineSoft}` }}>
                    <div className="text-center">
                      <p className="text-xs" style={{ color: C.mutedSoft }}>Checked in</p>
                      <p className="text-sm font-semibold mt-0.5" style={{ color: C.text, fontFamily: "'Open Sans', sans-serif" }}>{data.stats.checkedIn.value}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs" style={{ color: C.mutedSoft }}>Completed</p>
                      <p className="text-sm font-semibold mt-0.5" style={{ color: C.green}}>{data.stats.completed.value}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs" style={{ color: C.mutedSoft }}>Waiting</p>
                      <p className="text-sm font-semibold mt-0.5" style={{ color: C.rose}}>{data.stats.waiting.value}</p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          </div>
          {/* end page-transition wrapper */}
        </div>
      </div>
    </div>
  );
}