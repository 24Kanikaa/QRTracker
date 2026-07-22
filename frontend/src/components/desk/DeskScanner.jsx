import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { scanDesk } from "../../services/deskService";

export default function DeskScanner() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const { user, loading } = useAuth();

  const hasScanned = useRef(false);

  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("Scanning QR...");

  useEffect(() => {
  if (loading) return;

  if (hasScanned.current) return;
  hasScanned.current = true;

  const scan = async () => {
    // Not logged in -> redirect to login
    if (!user) {
      sessionStorage.setItem(
        "redirectAfterLogin",
        location.pathname
      );

      navigate("/student-login", {
        replace: true,
      });

      return;
    }

    try {
      await scanDesk({
        email: user.email,
        qr_slug: slug,
      });

      navigate("/student", {
        replace: true,
      });
    } catch (err) {
      // Optionally pass the error to the dashboard
      navigate("/student", {
        replace: true,
        state: {
          error:
            err.response?.data?.message ||
            "Unable to scan this QR code.",
        },
      });
    }
  };

  scan();
}, [loading, user, slug, navigate, location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-sm text-center">

        {status === "loading" && (
          <>
            <Loader2
              size={56}
              className="mx-auto animate-spin text-teal-600"
            />

            <h2 className="mt-6 text-xl font-semibold">
              Processing Scan
            </h2>

            <p className="mt-2 text-slate-500">
              Please wait...
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle2
              size={64}
              className="mx-auto text-green-600"
            />

            <h2 className="mt-6 text-xl font-semibold">
              Scan Successful
            </h2>

            <p className="mt-2 text-slate-500">
              {message}
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle
              size={64}
              className="mx-auto text-red-600"
            />

            <h2 className="mt-6 text-xl font-semibold">
              Scan Failed
            </h2>

            <p className="mt-2 text-slate-500">
              {message}
            </p>

            <button
              onClick={() => navigate("/student")}
              className="mt-6 w-full rounded-xl bg-teal-600 py-3 text-white hover:bg-teal-700"
            >
              Back to Dashboard
            </button>
          </>
        )}

      </div>
    </div>
  );
}