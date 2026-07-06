import {
    Building2,
    MapPin,
    Pencil,
    Trash2,
    CheckCircle2,
} from "lucide-react";

export default function DeskManageCard({ desk }) {

    return (

        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-lg transition">

            <div className="flex justify-between">

                <div className="flex gap-4">

                    <div className="w-14 h-14 rounded-2xl bg-teal-50 flex justify-center items-center">

                        <Building2
                            className="text-teal-600"
                            size={25}
                        />

                    </div>

                    <div>

                        <h2 className="font-bold text-lg">

                            {desk.name}

                        </h2>

                        <div className="flex items-center gap-1 text-slate-500 mt-1">

                            <MapPin size={14}/>

                            {desk.location}

                        </div>

                    </div>

                </div>

                <CheckCircle2
                    className="text-emerald-500"
                    size={22}
                />

            </div>

            <div className="mt-7 space-y-2">

                <div className="flex justify-between">

                    <span className="text-slate-500">

                        Slug

                    </span>

                    <span className="font-medium">

                        {desk.slug}

                    </span>

                </div>

                <div className="flex justify-between">

                    <span className="text-slate-500">

                        Status

                    </span>

                    <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">

                        {desk.status}

                    </span>

                </div>

            </div>

            <div className="flex gap-3 mt-8">

                <button className="flex-1 bg-teal-600 hover:bg-teal-700 rounded-xl text-white py-3 flex justify-center items-center gap-2">

                    <Pencil size={16}/>

                    Edit

                </button>

                <button className="w-14 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 flex justify-center items-center">

                    <Trash2 size={18}/>

                </button>

            </div>

        </div>

    );

}