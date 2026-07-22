import {
  GraduationCap,
  ShieldCheck,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function StudentLogin() {
  const navigate = useNavigate();

   const handleSSO = (e) => {
  e.preventDefault();

  const redirect =
    sessionStorage.getItem("redirectAfterLogin") || "/student";

  window.location.href =
    `${import.meta.env.VITE_API_URL}/auth/sso/login?type=student&redirect=${encodeURIComponent(
      redirect
    )}`;
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-700 via-teal-600 to-emerald-600 flex items-center justify-center p-5">

      <div className="w-full max-w-md">

        {/* Hero */}

        <div className="text-center text-white">

          {/* <div className="mx-auto w-24 h-24 rounded-3xl bg-white/15 backdrop-blur-lg border border-white/20 flex items-center justify-center shadow-xl"> */}

            <img src="https://media.plaksha.edu.in/logo-white.png" alt="PLAKSHA" className="mx-auto w-70 h-35"></img>

          {/* </div> */}

          <h1 className="text-4xl font-bold mt-8 tracking-tight">
            Onboarding Tracker
          </h1>

          <p className="mt-3 text-teal-100 leading-relaxed">
            Complete your onboarding journey effortlessly with
            QR based desk verification.
          </p>

        </div>

        {/* Feature Pills */}

        {/* <div className="flex justify-center gap-3 mt-8">

          <div className="bg-white/10 backdrop-blur-lg border border-white/15 rounded-full px-4 py-2 text-sm text-white">
            ⚡ Fast
          </div>

          <div className="bg-white/10 backdrop-blur-lg border border-white/15 rounded-full px-4 py-2 text-sm text-white">
            🔒 Secure
          </div>

          <div className="bg-white/10 backdrop-blur-lg border border-white/15 rounded-full px-4 py-2 text-sm text-white">
            📱 QR Based
          </div>

        </div> */}

        {/* Login Card */}

        <div className="bg-white rounded-[32px] mt-12 shadow-2xl overflow-hidden">

          <div className="p-8">

            <div className="flex items-center gap-4">

              <div className="w-14 h-14 rounded-2xl bg-teal-100 flex items-center justify-center">

                <ShieldCheck
                  className="text-teal-700"
                  size={28}
                />

              </div>

              <div>

                <h2 className="text-xl font-bold text-slate-800">
                  Welcome
                </h2>

                <p className="text-slate-500 text-sm">
                  Sign in using your Plaksha account
                </p>

              </div>

            </div>

            <button
              onClick={handleSSO}
              className="mt-8 w-full bg-teal-600 hover:bg-teal-700 rounded-2xl py-4 text-white font-semibold flex items-center justify-center gap-3 transition-all hover:scale-[1.02]"
            >

              <Sparkles size={18} />

              Continue with Plaksha SSO

              <ArrowRight size={18} />

            </button>

            <div className="mt-8 border-t border-slate-100 pt-6">

              <p className="text-center text-sm text-slate-500">
                By continuing you agree to use your official
                university credentials for authentication.
              </p>

            </div>

          </div>

        </div>

        <p className="text-center text-teal-100 text-sm mt-8">
          Plaksha University • Onboarding 2026
        </p>

      </div>

    </div>
  );
}