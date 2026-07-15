import { AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function StudentLoginError() {

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

                <h1 className="text-3xl font-bold mt-6">

                    You're not on the expected student list

                </h1>

                <p className="text-slate-600 mt-4 leading-7">

                    We couldn't find your details in the onboarding list for the
                    current onboarding process.

                </p>

                <div className="mt-6 rounded-xl bg-amber-50 border border-amber-200 p-4">

                    <p className="font-medium text-amber-900">

                        Please contact the registration desk or the staff at the
                        main gate to verify your onboarding details before trying
                        to sign in again.

                    </p>

                </div>

                <button
                    onClick={() => navigate("/student-login")}
                    className="mt-8 px-8 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700"
                >
                    Back to Login
                </button>

            </div>

        </div>

    );

}