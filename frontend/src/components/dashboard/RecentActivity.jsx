function RecentActivity() {

    const students = [

        {
            name:"Rahul Sharma",
            desk:"Gate Entry",
            time:"09:12 AM"
        },

        {
            name:"Priya Singh",
            desk:"Admission",
            time:"09:16 AM"
        },

        {
            name:"Arjun Mehta",
            desk:"Hostel",
            time:"09:20 AM"
        },

        {
            name:"Ananya Gupta",
            desk:"IT",
            time:"09:24 AM"
        }

    ];

    return (

        <div className="bg-white rounded-2xl shadow-sm border p-6">

            <h2 className="font-bold text-xl mb-5">

                Recent Activity

            </h2>

            <table className="w-full">

                <thead>

                    <tr className="text-left border-b">

                        <th className="py-3">

                            Student

                        </th>

                        <th>

                            Desk

                        </th>

                        <th>

                            Time

                        </th>

                    </tr>

                </thead>

                <tbody>

                    {

                        students.map((student,index)=>(

                            <tr
                                key={index}
                                className="border-b last:border-none"
                            >

                                <td className="py-4">

                                    {student.name}

                                </td>

                                <td>

                                    {student.desk}

                                </td>

                                <td>

                                    {student.time}

                                </td>

                            </tr>

                        ))

                    }

                </tbody>

            </table>

        </div>

    );

}

export default RecentActivity;