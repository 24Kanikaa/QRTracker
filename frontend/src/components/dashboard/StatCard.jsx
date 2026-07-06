import { ArrowUpRight } from "lucide-react";

function StatCard({ title, value, icon: Icon, color }) {

    return (

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">

            <div className="flex justify-between items-center">

                <div>

                    <p className="text-slate-500 text-sm">

                        {title}

                    </p>

                    <h2 className="text-4xl font-bold mt-3">

                        {value}

                    </h2>

                </div>

                <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center"
                    style={{ background: color }}
                >

                    <Icon className="text-white"/>

                </div>

            </div>

            <div className="flex items-center mt-5 text-teal-600 text-sm">

                <ArrowUpRight size={16}/>

                <span className="ml-2">

                    Live Today

                </span>

            </div>

        </div>

    );

}

export default StatCard;