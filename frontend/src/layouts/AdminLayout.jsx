import { useEffect, useState } from "react";

import Sidebar from "../components/layout/Sidebar";
import { Outlet } from "react-router-dom";
function AdminLayout() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="h-screen bg-slate-100 overflow-hidden">

      <Sidebar open={open} setOpen={setOpen} />

      {/* Right Side */}
      <div className="lg:ml-72 h-screen flex flex-col">

        <main className="flex-1 overflow-y-auto">
          <div>
              <Outlet context={{ setOpen }} />
          </div>
        </main>

      </div>

    </div>
  );
}

export default AdminLayout;