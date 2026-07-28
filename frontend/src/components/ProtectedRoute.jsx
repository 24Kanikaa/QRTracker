import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Loader2 } from "lucide-react";

export default function ProtectedRoute({
    children,
    allowedRoles = []
}) {

    const { user, loading } = useAuth();

   if (loading) {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
            <Loader2
            size={44}
            className="animate-spin text-teal-600"
            />
            <h2 className="text-lg font-semibold text-slate-800">
            Loading...
            </h2>
        </div>
        </div>
    );
    }

    if (!user) {
        return <Navigate to="/" replace />;
    }

    if (
        allowedRoles.length &&
        !allowedRoles.includes(user.role)
    ) {
      console.log(user.role);

        if (user.role === "STUDENT") {
            return <Navigate to="/student" replace />;
        }

        return <Navigate to="/" replace />;
    }

    return children;
}