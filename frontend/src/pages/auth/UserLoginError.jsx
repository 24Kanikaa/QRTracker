import { AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function UserLoginError() {

    const navigate = useNavigate();

    return (

    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">

        <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl p-10 text-center">

            <div className="flex justify-center">
                <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
                    <AlertTriangle
                        size={40}
                        className="text-red-600"
                    />
                </div>
            </div>

            <h1 className="text-3xl font-bold mt-6 text-slate-900">
                Access Denied
            </h1>

            <p className="text-slate-600 mt-4 leading-7">
                Your account is authenticated, but you don't have permission to
                access the Tracker Admin Portal.
            </p>

            <div className="mt-6 rounded-xl bg-amber-50 border border-amber-200 p-5 text-left">
                <p className="font-semibold text-amber-900 mb-2">
                    What you can do:
                </p>

                <ul className="list-disc list-inside space-y-2 text-amber-800 text-sm">
                    <li>Verify that you've signed in with your authorized Plaksha account.</li>
                    <li>Contact the IT Team or the Tracker Portal Administrator to request access.</li>
                    <li>If you believe this is an error, ask the administrator to verify your role and permissions.</li>
                </ul>
            </div>

            <button
                onClick={() => navigate("/")}
                className="mt-8 px-8 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition"
            >
                Back to Home
            </button>

        </div>

    </div>

    );

}