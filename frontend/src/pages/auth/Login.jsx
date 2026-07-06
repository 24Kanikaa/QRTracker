import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import { useState } from "react";

function Login() {

    const [showPassword, setShowPassword] = useState(false);

    return (

        <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-teal-100 flex items-center justify-center p-6">

            <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8">

                <div className="flex justify-center">

                    <div className="w-20 h-20 rounded-full bg-teal-600 flex items-center justify-center">

                        <ShieldCheck
                            size={40}
                            className="text-white"
                        />

                    </div>

                </div>

                <h1 className="text-3xl font-bold text-center mt-6">

                    Admission Tracker

                </h1>

                <p className="text-gray-500 text-center mt-2">

                    Admin Login

                </p>

                <div className="mt-8">

                    <label className="font-medium">

                        Email

                    </label>

                    <input

                        type="email"

                        placeholder="admin@plaksha.edu.in"

                        className="w-full mt-2 border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-600"

                    />

                </div>

                <div className="mt-5">

                    <label className="font-medium">

                        Password

                    </label>

                    <div className="relative">

                        <input

                            type={showPassword ? "text" : "password"}

                            placeholder="********"

                            className="w-full mt-2 border rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-teal-600"

                        />

                        <button

                            type="button"

                            className="absolute right-4 top-6 text-gray-500"

                            onClick={() =>
                                setShowPassword(!showPassword)
                            }

                        >

                            {

                                showPassword ?

                                    <EyeOff size={20} />

                                    :

                                    <Eye size={20} />

                            }

                        </button>

                    </div>

                </div>

                <button

                    className="w-full mt-8 bg-teal-600 hover:bg-teal-700 text-white rounded-xl py-3 font-semibold transition"

                >

                    Login

                </button>

                <div className="mt-8 text-center text-gray-400 text-sm">

                    Plaksha University

                </div>

            </div>

        </div>

    );

}

export default Login;