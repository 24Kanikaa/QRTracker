import {
  LayoutDashboard,
  Users,
  Building2,
  Settings,
  LogOut,
  X,
} from "lucide-react";

import { NavLink } from "react-router-dom";

function Sidebar({ open, setOpen }) {
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

  return (
    <>
      {/* Overlay */}
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
        <div className="h-20 flex items-center justify-between px-6 border-b border-white/20 flex-shrink-0">
          <h1 className="font-bold text-xl">Tracker</h1>

          <button
            className="lg:hidden"
            onClick={() => setOpen(false)}
          >
            <X />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-6">
          {menus.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-4 px-4 py-3 rounded-xl mb-2 transition ${
                  isActive
                    ? "bg-white text-teal-700"
                    : "hover:bg-teal-600"
                }`
              }
            >
              <item.icon size={20} />
              {item.name}
            </NavLink>
          ))}

          <button className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-red-500 mt-10 w-full">
            <LogOut size={20} />
            Logout
          </button>
        </nav>
      </aside>
    </>
  );
}

export default Sidebar;