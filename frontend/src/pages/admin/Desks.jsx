import {
  Building2,
  UserCheck,
  Clock3,
  Gauge,
  Sun,
  Moon,
  Plus,
} from "lucide-react";
import DeskReportCard from "../../components/desk/DeskReportCard";
import DeskManageCard from "../../components/desk/DeskManageCard";
import AdminLayout from "../../layouts/AdminLayout";
import { useState, useEffect } from "react";
import AddDeskModal from "../../components/desk/AddDeskModal";
import DeskQRModal from "../../components/desk/DeskQRModal";
// import { createDesk } from "../../services/deskService";
import {
  getDesks,
  getDashboardData,
  createDesk,
  updateDesk,
  deleteDesk,
} from "../../services/deskService";

const LIGHT = {
  bg: "#F2F8F7",
  panel: "#FFFFFF",
  panel2: "#F6FBFA",
  hairline: "#E1EFEC",
  hairlineSoft: "#EDF6F4",
  text: "#12302C",
  muted: "#5E7D79",
  mutedSoft: "#93B0AC",
  brass: "#0D9488",
  brassSoft: "#0D94881A",
  rose: "#F43F5E",
  roseSoft: "#F43F5E1A",
  green: "#10B981",
  greenSoft: "#10B9811A",
  amber: "#D97706",
  amberSoft: "#D977061A",
  cardShadow: "0 1px 2px rgba(18,48,44,0.04)",
};

const DARK = {
  bg: "#07211D",
  panel: "#0E322D",
  panel2: "#0B2824",
  hairline: "#1D5148",
  hairlineSoft: "#153E37",
  text: "#EAF7F3",
  muted: "#8FC7BC",
  mutedSoft: "#5C978B",
  brass: "#0D9488",
  brassSoft: "#0D948826",
  rose: "#F97362",
  roseSoft: "#F9736226",
  green: "#4ADE9A",
  greenSoft: "#4ADE9A26",
  amber: "#F0B860",
  amberSoft: "#F0B86026",
  cardShadow: "0 1px 2px rgba(0,0,0,0.3)",
};

