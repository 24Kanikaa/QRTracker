import { useState } from "react";

import Sidebar from "../components/layout/Sidebar";
import Header from "../components/layout/Header";

function AdminLayout({ children }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="h-screen bg-slate-100 overflow-hidden">

      <Sidebar open={open} setOpen={setOpen} />

      {/* Right Side */}
      <div className="lg:ml-72 h-screen flex flex-col">

        <Header setOpen={setOpen} />

        <main className="flex-1 overflow-y-auto">
          <div className="p-8 pb-20">
            {children}
          </div>
        </main>

      </div>

    </div>
  );
}

export default AdminLayout;