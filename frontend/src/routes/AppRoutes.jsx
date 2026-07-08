import { Routes, Route } from "react-router-dom";

import Login from "../pages/auth/Login";

import Dashboard from "../pages/admin/Dashboard";
import Students from "../pages/admin/Students";
import Desks from "../pages/admin/Desks";
import Settings from "../pages/admin/Settings";

import Home from "../pages/student/Home";
import Success from "../pages/student/Success";
import StudentLogin from "../pages/student/Login";

import { AuthProvider } from "../context/AuthContext";
import ProtectedRoute from "../components/ProtectedRoute";


export default function AppRoutes() {
  return (
    <AuthProvider>
      <Routes>

        <Route path="/" element={<Login />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/students"
          element={
            <ProtectedRoute>
              <Students />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/desks"
          element={
            <ProtectedRoute>
              <Desks />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />

        <Route path="/student" element={<Home />} />
        {/* <Route path="/journey" element={<Journey />} /> */}
        <Route path="/completed" element={<Success />} />
        <Route path="/student-login" element={<StudentLogin />} />
        <Route path="/success" element={<Success />} />

      </Routes>
    </AuthProvider>
  );
}