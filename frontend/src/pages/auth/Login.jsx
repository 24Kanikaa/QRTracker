import { Eye, EyeOff, ShieldCheck, Loader2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { useAuth } from "../../context/AuthContext";
import { Navigate } from "react-router-dom";

   
function Login() {
    
    
  const navigate = useNavigate();

  const { login, user } = useAuth();

  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const { data } = await axios.post(
        "http://localhost:5000/api/auth/login",
        {
          email,
          password,
        }
      );

      login(data.user, data.token);

      navigate("/admin");
    } catch (err) {
      setError(
        err.response?.data?.message || "Invalid email or password."
      );
    } finally {
      setLoading(false);
    }
  };

   if (user) {
        return <Navigate to="/admin" replace />;
    }

  return (
 
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-teal-100 flex items-center justify-center p-6">

      <form
        onSubmit={handleLogin}
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8"
      >

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

        {error && (
          <div className="mt-6 rounded-xl bg-red-50 border border-red-200 text-red-600 px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <div className="mt-8">

          <label className="font-medium">
            Email
          </label>

          <input
            type="email"
            placeholder="admin@plaksha.edu.in"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full mt-2 border rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-teal-600"
            />

            <button
              type="button"
              className="absolute right-4 top-6 text-gray-500"
              onClick={() => setShowPassword(!showPassword)}
            >

              {showPassword ? (
                <EyeOff size={20} />
              ) : (
                <Eye size={20} />
              )}

            </button>

          </div>

        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-8 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white rounded-xl py-3 font-semibold transition flex justify-center items-center gap-2"
        >

          {loading ? (
            <>
              <Loader2
                size={18}
                className="animate-spin"
              />
              Logging In...
            </>
          ) : (
            "Login"
          )}

        </button>

        <div className="mt-8 text-center text-gray-400 text-sm">
          Plaksha University
        </div>

      </form>

    </div>
  );
}

export default Login;