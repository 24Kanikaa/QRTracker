import { useState } from "react";
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
} from "lucide-react";

/* ---------- summary stat card ---------- */

function SummaryStat({ C, accent, icon, label, value, sub }) {
  return (
    <div
      className="rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1"
      style={{ background: C.panel, border: `1px solid ${C.hairline}`, boxShadow: C.cardShadow }}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium" style={{ color: C.muted }}>
            {label}
          </p>
          <h2
            className="text-4xl font-semibold mt-3 tracking-tight"
            style={{ color: C.text, fontFamily: "'Fraunces', serif" }}
          >
            {value}
          </h2>
        </div>

        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
          style={{ background: `${accent}1A`, color: accent }}
        >
          {icon}
        </div>
      </div>

      <p className="text-sm mt-5" style={{ color: C.muted }}>
        {sub}
      </p>
    </div>
  );
}

/* ---------- progress ring ---------- */

function ProgressRing({ percent, brass, hairline }) {
  const size = 76;
  const stroke = 7;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative w-[76px] h-[76px] shrink-0">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={hairline} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={brass}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-bold text-sm" style={{ fontFamily: "'Fraunces', serif" }}>
          {percent}%
        </span>
      </div>
    </div>
  );
}

/* ---------- desk breakdown demo data ---------- */

const DESK_BREAKDOWN = [
  { title: "Gate", icon: DoorOpen, count: 540 },
  { title: "Admission", icon: Building2, count: 512 },
  { title: "Hostel", icon: Home, count: 470 },
  { title: "IT", icon: Laptop, count: 431 },
  { title: "Mess", icon: UtensilsCrossed, count: 418 },
  { title: "ID Card", icon: IdCard, count: 415 },
  { title: "Library", icon: Library, count: 414 },
];

