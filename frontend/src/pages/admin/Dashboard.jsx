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
  Menu,
  Sun,
  Moon,
  ChevronDown,
  Loader2,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
} from "recharts";
import { useTheme } from "../../context/ThemeContext";
import {
  getAdmissionDates,
  getDashboardData,
} from "../../services/Dashboardservice";

const DESK_ICONS = {
  Admission: Building2,
  Hostel: Home,
  "IT Setup": Laptop,
  Mess: UtensilsCrossed,
  Library: Library,
};

function formatDateLabel(dateStr) {
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

function formatNumber(n) {
  return Number(n || 0).toLocaleString();
}

function formatTime(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

/* ----------------------------- Chart bits ----------------------------- */

function Sparkline({ data, color }) {
  if (!data || !data.length) return null;
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

// Backend currently sends { value, subtitle } only for each stat —
// delta/direction/spark are optional extras, rendered only when present.
function StatCard({ title, stat, icon, sparkColor, C }) {
  const value = typeof stat.value === "number" ? formatNumber(stat.value) : stat.value;
  return (
    <div className="rounded-2xl p-5" style={{ background: C.panel, border: `1px solid ${C.hairline}`, boxShadow: C.cardShadow }}>
      <div className="flex items-start justify-between">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `${sparkColor}17`, color: sparkColor, border: `1px solid ${sparkColor}30` }}
        >
          {icon}
        </div>
        {stat.delta && (
          <div
            className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full"
            style={{
              color: stat.direction === "down" ? C.rose : C.green,
              background: stat.direction === "down" ? C.roseSoft : C.greenSoft,
            }}
          >
            <ArrowUpRight size={12} />
            {stat.delta}
          </div>
        )}
      </div>

      <p className="text-sm mt-4" style={{ color: C.muted }}>{title}</p>

      <div className="flex items-end justify-between mt-1">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight" style={{ color: C.text, fontFamily: "'Open Sans', sans-serif" }}>{value}</h2>
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
      <p className="text-2xl font-semibold mt-1 tabular-nums" style={{ color: C.clockText }}>{time}</p>
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

  // mode: "daywise" (a single admission date, possibly today/live) or "overall"
  const [mode, setMode] = useState("daywise");

  // [{ date: "2026-07-18", isToday: false }, ...] from admission_year
  const [admissionDates, setAdmissionDates] = useState([]);
  const [datesError, setDatesError] = useState(null);

  // The date currently selected in the dropdown, kept in sync with whatever
  // the backend resolves as `selectedDate` after each dashboard-data fetch.
  const [daywiseSelection, setDaywiseSelection] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [data, setData] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState(null);

  // isLive comes straight from the backend — true only when the selected
  // date is genuinely today's admission date (server clock), never a
  // client-side guess. Overall mode is never "live".
  const isLive = mode === "daywise" && !!data?.isLive;

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

  // Load admission dates once, to populate the Day Wise dropdown.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setDatesError(null);
        const res = await getAdmissionDates();
        if (!cancelled) setAdmissionDates(res.data || []);
      } catch (err) {
        if (!cancelled) {
          setDatesError(err?.response?.data?.message || err.message || "Could not load admission dates");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Fetch dashboard data whenever mode or the selected date changes.
  // On first daywise load, daywiseSelection is null — the backend resolves
  // that to today (or a sensible fallback) and reports it via selectedDate.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setDataLoading(true);
        setDataError(null);
        const res = await getDashboardData({
          mode,
          date: mode === "daywise" ? daywiseSelection : null,
        });
        if (cancelled) return;
        setData(res.data);
        if (mode === "daywise") {
          setDaywiseSelection(res.data.selectedDate);
        }
      } catch (err) {
        if (!cancelled) {
          setDataError(err?.response?.data?.message || err.message || "Could not load dashboard data");
        }
      } finally {
        if (!cancelled) setDataLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, mode === "daywise" ? daywiseSelection : null]);

  function chooseDaywise(dateKey) {
    // Always fires, even if dateKey matches what's already selected —
    // this is what a native <select> won't do when re-picking the same
    // option, which previously caused Live to get "stuck" after Overall.
    setMode("daywise");
    setDaywiseSelection(dateKey);
    setDropdownOpen(false);
  }

  const daywiseOptions = useMemo(
    () =>
      admissionDates.map((d) => ({
        key: d.date,
        label: d.isToday ? `${formatDateLabel(d.date)} (Today)` : formatDateLabel(d.date),
      })),
    [admissionDates]
  );

  const deskDetails = useMemo(() => {
    if (!data) return [];
    const palette = [C.brass, C.sky, C.green, C.rose, C.violet];
    const expectedTotal = Number(data.stats?.expected?.value || 0);
    return (data.deskPerformanceRaw || []).map((d, i) => ({
      ...d,
      icon: DESK_ICONS[d.name] || Building2,
      color: palette[i % palette.length],
      expected: d.expected ?? expectedTotal,
      processed: d.processed ?? Math.round((expectedTotal * d.value) / 100),
    }));
  }, [data, C]);

  const CustomTooltip = useMemo(() => makeTooltip(C), [dark]);

  const statusStyle = {
    Completed: { bg: C.greenSoft, fg: C.green },
    "In Progress": { bg: C.brassSoft, fg: C.brass },
    Waiting: { bg: C.roseSoft, fg: C.rose },
  };

  const daywiseLabel = daywiseOptions.find((o) => o.key === daywiseSelection)?.label;

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
                    {datesError && (
                      <div className="px-4 py-2.5 text-sm" style={{ color: C.rose }}>Couldn't load dates</div>
                    )}
                    {!datesError && daywiseOptions.length === 0 && (
                      <div className="px-4 py-2.5 text-sm" style={{ color: C.mutedSoft }}>No admission dates yet</div>
                    )}
                    {daywiseOptions.map((opt) => {
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
                <p className="text-xs tracking-[0.2em] uppercase" style={{ color: C.brass }}>
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
                style={{ color: C.text, fontFamily: "'Open Sans', sans-serif" }}
              >
                {mode === "overall" ? "Onboarding Dashboard" : "Onboarding Dashboard (Day Wise)"}
              </h1>
              <p className="mt-2" style={{ color: C.muted }}>
                {mode === "overall"
                  ? "Combined view of onboarding across all admission dates"
                  : isLive
                  ? "Live monitoring of today's onboarding process across every desk"
                  : daywiseLabel
                  ? `Onboarding summary for ${daywiseLabel}`
                  : "Loading…"}
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

          {dataLoading && !data && (
            <div className="flex items-center gap-2 py-16 justify-center" style={{ color: C.muted }}>
              <Loader2 size={18} className="animate-spin" />
              Loading dashboard…
            </div>
          )}

          {dataError && !data && (
            <div className="rounded-2xl p-6 text-sm" style={{ background: C.roseSoft, color: C.rose }}>
              Couldn't load dashboard data: {dataError}
            </div>
          )}

          {data && (
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
                  {/* Charts row: Arrival Flow + Overall Completion */}
                  <div className="grid xl:grid-cols-3 gap-5 mt-6">
                    <div className="xl:col-span-2 rounded-2xl p-6" style={{ background: C.panel, border: `1px solid ${C.hairline}`, boxShadow: C.cardShadow }}>
                      <div className="flex justify-between items-start">
                        <div>
                          <h2 className="text-lg font-semibold" style={{ color: C.text }}>Arrival Flow</h2>
                          <p className="text-sm mt-1" style={{ color: C.muted }}>
                            Cumulative check-ins by hour, {daywiseLabel}
                          </p>
                        </div>
                        <Radio size={18} style={{ color: C.brass }} />
                      </div>

                      <div className="mt-6" style={{ height: 260 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={data.arrivalData || []} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
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

                  {/* Recent Students + Desk Report */}
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
                            {(data.recentStudents || []).length === 0 && (
                              <tr>
                                <td colSpan={5} className="px-6 py-6 text-center" style={{ color: C.mutedSoft }}>
                                  No scans yet for this date
                                </td>
                              </tr>
                            )}
                            {(data.recentStudents || []).map((s, i) => (
                              <tr key={i} style={{ borderTop: `1px solid ${C.hairlineSoft}` }}>
                                <td className="px-6 py-4 font-medium" style={{ color: C.text }}>{s.name}</td>
                                <td className="px-4 py-4" style={{ color: C.mutedSoft }}>{s.id}</td>
                                <td className="px-4 py-4" style={{ color: C.muted }}>{s.desk}</td>
                                <td className="px-4 py-4" style={{ color: C.muted }}>{formatTime(s.time)}</td>
                                <td className="px-4 py-4">
                                  <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ background: statusStyle[s.status]?.bg, color: statusStyle[s.status]?.fg }}>
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
                            <div key={d.id ?? d.name} className="pb-4" style={{ borderBottom: i < deskDetails.length - 1 ? `1px solid ${C.hairlineSoft}` : "none" }}>
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
                                    <span>{formatNumber(d.processed)}</span> of {formatNumber(d.expected)} processed
                                  </p>
                                  <div className="h-1.5 rounded-full mt-2 overflow-hidden" style={{ background: C.hairlineSoft }}>
                                    <div className="h-full rounded-full transition-all duration-300" style={{ width: `${d.value}%`, background: d.color }} />
                                  </div>
                                  <p className="text-xs mt-1.5" style={{ color: remaining === 0 ? C.green : C.mutedSoft }}>
                                    {remaining === 0 ? "All done" : `${formatNumber(remaining)} left`}
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
                <div className="grid xl:grid-cols-3 gap-5 mt-6">
                  <div className="xl:col-span-2 rounded-2xl p-6" style={{ background: C.panel }}>
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
                            <div key={d.id ?? d.name} className="pb-4" style={{ borderBottom: i < deskDetails.length - 1 ? `1px solid ${C.hairlineSoft}` : "none" }}>
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
                                    <span>{formatNumber(d.processed)}</span> of {formatNumber(d.expected)} processed
                                  </p>
                                  <div className="h-1.5 rounded-full mt-2 overflow-hidden" style={{ background: C.hairlineSoft }}>
                                    <div className="h-full rounded-full transition-all duration-300" style={{ width: `${d.value}%`, background: d.color }} />
                                  </div>
                                  <p className="text-xs mt-1.5" style={{ color: remaining === 0 ? C.green : C.mutedSoft }}>
                                    {remaining === 0 ? "All done" : `${formatNumber(remaining)} left`}
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

                    <div className="grid grid-cols-3 gap-2 mt-2 pt-4" style={{ borderTop: `1px solid ${C.hairlineSoft}` }}>
                      <div className="text-center">
                        <p className="text-xs" style={{ color: C.mutedSoft }}>Checked in</p>
                        <p className="text-sm font-semibold mt-0.5" style={{ color: C.text, fontFamily: "'Open Sans', sans-serif" }}>{formatNumber(data.stats.checkedIn.value)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs" style={{ color: C.mutedSoft }}>Completed</p>
                        <p className="text-sm font-semibold mt-0.5" style={{ color: C.green }}>{formatNumber(data.stats.completed.value)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs" style={{ color: C.mutedSoft }}>Waiting</p>
                        <p className="text-sm font-semibold mt-0.5" style={{ color: C.rose }}>{formatNumber(data.stats.waiting.value)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}