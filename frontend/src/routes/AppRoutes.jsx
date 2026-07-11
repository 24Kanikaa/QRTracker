import { Routes, Route } from "react-router-dom";

import Login from "../pages/auth/Login";
import Dashboard from "../pages/admin/Dashboard";
import Students from "../pages/admin/Students";
import Desks from "../pages/admin/Desks";
import Settings from "../pages/admin/Settings";

import Home from "../pages/student/Home";
import Success from "../pages/student/Success";
import StudentLogin from "../pages/student/Login";

import AdminLayout from "../layouts/AdminLayout";

import { AuthProvider } from "../context/AuthContext";
import ProtectedRoute from "../components/ProtectedRoute";

export default function AppRoutes() {
  return (
    <AuthProvider>
      <Routes>

        <Route path="/" element={<Login />} />

        <Route
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index path="/admin" element={<Dashboard />} />

          <Route
            path="/admin/students"
            element={<Students />}
          />

          <Route
            path="/admin/desks"
            element={<Desks />}
          />

          <Route
            path="/admin/settings"
            element={<Settings />}
          />
        </Route>

        <Route path="/student" element={<Home />} />
        <Route path="/student-login" element={<StudentLogin />} />
        <Route path="/completed" element={<Success />} />
        <Route path="/success" element={<Success />} />

      </Routes>
    </AuthProvider>
  );
}