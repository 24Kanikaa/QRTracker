import { useState } from "react";
import {
  Building2,
  Plus,
  Search,
  Activity,
  Users,
  Clock3,
  Monitor,
  RefreshCcw,
} from "lucide-react";

import AdminLayout from "../../layouts/AdminLayout";
import DeskOverviewCard from "../../components/desk/DeskOverviewCard";
import DeskReportCard from "../../components/desk/DeskReportCard";
import DeskManageCard from "../../components/desk/DeskManageCard";

/* ---------------- Dummy Reports ---------------- */

const reports = [
  {
    id: 1,
    name: "Gate Entry",
    location: "Main Entrance",
    checkedIn: 640,
    expected: 850,
    pending: 210,
    lastScan: "10:42 AM",
    avgTime: "28 sec",

    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    progress: "bg-blue-500",
    badge: "bg-blue-50 text-blue-700",
  },

  {
    id: 2,
    name: "Admission Desk",
    location: "Admission Hall",
    checkedIn: 620,
    expected: 850,
    pending: 230,
    lastScan: "10:43 AM",
    avgTime: "1m 12s",

    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    progress: "bg-emerald-500",
    badge: "bg-emerald-50 text-emerald-700",
  },

  {
    id: 3,
    name: "Hostel Desk",
    location: "Hostel Reception",
    checkedIn: 480,
    expected: 850,
    pending: 370,
    lastScan: "10:40 AM",
    avgTime: "2m 18s",

    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
    progress: "bg-orange-500",
    badge: "bg-orange-50 text-orange-700",
  },

  {
    id: 4,
    name: "IT Setup",
    location: "IT Helpdesk",
    checkedIn: 370,
    expected: 850,
    pending: 480,
    lastScan: "10:38 AM",
    avgTime: "58 sec",

    iconBg: "bg-cyan-100",
    iconColor: "text-cyan-600",
    progress: "bg-cyan-500",
    badge: "bg-cyan-50 text-cyan-700",
  },
];

/* ---------------- Manage ---------------- */

const desks = [
  {
    id: 1,
    name: "Gate Entry",
    location: "Main Gate",
    slug: "gate-entry",
    status: "Active",
  },
  {
    id: 2,
    name: "Admission",
    location: "Admission Hall",
    slug: "admission",
    status: "Active",
  },
  {
    id: 3,
    name: "Hostel",
    location: "Hostel Reception",
    slug: "hostel",
    status: "Active",
  },
];

export default function Desks() {
  const [tab, setTab] = useState("reports");

  return (
    <AdminLayout>

      {/* PAGE HEADER */}

      <div className="flex flex-col xl:flex-row justify-between gap-4">

        <div>

          <div className="flex items-center gap-3">

            <div className="w-11 h-11 rounded-2xl bg-teal-100 flex items-center justify-center">

              <Building2
                className="text-teal-700"
                size={28}
              />

            </div>

            <div>

              <h1 className="text-3xl font-bold text-slate-800">
                Desk Operations
              </h1>

              <p className="text-slate-500 mt-1">
                Live monitoring of every onboarding desk.
              </p>

            </div>

          </div>

        </div>

        <div className="flex items-center gap-3">

          <div className="bg-white border rounded-2xl px-5 py-3 shadow-sm flex items-center gap-3">

            <RefreshCcw
              size={18}
              className="text-emerald-600"
            />

            <div>

              <p className="text-xs text-slate-500">
                Last Updated
              </p>

              <p className="font-semibold">
                Just Now
              </p>

            </div>

          </div>

          {tab === "manage" && (

            <button className="bg-teal-600 hover:bg-teal-700 text-white rounded-2xl px-6 py-4 flex items-center gap-2 shadow">

              <Plus size={18} />

              Add Desk

            </button>

          )}

        </div>

      </div>

      {/* OVERVIEW */}

      <div className="grid xl:grid-cols-4 md:grid-cols-2 gap-4 mt-8">

        <DeskOverviewCard
          title="Total Desks"
          value="8"
          subtitle="Across Campus"
          icon={Building2}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
        />

        <DeskOverviewCard
          title="Students Processed"
          value="2,480"
          subtitle="Today's Visits"
          icon={Users}
          iconBg="bg-teal-100"
          iconColor="text-teal-600"
        />

        <DeskOverviewCard
          title="Live Desks"
          value="8"
          subtitle="Currently Active"
          icon={Monitor}
          iconBg="bg-orange-100"
          iconColor="text-orange-600"
        />

        <DeskOverviewCard
          title="Average Queue"
          value="2.4m"
          subtitle="Per Student"
          icon={Clock3}
          iconBg="bg-purple-100"
          iconColor="text-purple-600"
        />

      </div>

      {/* TABS */}

      <div className="mt-8 bg-white rounded-2xl p-2 shadow-sm inline-flex">

        <button
          onClick={() => setTab("reports")}
          className={`px-7 py-3 rounded-xl font-medium transition ${
            tab === "reports"
              ? "bg-teal-600 text-white shadow"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Reports
        </button>

        <button
          onClick={() => setTab("manage")}
          className={`px-7 py-3 rounded-xl font-medium transition ${
            tab === "manage"
              ? "bg-teal-600 text-white shadow"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Manage Desks
        </button>

      </div>

      {/* REPORTS */}

      {tab === "reports" && (

        <>

          <div className="mt-8 flex flex-col lg:flex-row justify-between gap-5">

            <div className="relative lg:w-96">

              <Search
                size={18}
                className="absolute left-4 top-4 text-slate-400"
              />

              <input
                placeholder="Search desk..."
                className="w-full bg-white border rounded-2xl pl-11 pr-4 py-3 outline-none focus:ring-2 focus:ring-teal-500"
              />

            </div>

            <div className="bg-white border rounded-2xl px-5 py-3 flex items-center gap-2 shadow-sm">

              <Activity
                className="text-green-600"
                size={18}
              />

              <span className="font-medium">
                Live Monitoring Enabled
              </span>

            </div>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-8">

            {reports.map((desk) => (

              <DeskReportCard
                key={desk.id}
                desk={desk}
              />

            ))}

          </div>

        </>

      )}

      {/* MANAGE */}

      {tab === "manage" && (

        <>

          <div className="mt-8 flex justify-between flex-col md:flex-row gap-4">

            <div className="relative md:w-96">

              <Search
                size={18}
                className="absolute left-4 top-4 text-slate-400"
              />

              <input
                placeholder="Search Desk..."
                className="w-full border rounded-2xl bg-white pl-11 pr-4 py-3 outline-none focus:ring-2 focus:ring-teal-500"
              />

            </div>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 gap-5 mt-8">

            {desks.map((desk) => (

              <DeskManageCard
                key={desk.id}
                desk={desk}
              />

            ))}

          </div>

        </>

      )}

    </AdminLayout>
  );
}