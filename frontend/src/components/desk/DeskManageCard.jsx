import {
  Building2,
  MapPin,
  DoorOpen,
  Pencil,
  Trash2,
  QrCode,
  CheckCircle2,
  XCircle,
} from "lucide-react";

export default function DeskManageList({
  desks = [],
  onQR,
  onEdit,
  onDelete,
}) {
  if (!desks.length) {
    return (
      <div className="bg-white rounded-2xl border border-dashed border-slate-300 py-16 text-center">
        <Building2 className="mx-auto text-slate-300" size={42} />

        <h2 className="mt-4 text-lg font-semibold text-slate-700">
          No desks created
        </h2>

        <p className="text-slate-500 text-sm mt-1">
          Click "Add Desk" to create your first onboarding desk.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {desks.map((desk) => (
        <div
          key={desk.id}
          className={`
            rounded-2xl
            border
            px-5
            py-4
            flex
            items-center
            justify-between
            transition-all
            duration-300
            ${
              desk.active
                ? "bg-white border-slate-200 hover:border-teal-300 hover:shadow-md"
                : "bg-slate-50 border-slate-200 opacity-70 grayscale-[0.25]"
            }
          `}
        >
          {/* Left */}
          <div className="flex items-center gap-4">
            <div  className={`
              w-12
              h-12
              rounded-xl
              flex
              items-center
              justify-center
              shadow
              ${
                desk.active
                  ? "bg-gradient-to-br from-teal-500 to-cyan-500"
                  : "bg-slate-300"
              }
            `}>
              <Building2 className="text-white" size={22} />
            </div>

            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className={`font-semibold text-lg ${
                  desk.active ? "text-slate-800" : "text-slate-500"
                }`}>
                  {desk.desk_name}
                </h2>

                {desk.active ? (
                  <span className="inline-flex items-center gap-1 text-xs bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full">
                    <CheckCircle2 size={12} />
                    Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs bg-red-100 text-red-700 px-2.5 py-1 rounded-full">
                    <XCircle size={12} />
                    Disabled
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-5 mt-2 text-sm text-slate-500">
                {desk.location && (
                  <span className="flex items-center gap-1">
                    <MapPin size={14} />
                    {desk.location}
                  </span>
                )}

                <span className="flex items-center gap-1">
                  <DoorOpen size={14} />
                  {desk.is_gate ? "Gate Desk" : "Regular Desk"}
                </span>

                <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded-lg">
                  {desk.qr_slug}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">

            <button
              onClick={() => onQR?.(desk)}
              className="h-10 w-10 rounded-xl border border-slate-200 hover:bg-slate-100 transition"
              title="Download QR"
            >
              <QrCode size={18} className="mx-auto text-slate-600" />
            </button>

            <button
              onClick={() => onEdit?.(desk)}
              className="h-10 w-10 rounded-xl bg-amber-50 text-amber-700 hover:bg-amber-100 transition"
              title="Edit Desk"
            >
              <Pencil size={18} className="mx-auto" />
            </button>

            <button
              onClick={() => onDelete?.(desk)}
              className="h-10 w-10 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition"
              title="Delete Desk"
            >
              <Trash2 size={18} className="mx-auto" />
            </button>

          </div>
        </div>
      ))}
    </div>
  );
}