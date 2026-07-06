function DeskProgress({

    desk,

    count,

    total

}) {

    const percentage = Math.round((count / total) * 100);

    return (

        <div className="mb-6">

            <div className="flex justify-between mb-2">

                <span className="font-medium">

                    {desk}

                </span>

                <span>

                    {count}

                </span>

            </div>

            <div className="w-full h-3 bg-slate-200 rounded-full">

                <div

                    className="bg-teal-600 h-3 rounded-full"

                    style={{

                        width: `${percentage}%`

                    }}

                />

            </div>

        </div>

    );

}

export default DeskProgress;