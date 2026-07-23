import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import QRScannerModal from "./QRScannerModal";
import {
    getJourney,
    scanDesk,
} from "../../services/deskService";
import {
  Building2,
  DoorOpen,
  FileCheck,
  BedDouble,
  Laptop,
  UtensilsCrossed,
  LibraryBig,
  ClipboardList,
  Shield,
  Users,
  // Home,
  CheckCircle2,
  QrCode,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { LogOut,ExternalLink, X  } from "lucide-react";

const ICONS = {
  gate: DoorOpen,
  admission: FileCheck,
  hostel: BedDouble,
  laptop: Laptop,
  it: Laptop,
  mess: UtensilsCrossed,
  library: LibraryBig,
  building: Building2,
  clipboard: ClipboardList,
  shield: Shield,
  users: Users,
  // home: Home,
};


const COLORS = {
  gate: "bg-blue-100 text-blue-600",
  admission: "bg-violet-100 text-violet-600",
  hostel: "bg-orange-100 text-orange-600",
  laptop: "bg-cyan-100 text-cyan-600",
  it: "bg-cyan-100 text-cyan-600",
  mess: "bg-green-100 text-green-600",
  library: "bg-amber-100 text-amber-600",
  building: "bg-slate-100 text-slate-600",
  clipboard: "bg-pink-100 text-pink-600",
  shield: "bg-indigo-100 text-indigo-600",
  users: "bg-emerald-100 text-emerald-600",
  // home: "bg-orange-100 text-orange-600",
};

function getDeskVisual(desk) {
  const key = (desk.icon || "").toLowerCase();

  return {
    icon: ICONS[key] || Building2,
    color: COLORS[key] || "bg-slate-100 text-slate-600",
  };
}
import { useNavigate } from "react-router-dom";


export default function Home() {
  const navigate = useNavigate();
  const [showScanner, setShowScanner] = useState(false);
// const [selectedDesk, setSelectedDesk] = useState(null);
  const [student, setStudent] = useState(null);
  const [journey, setJourney] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLinks, setShowLinks] = useState(false);
 const { user,logout } = useAuth();
  const fetchJourney = useCallback(async () => {
    const email = user?.email;

    if (!email) {
      setError("You're not logged in. Please sign in again.");
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const res = await getJourney(email);
      const { student: s, journey: j } = res.data.data;
      setStudent(s);
      setJourney(j);
      console.log(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load your journey.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJourney();
  }, [fetchJourney]);

function getLoggedInEmail() {
  try {
    return user?.email || null;
  } catch {
    return null;
  }
}
useEffect(() => {
  if (
    student &&
    student.total > 0 &&
    student.completed === student.total
  ) {
    navigate("/success", { replace: true });
  }
}, [student, navigate]);

const handleScan = async (qrSlug) => {
  setShowScanner(false);

  // Redirect to the scanner route
  window.location.href = qrSlug;
};

  /* ---------- loading state ---------- */
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Loader2 size={28} className="animate-spin text-teal-600" />
          <p className="text-sm">Loading your journey...</p>
        </div>
      </div>
    );
  }

  /* ---------- error state ---------- */
  if (error) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center px-6">
        <div className="bg-white rounded-3xl shadow-sm p-8 max-w-sm w-full text-center">
          <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={26} />
          </div>
          <h3 className="font-semibold text-slate-800">Something went wrong</h3>
          <p className="text-sm text-slate-500 mt-2">{error}</p>
          <button
            onClick={fetchJourney}
            className="mt-5 w-full h-11 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-medium transition"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  const progress = student?.total
    ? Math.round((student.completed / student.total) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center">
      <div className="w-full max-w-md bg-slate-100 min-h-screen">

        {/* HEADER */}

        <div className="bg-gradient-to-br from-teal-600 via-teal-600 to-teal-700 rounded-b-[36px] px-6 pt-12 pb-16 text-white shadow-lg">

          <div className="flex justify-between items-start">

            <div className="flex gap-4">

                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 shadow-lg">
                <img
                  src="https://media.plaksha.edu.in/logo-white.png"
                  alt="Plaksha"
                  className="h-9 object-contain"
                />
              </div>

                <div>
                  <h3 className="text-xl font-bold mt-1 mb-1">
                     Welcome to Plaksha
                  </h3>

                  <p className="text-teal-100 text-sm font-bold">
                    {user?.name || student?.name || user?.email}
                  </p>

                  <button
                    type="button"
                    onClick={() => setShowLinks(true)}
                    className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-white/90 hover:text-white underline underline-offset-4 transition"
                  >
                    Important Links
                  </button>
                </div>

            </div>

            <button
                  onClick={logout}
                  title="Logout"
                  aria-label="Logout"
                  className="group flex h-11 w-11 items-center justify-center rounded-full bg-white/10 border border-white/20 backdrop-blur-md transition-all duration-200 hover:bg-red-500 hover:border-red-400 hover:scale-105"
                >
                  <LogOut className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
                </button>

          </div>

        </div>

        {/* Progress */}

        <div className="mx-5 -mt-10 bg-white rounded-3xl shadow-xl p-6">

          <div className="flex justify-between items-center">

            <div>
              <p className="text-slate-500 text-sm">
                Onboarding Progress
              </p>

              <h2 className="text-2xl font-bold mt-2">
                {student?.completed} of {student?.total}
              </h2>

              <p className="text-slate-400 text-sm mt-1">
                Student ID • {student?.rollNo}
              </p>
            </div>

            <div className="relative w-20 h-20">
              <svg className="w-20 h-20 rotate-[-90deg]" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" stroke="#E5E7EB" strokeWidth="8" fill="none" />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  stroke="#0F766E"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={264}
                  strokeDashoffset={264 - (264 * progress) / 100}
                />
              </svg>

              <div className="absolute inset-0 flex items-center justify-center font-bold">
                {progress}%
              </div>
            </div>

          </div>

        </div>

        {/* Journey */}

        <div className="px-5 mt-8 pb-8">

          <div className="flex justify-between mb-6">
            <h2 className="text-xl font-bold">Your Track</h2>
            <span className="text-teal-600 font-semibold">
              {student?.completed}/{student?.total}
            </span>
          </div>

          <div className="relative">
            <div className="absolute left-7 top-5 bottom-5 w-[2px] bg-slate-200"></div>

            <div className="space-y-5">
              {journey.map((desk) => {
                const { icon: Icon, color } = getDeskVisual(desk);

                return (
                  <div key={desk.id} className="relative bg-white rounded-3xl p-4 shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="relative z-10 w-14 h-14 rounded-2xl flex items-center justify-center bg-teal-50 dark:bg-teal-500/10 border border-teal-200 dark:border-teal-500/20">
                        <Icon
                          size={26}
                          className="text-teal-700 dark:text-teal-400"
                        />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{desk.title}</h3>
                          {desk.status === "completed" && (
                            <CheckCircle2 size={18} className="text-green-600" />
                          )}
                        </div>

                        <p className="text-sm text-slate-500">{desk.location}</p>

                        {desk.status === "completed" && (
                          <p className="text-xs text-green-600 mt-2">
                            Completed at {desk.time}
                          </p>
                        )}
                      </div>

                      {desk.status === "completed" ? (
                        <span className="text-green-600 font-semibold text-sm">Done</span>
                      ) : (
                        <button
                          onClick={() => {
                            // setSelectedDesk(desk);
                            setShowScanner(true);
                          }}
                          className="w-12 h-12 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white flex items-center justify-center"
                        >
                          <QrCode size={22} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Help */}

        <div className="px-5 pb-8">
          <div className="bg-white rounded-3xl p-5">
            <h3 className="font-semibold">Need Assistance?</h3>
            <p className="text-sm text-slate-500 mt-2">
              If you face any issue during the onboarding process,
              please contact the nearest volunteer.
            </p>
          </div>
        </div>

      </div>

      {/* important links div */}
      {showLinks && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl overflow-hidden">

            <div className="flex items-center justify-between px-6 py-5 border-b">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Important Links
                </h2>
                <p className="text-sm text-slate-500">
                  Quick access to student resources
                </p>
              </div>

              <button
                onClick={() => setShowLinks(false)}
                className="w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-3">

              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded-xl border border-slate-200 p-4 hover:border-teal-500 hover:bg-teal-50 transition"
              >
                <div>
                  <p className="font-semibold text-slate-900">
                    Academic Calendar
                  </p>
                  <p className="text-xs text-slate-500">
                    Semester schedule & holidays
                  </p>
                </div>
                <ExternalLink size={18} className="text-slate-400" />
              </a>

              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded-xl border border-slate-200 p-4 hover:border-teal-500 hover:bg-teal-50 transition"
              >
                <div>
                  <p className="font-semibold text-slate-900">
                    Student Handbook
                  </p>
                  <p className="text-xs text-slate-500">
                    Campus policies & guidelines
                  </p>
                </div>
                <ExternalLink size={18} className="text-slate-400" />
              </a>

              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded-xl border border-slate-200 p-4 hover:border-teal-500 hover:bg-teal-50 transition"
              >
                <div>
                  <p className="font-semibold text-slate-900">
                    Campus Map
                  </p>
                  <p className="text-xs text-slate-500">
                    Navigate the campus easily
                  </p>
                </div>
                <ExternalLink size={18} className="text-slate-400" />
              </a>

            </div>
          </div>
        </div>
      )}
      <QRScannerModal
        open={showScanner}
        onClose={() => {
          setShowScanner(false);
          // setSelectedDesk(null);
        }}
        onScan={handleScan}
      />

    </div>
  );
}