import { Search, Download, SlidersHorizontal } from "lucide-react";

export default function StudentFilters() {
  return (
    <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-5 mb-6">

      <div className="flex flex-col lg:flex-row gap-4 justify-between">

        <div className="relative w-full lg:max-w-md">

          <Search
            size={18}
            className="absolute left-4 top-4 text-slate-400"
          />

          <input
            placeholder="Search student by email..."
            className="w-full pl-11 pr-4 h-12 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white outline-none focus:ring-2 focus:ring-teal-500 transition"
          />

        </div>

        <div className="flex gap-3">

          <button className="h-12 px-5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center gap-2">

            <SlidersHorizontal size={17} />

            Filters

          </button>

          <button className="h-12 px-5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-2 shadow-sm">

            <Download size={17} />

            Export CSV

          </button>

        </div>

      </div>

    </div>
  );
}