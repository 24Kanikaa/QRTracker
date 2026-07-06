import { TrendingUp } from "lucide-react";

export default function DeskOverviewCard({
    title,
    value,
    subtitle,
    icon: Icon,
    iconBg,
    iconColor,
}) {

    return (

        <div className="group bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">

            <div className="flex justify-between">

                <div>

                    <p className="text-sm text-slate-500">

                        {title}

                    </p>

                    <h2 className="text-4xl font-bold text-slate-800 mt-3">

                        {value}

                    </h2>

                    <p className="text-sm text-slate-400 mt-2">

                        {subtitle}

                    </p>

                </div>

                <div className={`w-16 h-16 rounded-2xl ${iconBg} flex items-center justify-center`}>

                    <Icon
                        className={iconColor}
                        size={28}
                    />

                </div>

            </div>

            <div className="mt-6 flex items-center gap-2 text-emerald-600 text-sm font-medium">

                <TrendingUp size={16} />

                Live Today

            </div>

        </div>

    );

}