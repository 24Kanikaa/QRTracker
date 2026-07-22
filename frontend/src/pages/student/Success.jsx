import {
  CheckCircle2,
  PartyPopper,
  GraduationCap,
  Home,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import {
    getJourney,
} from "../../services/deskService";
export default function Success() {
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
const [journey, setJourney] = useState([]);
const [loading, setLoading] = useState(true);

const { user } = useAuth();

const fetchJourney = useCallback(async () => {
  try {
    const res = await getJourney(user.email);
    console.log(res.data);
    setStudent(res.data.data.student);
    setJourney(res.data.data.journey);
  } finally {
    setLoading(false);
  }
}, [user]);

useEffect(() => {
  fetchJourney();
}, [fetchJourney]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-600 via-teal-600 to-slate-100 flex justify-center">

      <div className="w-full max-w-md min-h-screen flex flex-col">

        {/* Top */}

        <div className="pt-16 px-6 text-center text-white">

          <div className="mx-auto w-28 h-28 rounded-full bg-white/20 backdrop-blur flex items-center justify-center shadow-lg">

            <CheckCircle2
              size={72}
              className="text-white"
            />

          </div>

          <div className="mt-8">

            <div className="flex justify-center mb-3">

              <PartyPopper
                size={28}
                className="text-yellow-300"
              />

            </div>

            <h1 className="text-4xl font-bold">

              Congratulations!

            </h1>

            <p className="text-teal-100 mt-3 leading-7">

              You have successfully completed your
              onboarding process.

            </p>

          </div>

        </div>

        {/* Card */}

        <div className="flex-1 mt-10 bg-white rounded-t-[40px] px-6 pt-8 shadow-xl">

          <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-5">

            <div className="flex items-center gap-4">

              <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center">

                <GraduationCap
                  className="text-emerald-600"
                  size={28}
                />

              </div>

              <div>

                <h2 className="font-bold text-slate-800 text-lg">

                  Onboarding Completed

                </h2>

                <p className="text-sm text-slate-500">

                  All required desks have been visited.

                </p>

              </div>

            </div>

          </div>

          {/* Journey */}

          <div className="mt-8">

            <h3 className="font-semibold text-slate-800 mb-5">

              Journey Summary

            </h3>

           <div className="space-y-4">
            {journey?.length ? (
              journey.map((desk) => (
                <SummaryRow
                  key={desk.id}
                  title={desk.title}
                  location={desk.location}
                />
              ))
            ) : (
              <p className="text-center text-slate-500 py-6">
                No journey found
              </p>
            )}
          </div>

          </div>

          {/* Message */}

          <div className="mt-8 rounded-3xl bg-teal-50 border border-teal-200 p-5">

            <p className="text-sm text-slate-600 leading-7">

              Your onboarding process has been completed
              successfully.


            </p>

          </div>

          {/* Buttons */}

          {/* <div className="mt-8 space-y-4">
            <button
              onClick={() => navigate("/student")}
              className="w-full border border-slate-300 rounded-2xl py-4 font-semibold text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-2"
            >

              <Home size={20} />

              Back to Home

            </button>

          </div> */}

          <p className="text-center text-slate-400 text-xs mt-8 pb-8">

            Welcome to the Plaksha Community.

          </p>

        </div>

      </div>

    </div>
  );
}

function SummaryRow({ title, location }) {
  return (
    <div className="flex items-center justify-between">

      <div className="flex items-center gap-3">

        <CheckCircle2
          className="text-green-600"
          size={20}
        />

        <div>
          <p className="font-medium text-slate-700">
            {title}
          </p>
        </div>

      </div>

      <span className="text-green-600 text-sm font-semibold">
        Completed
      </span>

    </div>
  );
}