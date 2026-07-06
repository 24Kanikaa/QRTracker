import {
  Building2,
  MapPin,
  Users,
  Clock3,
  ArrowRight,
  Activity,
} from "lucide-react";

export default function DeskReportCard({ desk }) {
  const progress = Math.round(
    (desk.checkedIn / desk.expected) * 100
  );

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">

      {/* Header */}

      <div className="flex justify-between">

        <div className="flex gap-4">

          <div className={`w-14 h-14 rounded-2xl flex justify-center items-center ${desk.iconBg}`}>

            <Building2
              className={desk.iconColor}
              size={24}
            />

          </div>

          <div>

            <h2 className="font-bold text-lg text-slate-800">
              {desk.name}
            </h2>

            <div className="flex items-center gap-1 text-slate-500 mt-1 text-sm">

              <MapPin size={14} />

              {desk.location}

            </div>

          </div>

        </div>

        <span className={`${desk.badge} px-3 py-1 rounded-full text-xs font-semibold h-fit`}>

          ● Live

        </span>

      </div>

      {/* Students */}

      <div className="mt-7">

        <div className="flex justify-between items-end">

          <div>

            <p className="text-slate-500 text-sm">
              Students Processed
            </p>

            <h2 className="text-4xl font-bold text-slate-800 mt-1">

              {desk.checkedIn}

            </h2>

          </div>

          <div className="text-right">

            <p className="text-slate-400 text-sm">

              Pending

            </p>

            <h3 className="font-bold text-xl text-orange-600">

              {desk.pending}

            </h3>

          </div>

        </div>

      </div>

      {/* Progress */}

      <div className="mt-6">

        <div className="flex justify-between text-sm mb-2">

          <span className="text-slate-500">

            Completion

          </span>

          <span className="font-semibold text-slate-700">

            {progress}%

          </span>

        </div>

        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">

          <div
            className={`${desk.progress} h-2 rounded-full`}
            style={{
              width: `${progress}%`,
            }}
          />

        </div>

      </div>

      {/* Small Stats */}

      <div className="grid grid-cols-2 gap-3 mt-7">

        <div className="rounded-2xl bg-slate-50 p-4">

          <div className="flex items-center gap-2 text-slate-500 text-sm">

            <Clock3 size={15} />

            Last Scan

          </div>

          <p className="font-semibold mt-2">

            {desk.lastScan}

          </p>

        </div>

        <div className="rounded-2xl bg-slate-50 p-4">

          <div className="flex items-center gap-2 text-slate-500 text-sm">

            <Activity size={15} />

            Avg Time

          </div>

          <p className="font-semibold mt-2">

            {desk.avgTime}

          </p>

        </div>

      </div>

      {/* Footer */}

      <div className="mt-7 flex gap-3">

        <button className="flex-1 bg-teal-600 hover:bg-teal-700 rounded-xl py-3 text-white font-medium flex justify-center items-center gap-2 transition">

          <Users size={17} />

          View Students

        </button>

        <button className="w-14 rounded-xl border border-slate-200 hover:bg-slate-50 flex justify-center items-center transition">

          <ArrowRight
            size={18}
            className="text-slate-600"
          />

        </button>

      </div>

    </div>
  );
}