import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({
    children,
    allowedRoles = []
}) {

    const { user, loading } = useAuth();

    if (loading) {
        return <div>Loading...</div>;
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