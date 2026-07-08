import { useState, useEffect, useMemo } from "react";
import {

  Users,
  UserCheck,
  Clock3,
  Building2,

  Radio,
  ArrowUpRight,
  ArrowDownRight,
  Menu,

  Sun,
  Moon,
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
import Sidebar from "../../components/layout/Sidebar";
/* ---------------------------------------------------------
   Two palettes, one token shape.
   LIGHT: white cards on a barely-tinted mint page.
   DARK: the neutral dark-slate + teal-accent control room.
--------------------------------------------------------- */
const LIGHT = {
  bg: "#F2F8F7",
  panel: "#FFFFFF",
  panel2: "#F6FBFA",
  hairline: "#E1EFEC",
  hairlineSoft: "#EDF6F4",
  text: "#12302C",
  muted: "#5E7D79",
  mutedSoft: "#93B0AC",
  brass: "#14B8A6",
  brassSoft: "#14B8A61A",
  rose: "#F43F5E",
  roseSoft: "#F43F5E1A",
  green: "#10B981",
  greenSoft: "#10B9811A",
  sky: "#0EA5E9",
  violet: "#8B5CF6",
  tooltipBg: "#12302C",
  tooltipText: "#F2F8F7",
  tooltipMuted: "#B7D6D1",
  cardShadow: "0 1px 2px rgba(18,48,44,0.04)",
  clockGradient: null,
  clockAccent: "#14B8A6",
  clockShadow: "0 1px 2px rgba(18,48,44,0.04)",
  clockText: "#12302C",
  clockDate: "#93B0AC",
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
  brass: "#2DD4BF",
  brassSoft: "#2DD4BF26",
  rose: "#F97362",
  roseSoft: "#F9736226",
  green: "#4ADE9A",
  greenSoft: "#4ADE9A26",
  sky: "#38BDF8",
  violet: "#A78BFA",
  tooltipBg: "#0B2824",
  tooltipText: "#EAF7F3",
  tooltipMuted: "#8FC7BC",
  cardShadow: "0 1px 2px rgba(0,0,0,0.3)",
  clockGradient: "linear-gradient(135deg, #0F5C52 0%, #0E7A6D 55%, #16A599 100%)",
  clockAccent: "#FFE8B8",
  clockShadow: "0 8px 24px rgba(45,212,191,0.18)",
  clockText: "#FFFFFF",
  clockDate: "#D7F3EC",
};

const arrivalData = [
  { hour: "8a", cumulative: 40 },
  { hour: "9a", cumulative: 135 },
  { hour: "10a", cumulative: 285 },
  { hour: "11a", cumulative: 465 },
  { hour: "12p", cumulative: 555 },
  { hour: "1p", cumulative: 615 },
  { hour: "2p", cumulative: 725 },
  { hour: "3p", cumulative: 795 },
  { hour: "4p", cumulative: 835 },
  { hour: "5p", cumulative: 845 },
];

const sparklineExpected = [{ v: 1180 }, { v: 1185 }, { v: 1190 }, { v: 1195 }, { v: 1198 }, { v: 1200 }, { v: 1200 }];
const sparklineCheckedIn = [{ v: 40 }, { v: 135 }, { v: 285 }, { v: 465 }, { v: 555 }, { v: 725 }, { v: 845 }];
const sparklineCompleted = [{ v: 20 }, { v: 90 }, { v: 210 }, { v: 340 }, { v: 420 }, { v: 540 }, { v: 631 }];
const sparklineWaiting = [{ v: 20 }, { v: 45 }, { v: 75 }, { v: 125 }, { v: 135 }, { v: 185 }, { v: 214 }];

function buildDeskPerformance(C) {
  return [
    { name: "Admission", value: 84, color: C.brass },
    { name: "Hostel", value: 72, color: C.sky },
    { name: "IT Setup", value: 95, color: C.green },
    { name: "Mess", value: 58, color: C.rose },
    { name: "Library", value: 63, color: C.violet },
  ];
}

const liveActivity = [
  { name: "Ananya Sharma", desk: "Hostel Desk", time: "2 mins ago" },
  { name: "Rohit Verma", desk: "IT Setup", time: "4 mins ago" },
  { name: "Priya Nair", desk: "Admission Desk", time: "6 mins ago" },
  { name: "Karan Mehta", desk: "Library", time: "9 mins ago" },
  { name: "Simran Kaur", desk: "Mess Counter", time: "12 mins ago" },
];

const recentStudents = [
  { name: "Ananya Sharma", id: "AD-2026-0841", desk: "Hostel", time: "10:34 AM", status: "Completed" },
  { name: "Rohit Verma", id: "AD-2026-0842", desk: "IT Setup", time: "10:31 AM", status: "Completed" },
  { name: "Priya Nair", id: "AD-2026-0843", desk: "Admission", time: "10:28 AM", status: "In Progress" },
  { name: "Karan Mehta", id: "AD-2026-0844", desk: "Library", time: "10:22 AM", status: "Completed" },
  { name: "Simran Kaur", id: "AD-2026-0845", desk: "Mess", time: "10:15 AM", status: "Waiting" },
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

function StatCard({ title, value, subtitle, icon, delta, deltaDirection, sparkData, sparkColor, C }) {
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
            color: deltaDirection === "up" ? C.green : C.rose,
            background: deltaDirection === "up" ? C.greenSoft : C.roseSoft,
          }}
        >
          {deltaDirection === "up" ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {delta}
        </div>
      </div>

      <p className="text-sm mt-4" style={{ color: C.muted }}>{title}</p>

      <div className="flex items-end justify-between mt-1">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight" style={{ color: C.text, fontFamily: "'Fraunces', serif" }}>{value}</h2>
          <p className="text-xs mt-1" style={{ color: C.mutedSoft }}>{subtitle}</p>
        </div>
        <Sparkline data={sparkData} color={sparkColor} />
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
      <p className="text-2xl font-semibold mt-1 tabular-nums" style={{ color: C.clockText, fontFamily: "'JetBrains Mono', monospace" }}>{time}</p>
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
  const [dark, setDark] = useState(false);
  const C = dark ? DARK : LIGHT;
  const overallPct = useMemo(() => Math.round((631 / 1200) * 100), []);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [active, setActive] = useState("Dashboard");
  const deskPerformance = useMemo(() => buildDeskPerformance(C), [dark]);
  const CustomTooltip = useMemo(() => makeTooltip(C), [dark]);

  return (
    <div style={{ background: C.bg, minHeight: "100vh", transition: "background 0.25s ease" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        * { font-family: 'Inter', sans-serif; }
        ::-webkit-scrollbar { height: 6px; width: 6px; }
        ::-webkit-scrollbar-thumb { background: ${C.hairline}; border-radius: 4px; }
      `}</style>

      <Sidebar
        dark={dark}
        active={active}
        />

      <div className="lg:pl-72">
        <div className="p-6 md:p-10">
          {/* Mobile header */}
          <div className="flex items-center justify-between gap-4 mb-6 lg:hidden">
            <button
              onClick={() => setSidebarOpen(true)}
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: C.panel, border: `1px solid ${C.hairline}`, color: C.text }}
            >
              <Menu size={20} />
            </button>
            <button
              onClick={() => setDark((d) => !d)}
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: C.panel, border: `1px solid ${C.hairline}`, color: C.brass }}
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] uppercase" style={{ color: C.brass }}>
                Admissions Control Room
              </p>
              <h1 className="text-4xl md:text-5xl font-semibold mt-2" style={{ color: C.text, fontFamily: "'Fraunces', serif" }}>
                Admission Day Dashboard
              </h1>
              <p className="mt-2" style={{ color: C.muted }}>
                Live monitoring of today's onboarding process across every desk
              </p>
            </div>

            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={() => setDark((d) => !d)}
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
          </div>

          {/* Overview */}
          <div className="grid xl:grid-cols-4 md:grid-cols-2 gap-5">
            <StatCard C={C} title="Expected" value="1,200" subtitle="Students registered" icon={<Users size={20} />} delta="On target" deltaDirection="up" sparkData={sparklineExpected} sparkColor={C.sky} />
            <StatCard C={C} title="Checked In" value="845" subtitle="70% of expected" icon={<UserCheck size={20} />} delta="+12% / hr" deltaDirection="up" sparkData={sparklineCheckedIn} sparkColor={C.brass} />
            <StatCard C={C} title="Completed" value="631" subtitle="Finished all desks" icon={<Building2 size={20} />} delta="+8% / hr" deltaDirection="up" sparkData={sparklineCompleted} sparkColor={C.green} />
            <StatCard C={C} title="Waiting" value="214" subtitle="Currently in queue" icon={<Clock3 size={20} />} delta="Rising" deltaDirection="down" sparkData={sparklineWaiting} sparkColor={C.rose} />
          </div>

          {/* Charts row */}
          <div className="grid xl:grid-cols-3 gap-5 mt-6">
            <div className="xl:col-span-2 rounded-2xl p-6" style={{ background: C.panel, border: `1px solid ${C.hairline}`, boxShadow: C.cardShadow }}>
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-semibold" style={{ color: C.text }}>Arrival Flow</h2>
                  <p className="text-sm mt-1" style={{ color: C.muted }}>Cumulative check-ins by hour, today</p>
                </div>
                <Radio size={18} style={{ color: C.brass }} />
              </div>

              <div className="mt-6" style={{ height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={arrivalData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
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
              <p className="text-sm mt-1" style={{ color: C.muted }}>631 of 1,200 fully onboarded</p>

              <div className="flex-1 flex items-center justify-center" style={{ minHeight: 220 }}>
                <div style={{ width: "100%", height: 220, position: "relative" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart innerRadius="72%" outerRadius="100%" data={[{ name: "Completed", value: overallPct, fill: C.brass }]} startAngle={90} endAngle={-270}>
                      <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                      <RadialBar background={{ fill: C.hairlineSoft }} dataKey="value" cornerRadius={12} />
                    </RadialBarChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ pointerEvents: "none" }}>
                    <span className="text-4xl font-semibold" style={{ color: C.text, fontFamily: "'Fraunces', serif" }}>{overallPct}%</span>
                    <span className="text-xs mt-1" style={{ color: C.mutedSoft }}>onboarded</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Desk performance + live activity */}
          <div className="grid xl:grid-cols-3 gap-5 mt-5">
            <div className="xl:col-span-2 rounded-2xl p-6" style={{ background: C.panel, border: `1px solid ${C.hairline}`, boxShadow: C.cardShadow }}>
              <h2 className="text-lg font-semibold" style={{ color: C.text }}>Desk Performance</h2>
              <p className="text-sm mt-1" style={{ color: C.muted }}>Share of assigned students processed today</p>

              <div className="mt-4" style={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={deskPerformance} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }} barCategoryGap={18}>
                    <CartesianGrid strokeDasharray="3 3" stroke={C.hairlineSoft} horizontal={false} />
                    <XAxis type="number" domain={[0, 100]} stroke={C.mutedSoft} fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis type="category" dataKey="name" stroke={C.mutedSoft} fontSize={13} tickLine={false} axisLine={false} width={90} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: C.hairlineSoft }} />
                    <Bar dataKey="value" name="Processed" radius={[0, 8, 8, 0]}>
                      {deskPerformance.map((d, i) => (
                        <Cell key={i} fill={d.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-2xl p-6" style={{ background: C.panel, border: `1px solid ${C.hairline}`, boxShadow: C.cardShadow }}>
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold" style={{ color: C.text }}>Live Activity</h2>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: C.green }} />
                  <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: C.green }} />
                </span>
              </div>

              <div className="mt-5 space-y-4">
                {liveActivity.map((a, i) => (
                  <div key={i} className="flex gap-3 items-start pb-4" style={{ borderBottom: i < liveActivity.length - 1 ? `1px solid ${C.hairlineSoft}` : "none" }}>
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: C.brassSoft, color: C.brass }}>
                      <UserCheck size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: C.text }}>{a.name}</p>
                      <p className="text-xs mt-0.5" style={{ color: C.muted }}>checked into {a.desk}</p>
                      <p className="text-xs mt-0.5" style={{ color: C.mutedSoft, fontFamily: "'JetBrains Mono', monospace" }}>{a.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent students table */}
          <div className="rounded-2xl mt-5 overflow-hidden" style={{ background: C.panel, border: `1px solid ${C.hairline}`, boxShadow: C.cardShadow }}>
            <div className="px-6 py-5 flex items-center justify-between" style={{ borderBottom: `1px solid ${C.hairline}` }}>
              <div>
                <h2 className="text-lg font-semibold" style={{ color: C.text }}>Recent Students</h2>
                <p className="text-sm mt-1" style={{ color: C.muted }}>Latest desk activity across campus</p>
              </div>
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
                  {recentStudents.map((s, i) => {
                    const statusStyle = {
                      Completed: { bg: C.greenSoft, fg: C.green },
                      "In Progress": { bg: C.brassSoft, fg: C.brass },
                      Waiting: { bg: C.roseSoft, fg: C.rose },
                    };
                    return (
                      <tr key={i} style={{ borderTop: `1px solid ${C.hairlineSoft}` }}>
                        <td className="px-6 py-4 font-medium" style={{ color: C.text }}>{s.name}</td>
                        <td className="px-4 py-4" style={{ color: C.mutedSoft, fontFamily: "'JetBrains Mono', monospace" }}>{s.id}</td>
                        <td className="px-4 py-4" style={{ color: C.muted }}>{s.desk}</td>
                        <td className="px-4 py-4" style={{ color: C.muted, fontFamily: "'JetBrains Mono', monospace" }}>{s.time}</td>
                        <td className="px-4 py-4">
                          <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ background: statusStyle[s.status].bg, color: statusStyle[s.status].fg }}>
                            {s.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}