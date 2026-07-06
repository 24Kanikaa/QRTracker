import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

export default function StudentPagination() {
  return (
    <div className="mt-6 bg-white border border-slate-200 rounded-3xl shadow-sm">

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 px-6 py-5">

        {/* Left Section */}

        <div className="flex flex-col sm:flex-row sm:items-center gap-4">

          <div>

            <p className="text-sm font-medium text-slate-700">
              Showing
              <span className="mx-1 font-bold text-slate-900">
                1–10
              </span>
              of
              <span className="mx-1 font-bold text-slate-900">
                640
              </span>
              students
            </p>

            <p className="text-xs text-slate-500 mt-1">
              Page 1 of 64
            </p>

          </div>

          <div className="hidden md:flex items-center gap-2">

            <span className="text-sm text-slate-500">
              Rows
            </span>

            <select className="border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white outline-none focus:ring-2 focus:ring-teal-500">

              <option>10</option>

              <option>25</option>

              <option>50</option>

              <option>100</option>

            </select>

          </div>

        </div>

        {/* Right Section */}

        <div className="flex items-center gap-2">

          <button className="w-10 h-10 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition disabled:opacity-40">

            <ChevronsLeft size={17} />

          </button>

          <button className="w-10 h-10 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition disabled:opacity-40">

            <ChevronLeft size={17} />

          </button>

          <button className="w-10 h-10 rounded-xl bg-teal-600 text-white font-semibold shadow-sm">

            1

          </button>

          <button className="w-10 h-10 rounded-xl hover:bg-slate-100 text-slate-700 transition">

            2

          </button>

          <button className="w-10 h-10 rounded-xl hover:bg-slate-100 text-slate-700 transition">

            3

          </button>

          <div className="px-2 text-slate-400 font-semibold">

            ...

          </div>

          <button className="w-10 h-10 rounded-xl hover:bg-slate-100 text-slate-700 transition">

            64

          </button>

          <button className="w-10 h-10 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition">

            <ChevronRight size={17} />

          </button>

          <button className="w-10 h-10 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition">

            <ChevronsRight size={17} />

          </button>

        </div>

      </div>

    </div>
  );
}