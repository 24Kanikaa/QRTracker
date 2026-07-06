import {
  DoorOpen,
  Building2,
  Home,
  Laptop,
  UtensilsCrossed,
  IdCard,
  Library,
  CheckCircle2,
} from "lucide-react";

const columns = [
  {
    title: "Gate",
    key: "gate",
    icon: DoorOpen,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    title: "Admission",
    key: "admission",
    icon: Building2,
    color: "text-cyan-600",
    bg: "bg-cyan-50",
  },
  {
    title: "Hostel",
    key: "hostel",
    icon: Home,
    color: "text-orange-600",
    bg: "bg-orange-50",
  },
  {
    title: "IT",
    key: "it",
    icon: Laptop,
    color: "text-indigo-600",
    bg: "bg-indigo-50",
  },
  {
    title: "Mess",
    key: "mess",
    icon: UtensilsCrossed,
    color: "text-red-600",
    bg: "bg-red-50",
  },
  {
    title: "ID",
    key: "idcard",
    icon: IdCard,
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  {
    title: "Library",
    key: "library",
    icon: Library,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
];

function Progress({ progress }) {
  return (
    <div className="w-[120px]">

      <div className="flex justify-between text-xs mb-2">

        <span className="font-medium text-slate-600">
          {progress}%
        </span>

        <span className="text-slate-400">
          {Math.round(progress / 100 * 7)}/7
        </span>

      </div>

      <div className="h-2 rounded-full bg-slate-100">

        <div
          className="h-2 rounded-full bg-teal-600"
          style={{
            width: `${progress}%`
          }}
        />

      </div>

    </div>
  );
}

function Cell({ value }) {

  if (!value) {

    return (

      <div className="flex justify-center">

        <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-400 text-xs font-medium">

          Pending

        </span>

      </div>

    );

  }

  return (

    <div className="flex justify-center">

      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 border border-green-100">

        <CheckCircle2
          size={14}
          className="text-green-600"
        />

        <span className="text-green-700 text-sm font-medium">

          {value}

        </span>

      </span>

    </div>

  );

}

export default function StudentTable({ students }) {

  return (

    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">

      <div className="overflow-x-auto lg:overflow-x-visible">

        <table className="w-full table-auto">

          <thead className="sticky top-0 bg-white z-20 border-b">

            <tr>

              <th className="px-5 py-5 text-left text-xs uppercase tracking-wider text-slate-500 w-14">

                #

              </th>

              <th className="px-5 py-5 text-left text-xs uppercase tracking-wider text-slate-500 w-[280px]">

                Student

              </th>

              <th className="px-5 py-5 text-left text-xs uppercase tracking-wider text-slate-500 w-[140px]">

                Progress

              </th>

              {columns.map((col) => {

                const Icon = col.icon;

                return (

                  <th
                    key={col.key}
                    className="px-3 py-4 text-center w-[90px]"
                  >

                    <div className="flex flex-col items-center gap-2">

                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${col.bg}`}
                      >

                        <Icon
                          size={18}
                          className={col.color}
                        />

                      </div>

                      <span className="text-xs font-semibold text-slate-600">

                        {col.title}

                      </span>

                    </div>

                  </th>

                );

              })}

            </tr>

          </thead>

          <tbody>

            {students.map((student, index) => (

              <tr
                key={student.id}
                className="border-b border-slate-100 hover:bg-slate-50 transition-all duration-200"
              >

                <td className="px-3 py-4 font-medium text-slate-500">

                  {index + 1}

                </td>

                <td className="px-5 py-5">

                  <div className="flex items-center gap-3">

                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 text-white flex items-center justify-center font-semibold shadow-sm">

                      {student.name.charAt(0)}

                    </div>

                    <div>

                      <h3 className="font-semibold text-slate-800">

                        {student.name}

                      </h3>

                      <p className="text-xs text-slate-500">

                        {student.email}

                      </p>

                    </div>

                  </div>

                </td>

                <td className="px-5 py-5">

                  <Progress
                    progress={student.progress}
                  />

                </td>

                {columns.map((col) => (

                  <td
                    key={col.key}
                    className="px-4 py-5"
                  >

                    <Cell
                      value={student[col.key]}
                    />

                  </td>

                ))}

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>

  );

}