export default function DesksOverview() {
  const [dark, setDark] = useState(false);
  const [activeTab, setActiveTab] = useState("reports");
  const [desks, setDesks] = useState([]);
  const [report, setReport] = useState({
    summary: {},
    deskReports: [],
  });
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(false);
  const [showAddDesk, setShowAddDesk] = useState(false);
  const handleCreateDesk = async (data) => {
    try {
      await createDesk(data);

      setShowAddDesk(false);

      setRefresh((prev) => !prev);
    } catch (err) {
      console.error(err);
    }
  };

  const C = dark ? DARK : LIGHT;

  const fetchData = async () => {
    try {
      setLoading(true);

      const [deskRes, dashboardRes] = await Promise.all([
        getDesks(),
        getDashboardData(),
      ]);
      const dashboardData = dashboardRes.data.data;

      setDesks(deskRes.data.data || []);

      setReport({
        summary: dashboardData.summary || {},

        deskReports: dashboardData.deskReports || [],
      });

      // console.log(
      //     "Dashboard Report:",
      //     dashboardData
      // );
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  const [selectedDesk, setSelectedDesk] = useState(null);
  const [showQR, setShowQR] = useState(false);

  const handleShowQR = (desk) => {
    setSelectedDesk(desk);
    setShowQR(true);
  };
  useEffect(() => {
    fetchData();
  }, [refresh]);

  const [editingDesk, setEditingDesk] = useState(null);
  const [showEditDesk, setShowEditDesk] = useState(false);

  const handleEditDesk = (desk) => {
    setEditingDesk(desk);
    setShowEditDesk(true);
  };

  const handleUpdateDesk = async (data) => {
    try {
      await updateDesk(editingDesk.id, data);

      setShowEditDesk(false);
      setEditingDesk(null);
      setRefresh((p) => !p);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteDesk = async (desk) => {
    if (!window.confirm(`Delete "${desk.desk_name}"?`)) return;

    try {
      await deleteDesk(desk.id);
      setRefresh((p) => !p);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (

        <div className="flex justify-center items-center h-[70vh]">
          Loading...
        </div>

    );
  }

  return (
<>
      <div
        style={{
          background: C.bg,
          minHeight: "100vh",
          transition: "background 0.25s ease",
          padding:"40px"
        }}
      >
        <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Open+Sans:opsz,wght@9..144,400;9..144,600;9..144,700&family=Open+Sans:wght@400;500;600&display=swap');
        * { font-family: 'Open Sans', sans-serif; }
      `}</style>

        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <p
                className="text-xs font-semibold tracking-[0.2em] uppercase"
                style={{ color: C.brass }}
              >
                Admission Operations
              </p>

              <h1
                className="text-4xl md:text-5xl font-semibold mt-2"
                style={{
                  color: C.text,
                  fontFamily: "'Open Sans', sans-serif",
                }}
              >
                Desk Overview
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setDark((d) => !d)}
                className="w-11 h-11 rounded-xl flex items-center justify-center transition"
                style={{
                  background: C.panel,
                  border: `1px solid ${C.hairline}`,
                  color: C.brass,
                  boxShadow: C.cardShadow,
                }}
                title={dark ? "Switch to light mode" : "Switch to dark mode"}
              >
                {dark ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <button
                onClick={() => setShowAddDesk(true)}
                className="h-11 px-5 rounded-xl flex items-center gap-2 font-semibold text-white transition"
                style={{ background: C.brass }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#0F766E")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = C.brass)
                }
              >
                <Plus size={18} />
                Add Desk
              </button>
            </div>
          </div>

          {/* Report cards */}
          {/* Tabs */}
          <div className="mt-8">
            <div
              className="inline-flex rounded-2xl p-1"
              style={{
                background: C.panel,
                border: `1px solid ${C.hairline}`,
                boxShadow: C.cardShadow,
              }}
            >
              <button
                onClick={() => setActiveTab("reports")}
                className="px-6 py-3 rounded-xl font-medium transition-all"
                style={{
                  background: activeTab === "reports" ? C.brass : "transparent",
                  color: activeTab === "reports" ? "#fff" : C.muted,
                }}
              >
                Desk Reports ({report?.deskReports?.length ?? 0})
              </button>

              <button
                onClick={() => setActiveTab("manage")}
                className="px-6 py-3 rounded-xl font-medium transition-all"
                style={{
                  background: activeTab === "manage" ? C.brass : "transparent",
                  color: activeTab === "manage" ? "#fff" : C.muted,
                }}
              >
                Manage Desks ({desks.length})
              </button>
            </div>
          </div>

          {/* Tab Content */}

          <div className="mt-6">
            {activeTab === "reports" && (
              <>
                <h2
                  className="text-lg font-semibold mb-4"
                  style={{ color: C.text }}
                >
                  Live Desk Reports
                </h2>

                <div className="grid xl:grid-cols-3 md:grid-cols-2 gap-5">
                  {report?.deskReports?.map((desk) => (
                    <DeskReportCard
                      key={desk.id}
                      desk={desk}
                      expectedStudents={report.summary.expectedStudents}
                      C={C}
                    />
                  ))}
                </div>
              </>
            )}

            {activeTab === "manage" && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2
                    className="text-lg font-semibold"
                    style={{ color: C.text }}
                  >
                    Manage Desks
                  </h2>

                  <p className="text-sm" style={{ color: C.mutedSoft }}>
                    {desks.length} desks configured
                  </p>
                </div>

                <DeskManageCard
                  desks={desks}
                  C={C}
                  onQR={handleShowQR}
                  onEdit={handleEditDesk}
                  onDelete={handleDeleteDesk}
                />
              </>
            )}
          </div>
        </div>
      </div>

      <AddDeskModal
        open={showAddDesk}
        onClose={() => setShowAddDesk(false)}
        onSubmit={handleCreateDesk}
      />

      {/* Edit Desk */}
      <AddDeskModal
        open={showEditDesk}
        onClose={() => {
          setShowEditDesk(false);
          setEditingDesk(null);
        }}
        onSubmit={handleUpdateDesk}
        desk={editingDesk}
        isEdit
      />

      <DeskQRModal
        open={showQR}
        desk={selectedDesk}
        onClose={() => setShowQR(false)}
      />
 </>
  );
}
