import {useEffect } from "react";
import {
  Building2,
  MapPin,
  Users,
  Clock3,
  Gauge,
} from "lucide-react";
import {useState} from "react";
import DeskStudentModal from "./DeskStudentModal";
import { getDeskStudents } from "../../services/deskService";


export default function DeskReportCard({   desk}) {

const [processed, setProcessed] = useState(0);
const [lastScan, setLastScan] = useState("-");
const [avgTime, setAvgTime] = useState("-");
const [students, setStudents] = useState([]);
const [open, setOpen] = useState(false);

const formatTimeAgo = (date) => {
  if (!date) return "-";

  const diff = Math.floor((Date.now() - new Date(date)) / 1000);

  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;

  return `${Math.floor(diff / 86400)} day ago`;
};

const loadDeskData = async (openModal = false) => {
  try {
    const res = await getDeskStudents(desk.id);

    const data = res.data.data;

    setProcessed(data.count);
    setLastScan(formatTimeAgo(data.lastScan));

    const sec = data.avgSeconds || 0;

    setAvgTime(
      sec >= 60
        ? `${Math.floor(sec / 60)} min`
        : `${sec} sec`
    );

    setStudents(data.students);

    if (openModal) {
      setOpen(true);
    }
  } catch (err) {
    console.error(err);
  }
};

useEffect(() => {
  loadDeskData(false);
}, [desk.id]);

  // setOpen(true);


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
  </div>

  {/* Board panel */}
  <div className="mx-5 mb-4 bg-teal-50/60 border border-teal-100 rounded-xl px-4 py-3.5">
    
      <p className="text-xs uppercase tracking-wider text-teal-700 font-medium">
        Students Processed
      </p>

      <div className="flex items-end gap-2 mt-2">
        <h2 className="text-5xl font-bold text-teal-900">
          {processed}
        </h2>

        <span className="text-slate-500 mb-2">
          students
        </span>
      </div>
  </div>

  {/* Bottom stats */}
  <div className="grid grid-cols-2 gap-2.5 mx-5 mb-5">
    <div className="bg-slate-50 rounded-lg px-3 py-2.5">
      <p className="text-xs text-slate-500 flex items-center gap-1.5">
        <Clock3 size={14} className="text-teal-700" />
        Last scan
      </p>
      <p className="font-medium text-sm mt-1.5">{lastScan}</p>
    </div>
    <div className="bg-slate-50 rounded-lg px-3 py-2.5">
      <p className="text-xs text-slate-500 flex items-center gap-1.5">
        <Gauge size={14} className="text-teal-700" />
        Avg time
      </p>
      <p className="font-medium text-sm mt-1.5">{avgTime}</p>
    </div>
  </div>

  <div className="px-5 pb-5">
    <button
      onClick={() => loadDeskData(true)}
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