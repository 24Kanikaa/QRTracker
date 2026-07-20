import { Routes, Route } from "react-router-dom";

import Login from "../pages/auth/Login";
import Dashboard from "../pages/admin/Dashboard";
import Students from "../pages/admin/Students";
import Desks from "../pages/admin/Desks";
import Settings from "../pages/admin/Settings";

import Home from "../pages/student/Home";
import Success from "../pages/student/Success";
import StudentLogin from "../pages/student/Login";
import StudentLoginError from "../pages/auth/StudentLoginError";
import UserLoginError from "../pages/auth/UserLoginError";

import AdminLayout from "../layouts/AdminLayout";
import { AuthProvider } from "../context/AuthContext";
import ProtectedRoute from "../components/ProtectedRoute";

export default function AppRoutes() {

    return (

        <AuthProvider>

            <Routes>

                <Route
                    path="/"
                    element={<Login />}
                />

                <Route
                    path="/student-login"
                    element={<StudentLogin />}
                />

                <Route
                    path="/student-login-error"
                    element={<StudentLoginError />}
                />

                <Route
                    path="/user-login-error"
                    element={<UserLoginError />}
                />

                {/* STUDENT */}

                <Route
                    path="/student"
                    element={
                        <ProtectedRoute
                            allowedRoles={["STUDENT"]}
                        >
                            <Home />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/success"
                    element={
                        <ProtectedRoute
                            allowedRoles={["STUDENT"]}
                        >
                            <Success />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/completed"
                    element={
                        <ProtectedRoute
                            allowedRoles={["STUDENT"]}
                        >
                            <Success />
                        </ProtectedRoute>
                    }
                />

                {/* ADMIN */}

                <Route
                    element={
                        <ProtectedRoute
                            allowedRoles={[
                                "ADMIN",
                                "SUPER_ADMIN",
                                "USER"
                            ]}
                        >
                            <AdminLayout />
                        </ProtectedRoute>
                    }
                >
                   
                    <Route
                        path="/admin"
                        element={
                            <ProtectedRoute
                                allowedRoles={[
                                     "ADMIN",
                                      "SUPER_ADMIN",
                                      "USER"
                                ]}
                            >
                                <Dashboard />
                            </ProtectedRoute>
                        }
                       />

                    <Route
                        path="/admin/students"
                        element={
                        <ProtectedRoute
                                allowedRoles={[
                                     "ADMIN",
                                      "SUPER_ADMIN",
                                      "USER"
                                ]}
                            >
                                <Students />
                            </ProtectedRoute>
                        }
                       />

                    {/* ADMIN ONLY */}

                    <Route
                        path="/admin/desks"
                        element={
                            <ProtectedRoute
                                allowedRoles={[
                                    "ADMIN",
                                    "SUPER_ADMIN"
                                ]}
                            >
                                <Desks />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/admin/settings"
                        element={
                            <ProtectedRoute
                                allowedRoles={[
                                    "ADMIN",
                                    "SUPER_ADMIN"
                                ]}
                            >
                                <Settings />
                            </ProtectedRoute>
                        }
                    />

                </Route>

            </Routes>

        </AuthProvider>

    );

}