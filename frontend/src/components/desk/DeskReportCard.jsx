import { useId } from "react";
import {
  Building2,
  MapPin,
  Users,
  Clock3,
  Gauge,
  CheckCircle2,
} from "lucide-react";
import {useState} from "react";
import DeskStudentModal from "./DeskStudentModal";
import { getDeskStudents } from "../../services/deskService";

function ProgressRing({ percent }) {
  const id = useId();

  const size = 76;
  const stroke = 7;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative w-[76px] h-[76px]">
      <svg
        width={size}
        height={size}
        className="-rotate-90"
      >
        <defs>
          <linearGradient id={id}>
            <stop offset="0%" stopColor="#14b8a6" />
            <stop offset="100%" stopColor="#0f766e" />
          </linearGradient>
        </defs>

        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#E5E7EB"
          strokeWidth={stroke}
        />

        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${id})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>

      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-bold text-slate-700">
          {percent}%
        </span>
      </div>
    </div>
  );
}

export default function DeskReportCard({   desk,
    expectedStudents }) {

const expected = Number(expectedStudents || 0);

const processed = Number(desk.totalStudents || 0);

const pending = Math.max(expected - processed, 0);

const progress =
    expected > 0
        ? Math.round((processed / expected) * 100)
        : 0;

const [students,setStudents]=useState([]);
const [open,setOpen]=useState(false);


const loadStudents=async()=>{

 const res =
 await getDeskStudents(desk.id);


 setStudents(res.data.data);

 setOpen(true);

}
  return (
<div className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow duration-300">
  <div className="h-[3px] bg-teal-700" />

  <div className="p-5 flex justify-between items-start">
    <div className="flex gap-3">
      <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center flex-shrink-0">
        <Building2 className="text-teal-700" size={20} />
      </div>
      <div>
        <h2 className="text-base font-semibold text-slate-800">{desk.name}</h2>
        {desk.location && (
          <div className="flex items-center gap-1 mt-0.5 text-slate-500 text-sm">
            <MapPin size={13} />
            {desk.location}
          </div>
        )}
      </div>
    </div>
    <span className="flex items-center gap-1.5 bg-teal-50 text-teal-800 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap">
      <span className="w-1.5 h-1.5 rounded-full bg-teal-700 animate-pulse" />
      Live
    </span>
  </div>

  {/* Board panel */}
  <div className="mx-5 mb-4 bg-teal-50/60 border border-teal-100 rounded-xl px-4 py-3.5">
    <div className="flex justify-between items-end">
      <div>
        <p className="text-[11px] uppercase tracking-wide text-teal-700 mb-1">Processed</p>
        <p className="font-mono text-[34px] font-medium text-teal-950 leading-none">{processed}</p>
      </div>
      <p className="font-mono text-xs text-teal-500 mb-1.5">of {expected} expected</p>
    </div>

    <div className="flex gap-[3px] mt-3">
      {Array.from({ length: 32 }).map((_, i) => {
        const filled = Math.round(32 * (processed / expected));
        const isLast = i === filled - 1;
        return (
          <div
            key={i}
            className={`h-2 flex-1 rounded-sm ${isLast ? "animate-pulse" : ""}`}
            style={{ background: i < filled ? "#1D9E75" : "#D7EFE7" }}
          />
        );
      })}
    </div>

    <div className="flex justify-between mt-1.5">
      <span className="font-mono text-[11px] text-teal-500">0</span>
      <span className="font-mono text-[11px] text-amber-700 font-medium">{pending} pending</span>
    </div>
  </div>

  {/* Bottom stats */}
  <div className="grid grid-cols-2 gap-2.5 mx-5 mb-5">
    <div className="bg-slate-50 rounded-lg px-3 py-2.5">
      <p className="text-xs text-slate-500 flex items-center gap-1.5">
        <Clock3 size={14} className="text-teal-700" />
        Last scan
      </p>
      <p className="font-medium text-sm mt-1.5">{desk.last_scan || "2 min ago"}</p>
    </div>
    <div className="bg-slate-50 rounded-lg px-3 py-2.5">
      <p className="text-xs text-slate-500 flex items-center gap-1.5">
        <Gauge size={14} className="text-teal-700" />
        Avg time
      </p>
      <p className="font-medium text-sm mt-1.5">{desk.avg_time || "38 sec"}</p>
    </div>
  </div>

  <div className="px-5 pb-5">
    <button
      onClick={loadStudents}
      className="w-full bg-teal-700 hover:bg-teal-800 rounded-xl py-2.5 text-white font-medium text-sm flex items-center justify-center gap-2 transition-colors"
    >
      <Users size={16} />
      View students
    </button>
  </div>

  <DeskStudentModal open={open} onClose={() => setOpen(false)} students={students} />
</div>
  );
}