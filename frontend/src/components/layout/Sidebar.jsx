import {
  LayoutDashboard,
  Users,
  Building2,
  Settings,
  LogOut,
  X,
} from "lucide-react";

import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function Sidebar({ open, setOpen }) {

  const navigate = useNavigate();

  const { logout, user } = useAuth();

  const menus = [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
      path: "/admin",
    },
    {
      name: "Students",
      icon: Users,
      path: "/admin/students",
    },
    {
      name: "Desks",
      icon: Building2,
      path: "/admin/desks",
    },
    {
      name: "Settings",
      icon: Settings,
      path: "/admin/settings",
    },
  ];

  const handleLogout = () => {

    logout();

    navigate("/");

  };

  return (
    <>
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
        />
      )}

      <aside
        className={`
          fixed
          top-0
          left-0
          bottom-0
          z-50
          w-72
          bg-teal-700
          text-white
          flex
          flex-col
          transition-transform
          duration-300
          ${open ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >

        {/* Logo */}

        <div className="h-20 px-6 border-b border-white/10 flex items-center justify-between">

          <div>

            <h1 className="font-bold text-xl tracking-wide">
              QRFlow
            </h1>

            <p className="text-xs text-teal-100 mt-1">
              Admission Tracker
            </p>

          </div>

          <button
            className="lg:hidden"
            onClick={() => setOpen(false)}
          >
            <X />
          </button>

        </div>

        {/* User */}

        <div className="px-6 py-6 border-b border-white/10">

          <div className="flex items-center gap-4">

            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center font-bold text-lg">

              {user?.name?.charAt(0) || "A"}

            </div>

            <div>

              <h3 className="font-semibold">

                {user?.name || "Administrator"}

              </h3>

              <p className="text-sm text-teal-100">

                {user?.role || "SUPER_ADMIN"}

              </p>

            </div>

          </div>

        </div>

        {/* Navigation */}

        <nav className="flex-1 px-4 py-6 overflow-y-auto">

          {menus.map((item) => (

            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-4 px-4 py-3 rounded-2xl mb-2 font-medium transition-all ${
                  isActive
                    ? "bg-white text-teal-700 shadow-sm"
                    : "text-white/90 hover:bg-white/10"
                }`
              }
            >

              <item.icon size={20} />

              {item.name}

            </NavLink>

          ))}

        </nav>

        {/* Logout */}

        <div className="p-4 border-t border-white/10">

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 rounded-2xl bg-red-500 hover:bg-red-600 py-3 transition font-medium"
          >

            <LogOut size={18} />

            Logout

          </button>

        </div>

      </aside>
    </>
  );
}

export default Sidebar;