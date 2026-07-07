import {
  GraduationCap,
  CheckCircle2,
  QrCode,
  DoorOpen,
  FileCheck,
  BedDouble,
  Laptop,
  UtensilsCrossed,
  LibraryBig,
} from "lucide-react";

const student = {
  name: "Kanika",
  id: "UG20260045",
  program: "B.Tech CSE",
  admission: "Admission 2026",
  completed: 1,
  total: 6,
};

const journey = [
  {
    id: 1,
    title: "Gate Entry",
    location: "Main Gate",
    status: "completed",
    time: "09:12 AM",
    icon: DoorOpen,
    color: "bg-blue-100 text-blue-600",
  },
  {
    id: 2,
    title: "Admission Desk",
    location: "Admission Hall",
    status: "pending",
    icon: FileCheck,
    color: "bg-violet-100 text-violet-600",
  },
  {
    id: 3,
    title: "Hostel Allocation",
    location: "Hostel Reception",
    status: "pending",
    icon: BedDouble,
    color: "bg-orange-100 text-orange-600",
  },
  {
    id: 4,
    title: "IT Setup",
    location: "IT Helpdesk",
    status: "pending",
    icon: Laptop,
    color: "bg-cyan-100 text-cyan-600",
  },
  {
    id: 5,
    title: "Mess Registration",
    location: "Dining Hall",
    status: "pending",
    icon: UtensilsCrossed,
    color: "bg-green-100 text-green-600",
  },
  {
    id: 6,
    title: "Library Activation",
    location: "Central Library",
    status: "pending",
    icon: LibraryBig,
    color: "bg-amber-100 text-amber-600",
  },
];

export default function Home() {
  const progress = Math.round(
    (student.completed / student.total) * 100
  );

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center">

      <div className="w-full max-w-md bg-slate-100 min-h-screen">

        {/* HEADER */}

        <div className="bg-gradient-to-br from-teal-600 via-teal-600 to-teal-700 rounded-b-[36px] px-6 pt-12 pb-16 text-white shadow-lg">

          <div className="flex justify-between items-start">

            <div className="flex gap-4">

              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">

                <GraduationCap size={30} />

              </div>

              <div>

                <p className="text-teal-100 text-sm">
                  Hi, welcome to plaksha  👋
                </p>

                <h1 className="text-2xl font-bold mt-1">
                  {student.name}
                </h1>

              </div>

            </div>

          </div>

        </div>

        {/* PROGRESS */}

        <div className="mx-5 -mt-10 bg-white rounded-3xl shadow-xl p-6">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-slate-500 text-sm">

                Registration Progress

              </p>

              <h2 className="text-2xl font-bold mt-2">

                {student.completed} of {student.total}

              </h2>

              <p className="text-slate-400 text-sm mt-1">

                Student ID • {student.id}

              </p>

            </div>

            <div className="relative w-20 h-20">

              <svg
                className="w-20 h-20 rotate-[-90deg]"
                viewBox="0 0 100 100"
              >

                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  stroke="#e5e7eb"
                  strokeWidth="8"
                  fill="none"
                />

                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  stroke="#0f766e"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={264}
                  strokeDashoffset={
                    264 - (264 * progress) / 100
                  }
                />

              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center">

                <span className="font-bold text-lg">

                  {progress}%

                </span>

              </div>

            </div>

          </div>

        </div>

        {/* JOURNEY */}

        <div className="px-5 mt-8 pb-8">

          <div className="flex justify-between items-center mb-6">

            <h2 className="text-xl font-bold text-slate-800">

              Your Track

            </h2>

            <span className="text-teal-600 font-semibold text-sm">

              {student.completed}/{student.total} Completed

            </span>

          </div>

          <div className="relative">

            {/* Timeline */}

            <div className="absolute left-7 top-5 bottom-5 w-[2px] bg-slate-200"></div>

            <div className="space-y-5">

              {journey.map((desk) => {

                const Icon = desk.icon;

                return (

                  <div
                    key={desk.id}
                    className={`relative bg-white rounded-3xl shadow-sm border transition hover:shadow-md ${
                      desk.status === "completed"
                        ? "border-green-100"
                        : "border-slate-200"
                    }`}
                  >

                    <div className="flex items-center gap-4 p-4">

                      {/* ICON */}

                      <div
                        className={`relative z-10 w-14 h-14 rounded-2xl flex items-center justify-center ${desk.color}`}
                      >

                        <Icon size={26} />

                      </div>

                      {/* INFO */}

                      <div className="flex-1">

                        <div className="flex items-center gap-2">

                          <h3 className="font-semibold text-slate-800">

                            {desk.title}

                          </h3>

                          {desk.status === "completed" && (

                            <CheckCircle2
                              size={18}
                              className="text-green-600"
                            />

                          )}

                        </div>

                        <p className="text-sm text-slate-500 mt-1">

                          {desk.location}

                        </p>

                        {desk.status === "completed" && (

                          <p className="text-xs text-green-600 mt-2">

                            Completed at {desk.time}

                          </p>

                        )}

                      </div>

                      {/* ACTION */}

                      {desk.status === "completed" ? (

                        <div className="text-green-600 text-sm font-semibold">

                          Done

                        </div>

                      ) : (

                        <button className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow hover:bg-teal-700 transition hover:scale-105 active:scale-95">

                          <QrCode size={22} />

                        </button>

                      )}

                    </div>

                  </div>

                );

              })}

            </div>

          </div>

        </div>

        {/* HELP */}

        <div className="px-5 pb-8">

          <div className="bg-white rounded-3xl p-5 border border-slate-200">

            <h3 className="font-semibold text-slate-800">

              Need Assistance?

            </h3>

            <p className="text-sm text-slate-500 mt-2 leading-6">

              If you face any issue during the admission process,
              please contact the nearest volunteer or visit the
              Help Desk.

            </p>

          </div>

        </div>

      </div>

    </div>
  );
}