export default function StudentStats() {
  const [dark, setDark] = useState(false);
  const [activeTab, setActiveTab] = useState("pipeline");

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

  const stats = [
    {
      title: "Total Students",
      value: 640,
      sub: "+28 expected today",
      icon: <Users size={20} />,
      accent: C.brass,
    },
    {
      title: "Checked In",
      value: 512,
      sub: "80% attendance",
      icon: <UserCheck size={20} />,
      accent: C.green,
    },
    {
      title: "In Progress",
      value: 98,
      sub: "Across all desks",
      icon: <Clock3 size={20} />,
      accent: C.rose,
    },
    {
      title: "Completed",
      value: 414,
      sub: "64.7% finished",
      icon: <CheckCircle2 size={20} />,
      accent: C.amber,
    },
  ];

  const overallProgress = Math.round((512 / 640) * 100);
  const maxDeskCount = Math.max(...DESK_BREAKDOWN.map((d) => d.count));

  return (
    <div style={{ background: C.bg, minHeight: "100%" }} className="transition-colors duration-300 p-6 md:p-10 rounded-3xl">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&display=swap');`}</style>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] uppercase" style={{ color: C.brass }}>
              Student Operations
            </p>

            <h1
              className="text-4xl md:text-5xl font-semibold mt-2"
              style={{ color: C.text, fontFamily: "'Fraunces', serif" }}
            >
              Admission Overview
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs" style={{ color: C.muted }}>
                Admission Day
              </p>
              <p className="font-semibold" style={{ color: C.text }}>
                18 July 2026
              </p>
            </div>

            <span
              className="h-11 px-4 rounded-xl flex items-center gap-2 font-medium text-sm"
              style={{ background: `${C.green}1A`, color: C.green, border: `1px solid ${C.hairline}` }}
            >
              <CheckCircle2 size={15} />
              Live
            </span>

            <button
              onClick={() => setDark((d) => !d)}
              className="w-11 h-11 rounded-xl flex items-center justify-center transition"
              style={{ background: C.panel, border: `1px solid ${C.hairline}`, color: C.brass, boxShadow: C.cardShadow }}
              title={dark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>

        {/* Summary */}
        <div className="grid xl:grid-cols-4 md:grid-cols-2 gap-5">
          {stats.map((item) => (
            <SummaryStat
              key={item.title}
              C={C}
              accent={item.accent}
              icon={item.icon}
              label={item.title}
              value={item.value}
              sub={item.sub}
            />
          ))}
        </div>

        {/* Tabs */}
        <div className="mt-8">
          <div
            className="inline-flex rounded-2xl p-1"
            style={{ background: C.panel, border: `1px solid ${C.hairline}`, boxShadow: C.cardShadow }}
          >
            <button
              onClick={() => setActiveTab("pipeline")}
              className="px-6 py-3 rounded-xl font-medium transition-all"
              style={{
                background: activeTab === "pipeline" ? C.brass : "transparent",
                color: activeTab === "pipeline" ? "#fff" : C.muted,
              }}
            >
              Admission Pipeline
            </button>

            <button
              onClick={() => setActiveTab("desks")}
              className="px-6 py-3 rounded-xl font-medium transition-all"
              style={{
                background: activeTab === "desks" ? C.brass : "transparent",
                color: activeTab === "desks" ? "#fff" : C.muted,
              }}
            >
              Desk Breakdown ({DESK_BREAKDOWN.length})
            </button>
          </div>
        </div>

        {/* Tab content */}
        <div
          className="mt-5 rounded-3xl overflow-hidden"
          style={{ background: C.panel, border: `1px solid ${C.hairline}`, boxShadow: C.cardShadow }}
        >
          <div className="h-1" style={{ background: `linear-gradient(to right, ${C.brass}, ${C.amber})` }} />

          {activeTab === "pipeline" ? (
            <div className="p-6 sm:p-7">
              <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                <div className="flex items-center gap-2 sm:w-56 shrink-0">
                  <Activity size={16} style={{ color: C.brass }} />
                  <h3 className="text-sm font-semibold tracking-wide uppercase" style={{ color: C.text }}>
                    Admission Pipeline
                  </h3>
                </div>

                <div className="flex-1 flex flex-col sm:flex-row items-stretch gap-2">
                  {stats.map((item, i) => {
                    const isLast = i === stats.length - 1;
                    return (
                      <div key={item.title} className="flex items-center flex-1 gap-2">
                        <div
                          className="flex-1 rounded-2xl px-4 py-3 flex items-center gap-3"
                          style={{ background: dark ? "#241F1A" : "#FAF7F1" }}
                        >
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                            style={{ background: `${item.accent}1A`, color: item.accent }}
                          >
                            {item.icon}
                          </div>
                          <div className="min-w-0">
                            <p
                              className="text-lg font-bold tracking-tight"
                              style={{ color: C.text, fontFamily: "'Fraunces', serif" }}
                            >
                              {item.value}
                            </p>
                            <p className="text-xs truncate" style={{ color: C.muted }}>
                              {item.title}
                            </p>
                          </div>
                        </div>

                        {!isLast && (
                          <ArrowRight size={16} className="hidden sm:block shrink-0" style={{ color: C.hairline }} />
                        )}
                      </div>
                    );
                  })}
                </div>

                <ProgressRing percent={overallProgress} brass={C.brass} hairline={C.hairline} />
              </div>
            </div>
          ) : (
            <div className="p-6 sm:p-7">
              <div className="flex items-center gap-2 mb-5">
                <Gauge size={16} style={{ color: C.brass }} />
                <h3 className="text-sm font-semibold tracking-wide uppercase" style={{ color: C.text }}>
                  Checked in by desk
                </h3>
              </div>

              <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {DESK_BREAKDOWN.map((desk) => {
                  const Icon = desk.icon;
                  const pct = Math.round((desk.count / maxDeskCount) * 100);
                  return (
                    <div
                      key={desk.title}
                      className="rounded-2xl p-4"
                      style={{ background: dark ? "#241F1A" : "#FAF7F1", border: `1px solid ${C.hairline}` }}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                          style={{ background: `${C.brass}1A`, color: C.brass }}
                        >
                          <Icon size={15} />
                        </div>
                        <span className="text-sm font-medium" style={{ color: C.text }}>
                          {desk.title}
                        </span>
                      </div>

                      <p className="text-2xl font-semibold" style={{ color: C.text, fontFamily: "'Fraunces', serif" }}>
                        {desk.count}
                      </p>

                      <div className="h-1.5 rounded-full mt-3 overflow-hidden" style={{ background: C.hairline }}>
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{ width: `${pct}%`, background: C.brass }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}