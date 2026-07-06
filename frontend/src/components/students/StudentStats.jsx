import {
  Users,
  UserCheck,
  Clock3,
  CheckCircle2,
  Activity,
} from "lucide-react";

export default function StudentStats() {
  const stats = [
    {
      title: "Total Students",
      value: "640",
      sub: "+28 expected today",
      icon: Users,
      iconBg: "bg-slate-100",
      iconColor: "text-slate-700",
    },
    {
      title: "Checked In",
      value: "512",
      sub: "80% attendance",
      icon: UserCheck,
      iconBg: "bg-teal-50",
      iconColor: "text-teal-600",
    },
    {
      title: "In Progress",
      value: "98",
      sub: "Across all desks",
      icon: Clock3,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
    },
    {
      title: "Completed",
      value: "414",
      sub: "64.7% finished",
      icon: CheckCircle2,
      iconBg: "bg-green-50",
      iconColor: "text-green-600",
    },
  ];

  return (
    <div className="space-y-6 mb-8">

      {/* Hero Header */}

      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm px-8 py-7">

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">

          <div>

            <div className="flex items-center gap-3">

              <div className="w-12 h-12 rounded-2xl bg-teal-600 flex items-center justify-center">

                <Users className="text-white" size={24} />

              </div>

              <div>

                <h1 className="text-3xl font-bold text-slate-800">

                  Student Operations

                </h1>

                <p className="text-slate-500 mt-1">

                  Monitor every student's onboarding journey in real-time.

                </p>

              </div>

            </div>

          </div>

          <div className="mt-6 lg:mt-0 flex items-center gap-4">

            <div className="text-right">

              <p className="text-sm text-slate-500">

                Admission Day

              </p>

              <p className="font-semibold text-slate-700">

                18 July 2026

              </p>

            </div>

            <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-sm font-semibold">

              <Activity size={16} />

              Live

            </div>

          </div>

        </div>

      </div>

      {/* KPI Cards */}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">

        {stats.map((item) => {

          const Icon = item.icon;

          return (

            <div
              key={item.title}
              className="group bg-white border border-slate-200 rounded-3xl p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >

              <div className="flex justify-between items-start">

                <div>

                  <p className="text-sm font-medium text-slate-500">

                    {item.title}

                  </p>

                  <h2 className="text-4xl font-bold mt-3 text-slate-800 tracking-tight">

                    {item.value}

                  </h2>

                </div>

                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center ${item.iconBg}`}
                >

                  <Icon
                    className={item.iconColor}
                    size={24}
                  />

                </div>

              </div>

              <div className="mt-6">

                <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">

                  <div
                    className="h-full rounded-full bg-teal-600"
                    style={{
                      width:
                        item.title === "Total Students"
                          ? "100%"
                          : item.title === "Checked In"
                          ? "80%"
                          : item.title === "In Progress"
                          ? "35%"
                          : "65%",
                    }}
                  />

                </div>

                <p className="text-sm text-slate-500 mt-3">

                  {item.sub}

                </p>

              </div>

            </div>

          );

        })}

      </div>

    </div>
  );
}