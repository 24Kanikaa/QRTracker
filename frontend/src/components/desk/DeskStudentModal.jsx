import { X } from "lucide-react";


export default function DeskStudentModal({
    open,
    onClose,
    students
}){


if(!open)
return null;


return (

<div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">


<div className="bg-white rounded-3xl w-[600px] max-h-[80vh] overflow-auto p-6">


<div className="flex justify-between mb-5">

<h2 className="text-xl font-bold">
Students
</h2>


<button onClick={onClose}>
<X/>
</button>


</div>



<table className="w-full border-separate border-spacing-y-3">

  <thead>

    <tr>

      <th className="text-left text-xs font-semibold uppercase tracking-wider text-slate-500 px-4">
        Student
      </th>

      <th className="text-left text-xs font-semibold uppercase tracking-wider text-slate-500 px-4">
        Email
      </th>

      <th className="text-right text-xs font-semibold uppercase tracking-wider text-slate-500 px-4">
        Scan Time
      </th>

    </tr>

  </thead>

  <tbody>

    {students.map((s) => (

      <tr
        key={s.id}
        className="bg-slate-50 hover:bg-teal-50 transition-all duration-200"
      >

        {/* Student */}

        <td className="px-4 py-4 rounded-l-2xl">

          <div className="flex items-center gap-3">

            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 text-white flex items-center justify-center font-semibold">

              {s.name
                ?.split(" ")
                .map((x) => x[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}

            </div>

            <div>

              <p className="font-semibold text-slate-800">
                {s.name}
              </p>

              <p className="text-xs text-slate-400">
                Student #{s.id}
              </p>

            </div>

          </div>

        </td>

        {/* Email */}

        <td className="px-4 py-4">

          <div className="text-slate-600">

            {s.email}

          </div>

        </td>

        {/* Scan */}

        <td className="px-4 py-4 rounded-r-2xl text-right">

          <span className="inline-flex items-center rounded-full bg-teal-100 text-teal-700 px-3 py-1 text-sm font-medium">

            {s.scan_time
              ? new Date(s.scan_time).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "--"}

          </span>

        </td>

      </tr>

    ))}

  </tbody>

</table>

</div>


</div>

)

}