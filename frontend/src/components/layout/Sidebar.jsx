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

/* ---------------------------------------------------------
   Same deep-teal dark tokens as the dashboard, so the
   sidebar and the content read as one product.
--------------------------------------------------------- */
const C = {
  bg: "#07211D",
  panel: "#0E322D",
  hairline: "#1D5148",
  hairlineSoft: "#153E37",
  text: "#EAF7F3",
  muted: "#8FC7BC",
  mutedSoft: "#5C978B",
  brass: "#2DD4BF",
  brassSoft: "#2DD4BF26",
  rose: "#F97362",
  roseSoft: "#F9736226",
};

function Sidebar({ open, setOpen }) {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

const menus = [
  {
    name: "Dashboard",
    path: "/admin",
    icon: LayoutDashboard,
    roles: ["SUPER_ADMIN", "ADMIN", "USER"],
  },
  {
    name: "Students",
    path: "/admin/students",
    icon: Users,
    roles: ["SUPER_ADMIN", "ADMIN", "USER"],
  },
  {
    name: "Desks",
    path: "/admin/desks",
    icon: Building2,
    roles: ["SUPER_ADMIN", "ADMIN"],
  },
  {
    name: "Settings",
    path: "/admin/settings",
    icon: Settings,
    roles: ["SUPER_ADMIN", "ADMIN"],
  },
];

const visibleMenus = menus.filter((menu) =>
  menu.roles.includes(user?.role)
);
  const getInitials = (name = "") =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
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
          shadow-lg
          flex
          flex-col
          transition-transform
          duration-300
          ${open ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
        style={{
          background: C.panel,
          borderRight: `1px solid ${C.hairline}`,
          color: C.text,
        }}
      >
        {/* Logo */}
        <div
          className="h-20 px-6 flex items-center justify-between"
          style={{ borderBottom: `1px solid ${C.hairline}` }}
        >
          <div className="flex items-center gap-3">

            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center font-bold"
              style={{
                background: C.brassSoft,
                color: C.brass,
                border: `1px solid ${C.brass}40`,
              }}
            >
              {getInitials(user?.name)}
            </div>

            <div>
              <h2
                className="font-semibold text-lg"
                style={{ color: C.text }}
              >
                {user?.name || "Administrator"}
              </h2>

              <p
                className="text-xs"
                style={{ color: C.mutedSoft }}
              >
                Onboarding Tracker
              </p>
            </div>
          </div>

          <button
            className="lg:hidden"
            onClick={() => setOpen(false)}
          >
            <X size={20} />
          </button>
        </div>


        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto">
          {visibleMenus.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/admin"}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `group flex items-center gap-4 px-4 py-3 rounded-2xl mb-2 transition-all duration-200 ${
                  isActive
                    ? "shadow-lg"
                    : "hover:bg-white/5"
                }`
              }
              style={({ isActive }) =>
                isActive
                  ? {
                      background: C.brassSoft,
                      color: C.brass,
                      border: `1px solid ${C.brass}40`,
                    }
                  : {
                      color: C.muted,
                      border: "1px solid transparent",
                    }
              }
            >
              <item.icon size={20} />

              <span className="font-medium">
                {item.name}
              </span>
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4" style={{ borderTop: `1px solid ${C.hairline}` }}>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 rounded-2xl py-3 transition font-medium"
            style={{ background: "transparent", color: C.rose, border: `1px solid ${C.rose}40` }}
            onMouseEnter={(e) => (e.currentTarget.style.background = C.roseSoft)}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
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