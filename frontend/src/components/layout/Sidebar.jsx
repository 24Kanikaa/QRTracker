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
    { name: "Dashboard", icon: LayoutDashboard, path: "/admin" },
    { name: "Students", icon: Users, path: "/admin/students" },
    { name: "Desks", icon: Building2, path: "/admin/desks" },
    { name: "Settings", icon: Settings, path: "/admin/settings" },
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
              className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm"
              style={{ background: C.brassSoft, color: C.brass, border: `1px solid ${C.brass}40` }}
            >
              Q
            </div>
            <div>
              <h1 className="font-bold text-xl tracking-wide" style={{ color: C.text }}>
                QRFlow
              </h1>
              <p className="text-xs mt-1" style={{ color: C.mutedSoft }}>
                Admission Tracker
              </p>
            </div>
          </div>

          <button className="lg:hidden" onClick={() => setOpen(false)} style={{ color: C.muted }}>
            <X size={20} />
          </button>
        </div>

        {/* User */}
        <div className="px-6 py-6" style={{ borderBottom: `1px solid ${C.hairline}` }}>
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg"
              style={{ background: C.brassSoft, color: C.brass, border: `1px solid ${C.brass}40` }}
            >
              {user?.name?.charAt(0) || "A"}
            </div>
            <div>
              <h3 className="font-semibold" style={{ color: C.text }}>
                {user?.name || "Administrator"}
              </h3>
              <p className="text-sm" style={{ color: C.muted }}>
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
                  isActive ? "shadow-lg" : "hover:bg-white/5"
                }`
              }
              style={({ isActive }) =>
                isActive
                  ? { background: C.brassSoft, color: C.brass, border: `1px solid ${C.brass}40` }
                  : { color: C.muted, border: "1px solid transparent" }
              }
            >
              <item.icon size={20} />
              {item.name}
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