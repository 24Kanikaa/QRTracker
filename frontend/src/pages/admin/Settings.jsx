import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
  Users,
  UserPlus,
  UserCheck,
  UserX,
  Pencil,
  Trash2,
  Calendar,
  CalendarPlus,
  Power,
  PowerOff,
  History,
  Search,
  Sun,
  Moon,
  Menu,
  X,
  Plus,
  Mail,
  AlertTriangle,
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle2,
} from "lucide-react";
import { RefreshCw } from "lucide-react";
import Swal from "sweetalert2";
import {
  getUsers,
  createUser as apiCreateUser,
  updateUser as apiUpdateUser,
  deleteUser as apiDeleteUser,
  toggleUserStatus as apiToggleUserStatus,
  syncStudents,
  downloadStudentsCSV ,
  importStudentsCSV
} from "../../services/settingServices";
import {
  getOnboardingSettings as apiGetOnboardingSettings,
  createOnboarding as apiCreateOnboarding,
  updateOnboarding as apiUpdateOnboarding,
  deleteOnboarding as apiDeleteOnboarding,
  toggleOnboardingStatus as apiToggleOnboardingStatus,
} from "../../services/settingServices";
import { useTheme } from "../../context/ThemeContext";

const ROLES = ["user", "Admin"];

/* ============================================================
   SEED DATA — logs stay local until a logs endpoint exists.
   ============================================================ */

const seedLogs = [
  { id: 1, timestamp: new Date("2026-07-01T09:12:00"), actor: "Aditi Rao", action: "Created", entityType: "Onboarding", entityLabel: "2026", details: "Set up onboarding cycle for 2026" },
  { id: 2, timestamp: new Date("2026-07-02T14:03:00"), actor: "Aditi Rao", action: "Created", entityType: "User", entityLabel: "Karan Mehta", details: "Role: Coordinator" },
  { id: 3, timestamp: new Date("2026-07-05T11:47:00"), actor: "Karan Mehta", action: "Deactivated", entityType: "User", entityLabel: "Priya Nair", details: "Marked inactive" },
];

/* ============================================================
   SMALL HELPERS
   ============================================================ */

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function formatDateTime(value) {
  const d = new Date(value);
  return d.toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function nextId(list) {
  return list.reduce((max, item) => Math.max(max, item.id), 0) + 1;
}

function normalizeUser(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    active: Boolean(row.active),
  };
}

// `admission_dates` comes back already parsed to an array by getOnboardingSettings()
// on the backend (JSON.parse(row.admission_dates || "[]")), so we just normalize names.
function normalizeOnboarding(row) {
  return {
    id: row.id,
    year: String(row.admission_year),
    expectedDates: Array.isArray(row.admission_dates) ? row.admission_dates : [],
    active: Boolean(row.active),
    createdByName: row.created_by_name || null,
    updatedByName: row.updated_by_name || null,
    createdAt: row.created_at || null,
  };
}


const downloadStudentCSV = async () => {
  try {
    const { data, headers } = await downloadStudentsCSV();

    const blob = new Blob([data], { type: "text/csv" });

    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;

    const disposition = headers["content-disposition"];
    const match = disposition?.match(/filename="?(.+?)"?$/);

    link.download = match?.[1] || "students.csv";

    document.body.appendChild(link);
    link.click();

    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error(err);
    alert("Failed to download student CSV.");
  }
};

/* ============================================================
   SHARED UI PIECES
   ============================================================ */

function Badge({ label, color, bg }) {
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap" style={{ color, background: bg }}>
      {label}
    </span>
  );
}

function IconButton({ icon, title, onClick, color, hoverBg, C }) {
  const Icon = icon;
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
      style={{ color: color || C.muted }}
      onMouseEnter={(e) => (e.currentTarget.style.background = hoverBg || C.panel2)}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <Icon size={15} />
    </button>
  );
}

function ConfirmDelete({ onConfirm, onCancel, C, label }) {
  return (
    <div className="flex items-center justify-end gap-2">
      <span className="text-xs font-medium flex items-center gap-1" style={{ color: C.rose }}>
        <AlertTriangle size={13} /> Delete {label}?
      </span>
      <button onClick={onConfirm} className="px-2.5 py-1 rounded-lg text-xs font-semibold text-white" style={{ background: C.rose }}>
        Delete
      </button>
      <button onClick={onCancel} className="px-2.5 py-1 rounded-lg text-xs font-semibold" style={{ color: C.muted, background: C.panel2 }}>
        Cancel
      </button>
    </div>
  );
}

function Switch({ checked, onChange, C }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0"
      style={{ background: checked ? C.brass : C.hairline }}
    >
      <span
        className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
        style={{ transform: checked ? "translateX(22px)" : "translateX(4px)" }}
      />
    </button>
  );
}

export function Modal({ title, onClose, children, C, width = 440 }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(7,33,29,0.45)" }}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="rounded-2xl w-full overflow-hidden flex flex-col"
        style={{ maxWidth: width, maxHeight: "88vh", background: C.panel, border: `1px solid ${C.hairline}`, boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }}
      >
        <div className="flex items-center justify-between px-5 py-4 shrink-0" style={{ borderBottom: `1px solid ${C.hairline}` }}>
          <h3 className="font-semibold text-base" style={{ color: C.text }}>{title}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ color: C.muted }}>
            <X size={16} />
          </button>
        </div>
        <div className="p-5 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

function FieldLabel({ children, C }) {
  return <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: C.muted }}>{children}</label>;
}

function TextInput(props) {
  const { C, ...rest } = props;
  return (
    <input
      {...rest}
      className="w-full h-10 px-3 rounded-lg text-sm outline-none transition"
      style={{ background: C.panel2, border: `1px solid ${C.hairline}`, color: C.text }}
    />
  );
}

function Select({ C, children, ...rest }) {
  return (
    <select
      {...rest}
      className="w-full h-10 px-3 rounded-lg text-sm outline-none transition appearance-none"
      style={{ background: C.panel2, border: `1px solid ${C.hairline}`, color: C.text }}
    >
      {children}
    </select>
  );
}

export function PrimaryButton({ children, onClick, C, type = "button" }) {
  return (
    <button type={type} onClick={onClick} className="h-10 px-4 rounded-lg text-sm font-semibold text-white" style={{ background: C.brass }}>
      {children}
    </button>
  );
}

export function GhostButton({ children, onClick, C }) {
  return (
    <button type="button" onClick={onClick} className="h-10 px-4 rounded-lg text-sm font-medium" style={{ color: C.muted, background: C.panel2 }}>
      {children}
    </button>
  );
}

/* ============================================================
   USER FORM (create + edit share this)
   ============================================================ */

function UserFormModal({ initial, onClose, onSave, C, saving }) {
  const [form, setForm] = useState(
    initial
      ? { ...initial, password: "" }
      : {
          name: "",
          email: "",
          role: ROLES[0],
          active: true,
          password: "",
        }
  );

  const [errors, setErrors] = useState({});

  const isEdit = Boolean(initial);

  const validateForm = () => {
    const newErrors = {};

    if (!form.name.trim()) {
      newErrors.name = "Name is required.";
    }

    if (!form.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!isEdit && !form.password.trim()) {
      newErrors.password = "Password is required.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (saving) return;

    if (validateForm()) {
      onSave({
        ...form,
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
      });
    }
  };
  

  return (
    <Modal
      title={isEdit ? "Edit user" : "Create user"}
      onClose={onClose}
      C={C}
    >
      <div className="space-y-4">

        {/* Name */}
        <div>
          <FieldLabel C={C}>Name</FieldLabel>

          <TextInput
            C={C}
            value={form.name}
            required
            onChange={(e) => {
              setForm((f) => ({
                ...f,
                name: e.target.value,
              }));

              if (errors.name) {
                setErrors((prev) => ({
                  ...prev,
                  name: "",
                }));
              }
            }}
            placeholder="Full name"
          />

          {errors.name && (
            <p className="text-xs mt-1" style={{ color: C.rose }}>
              {errors.name}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <FieldLabel C={C}>Email</FieldLabel>

          <TextInput
            C={C}
            type="email"
            required
            value={form.email}
            onChange={(e) => {
              setForm((f) => ({
                ...f,
                email: e.target.value,
              }));

              if (errors.email) {
                setErrors((prev) => ({
                  ...prev,
                  email: "",
                }));
              }
            }}
            placeholder="Plaksha Email"
          />

          {errors.email && (
            <p className="text-xs mt-1" style={{ color: C.rose }}>
              {errors.email}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <FieldLabel C={C}>
            {isEdit ? "New password (optional)" : "Password"}
          </FieldLabel>

          <TextInput
            C={C}
            type="password"
            required={!isEdit}
            value={form.password}
            onChange={(e) => {
              setForm((f) => ({
                ...f,
                password: e.target.value,
              }));

              if (errors.password) {
                setErrors((prev) => ({
                  ...prev,
                  password: "",
                }));
              }
            }}
            placeholder={
              isEdit
                ? "Leave blank to keep current password"
                : "Set a password"
            }
            autoComplete="new-password"
          />

          {errors.password && (
            <p className="text-xs mt-1" style={{ color: C.rose }}>
              {errors.password}
            </p>
          )}
        </div>

        {/* Role */}
        <div>
          <FieldLabel C={C}>Role</FieldLabel>

          <Select
            C={C}
            value={form.role}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                role: e.target.value,
              }))
            }
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </Select>
        </div>

        {/* Active */}
        {!isEdit && (
          <div className="flex items-center justify-between pt-1">
            <FieldLabel C={C}>Active</FieldLabel>

            <Switch
              checked={form.active}
              onChange={(v) =>
                setForm((f) => ({
                  ...f,
                  active: v,
                }))
              }
              C={C}
            />
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2 mt-6">
        <GhostButton onClick={onClose} C={C}>
          Cancel
        </GhostButton>

        <PrimaryButton
          C={C}
          onClick={handleSave}
          disabled={saving}
        >
          {saving
            ? "Saving..."
            : isEdit
              ? "Save changes"
              : "Create user"}
        </PrimaryButton>
      </div>
    </Modal>
  );
}

/* ============================================================
   STUDENT CSV IMPORT PANEL — used inside the onboarding form
   ============================================================ */

function StudentImportPanel({settingsId, students, onStudents, C }) {
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState(null);
  const [parsing, setParsing] = useState(false);

  const validCount = students.filter((s) => s._errors.length === 0).length;
  const invalidCount = students.length - validCount;

const handleFile = async (e) => {
  const file = e.target.files?.[0];
  e.target.value = ""; 

  if (!file) return;

  setParsing(true);
  setError(null);
  setFileName(file.name);

  try {
    const formData = new FormData();
    formData.append("file", file);

    const { data } = await importStudentsCSV(settingsId,formData);
    Swal.fire({
      icon: "success",
      title: "Upload Completed",
      html: `
        <div style="text-align:left">
          <p><strong>Updated:</strong> ${data.updated}</p>
          <p><strong>Skipped:</strong> ${data.skipped}</p>
        </div>
      `,
      confirmButtonText: "OK",
      confirmButtonColor: "#0f766e",
    });

    setFileName("");
  } catch (err) {
    console.error(err);

    setError(
      err.response?.data?.message ||
      "Failed to upload student CSV."
    );

    setFileName("");
  } finally {
    setParsing(false);
  }
};

  const clear = () => {
    setFileName("");
    setError(null);
    onStudents([]);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <FieldLabel C={C}>Student list (CSV)</FieldLabel>
        <button type="button" onClick={downloadStudentCSV} className="flex items-center gap-1 text-xs font-semibold" style={{ color: C.brass }}>
          <Download size={12} /> Download student CSV
        </button>
      </div>

      <p className="text-xs mb-2" style={{ color: C.mutedSoft }}>
       Use the csv to upload the expected date data. Make sure format is correct.
      </p>
      {/* {lastUploadedAt && (
      <p
          className="text-xs mt-2 mb-2"
          style={{ color: C.mutedSoft }}
      >
              Last imported:{" "}
              {new Date(lastUploadedAt).toLocaleString("en-IN", {
                  dateStyle: "medium",
                  timeStyle: "short",
              })}
          </p>
      )} */}

      <label
        className="flex items-center justify-center gap-2 h-11 rounded-lg text-sm font-medium cursor-pointer transition"
        style={{ background: C.panel2, border: `1px dashed ${C.hairline}`, color: C.muted }}
      >
        <Upload size={15} />
        {parsing ? "Reading file..." : fileName ? "Choose a different CSV" : "Upload students CSV"}
        <input type="file" accept=".csv,text/csv" className="hidden" onChange={handleFile} />
      </label>

      {error && (
        <p className="text-xs mt-2 flex items-center gap-1" style={{ color: C.rose }}>
          <AlertTriangle size={12} /> {error}
        </p>
      )}

      {students.length > 0 && (
        <div className="mt-3 rounded-lg overflow-hidden" style={{ border: `1px solid ${C.hairline}` }}>
          <div className="flex items-center justify-between px-3 py-2" style={{ background: C.panel2 }}>
            <span className="text-xs flex items-center gap-1.5" style={{ color: C.text }}>
              <FileSpreadsheet size={13} /> {fileName || "Uploaded file"}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold flex items-center gap-1" style={{ color: C.green }}>
                <CheckCircle2 size={12} /> {validCount} ready
              </span>
              {invalidCount > 0 && (
                <span className="text-xs font-semibold flex items-center gap-1" style={{ color: C.rose }}>
                  <AlertTriangle size={12} /> {invalidCount} with errors
                </span>
              )}
              <button type="button" onClick={clear} className="text-xs font-medium" style={{ color: C.muted }}>
                Clear
              </button>
            </div>
          </div>

          <div className="max-h-48 overflow-y-auto">
            <table className="w-full text-xs">
              <thead>
                <tr style={{ background: C.panel }}>
                  <th className="px-3 py-2 text-left" style={{ color: C.mutedSoft }}>Roll no.</th>
                  <th className="px-3 py-2 text-left" style={{ color: C.mutedSoft }}>Name</th>
                  <th className="px-3 py-2 text-left" style={{ color: C.mutedSoft }}>Email</th>
                  <th className="px-3 py-2 text-left" style={{ color: C.mutedSoft }}>Expected date</th>
                  <th className="px-3 py-2 text-left" style={{ color: C.mutedSoft }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {students.slice(0, 25).map((s, i) => (
                  <tr key={i} style={{ borderTop: `1px solid ${C.hairlineSoft}` }}>
                    <td className="px-3 py-2" style={{ color: C.text }}>{s.roll_number || "—"}</td>
                    <td className="px-3 py-2" style={{ color: C.text }}>{[s.first_name, s.last_name].filter(Boolean).join(" ") || "—"}</td>
                    <td className="px-3 py-2" style={{ color: C.muted }}>{s.email || "—"}</td>
                    <td className="px-3 py-2" style={{ color: C.muted }}>{s.expected_date || "—"}</td>
                    <td className="px-3 py-2">
                      {s._errors.length === 0 ? (
                        <span style={{ color: C.green }}>Ready</span>
                      ) : (
                        <span title={s._errors.join(", ")} style={{ color: C.rose }}>{s._errors[0]}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {students.length > 25 && (
              <p className="text-xs px-3 py-2" style={{ color: C.mutedSoft }}>+ {students.length - 25} more row(s) not shown</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   ONBOARDING FORM (create + edit share this)
   Backed by settings.admission_year / admission_dates / active
   ============================================================ */

function OnboardingFormModal({ initial, onClose, onSave, C, saving }) {
  const [form, setForm] = useState(
    initial
      ? { year: initial.year, expectedDates: [...initial.expectedDates], active: initial.active }
      : { year: "", expectedDates: [""], active: true }
  );
  const [students, setStudents] = useState([]);
  const isEdit = Boolean(initial);
  const valid = form.year.trim();

  const updateDate = (i, value) =>
    setForm((f) => ({ ...f, expectedDates: f.expectedDates.map((d, idx) => (idx === i ? value : d)) }));
  const addDate = () => setForm((f) => ({ ...f, expectedDates: [...f.expectedDates, ""] }));
  const removeDate = (i) => setForm((f) => ({ ...f, expectedDates: f.expectedDates.filter((_, idx) => idx !== i) }));

  return (
    <Modal title={isEdit ? "Edit onboarding" : "Add onboarding"} onClose={onClose} C={C} width={560}>
      <div className="space-y-4">
        <div>
          <FieldLabel C={C}>Year</FieldLabel>
          <TextInput C={C} value={form.year} onChange={(e) => setForm((f) => ({ ...f, year: e.target.value }))} placeholder="e.g. 2026" />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <FieldLabel C={C}>Expected dates</FieldLabel>
            <button type="button" onClick={addDate} className="flex items-center gap-1 text-xs font-semibold" style={{ color: C.brass }}>
              <Plus size={12} /> Add date
            </button>
          </div>
          <div className="space-y-2">
            {form.expectedDates.length === 0 && (
              <p className="text-xs" style={{ color: C.mutedSoft }}>No dates yet — add at least one.</p>
            )}
            {form.expectedDates.map((d, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="date"
                  value={d}
                  onChange={(e) => updateDate(i, e.target.value)}
                  className="flex-1 h-10 px-3 rounded-lg text-sm outline-none"
                  style={{ background: C.panel2, border: `1px solid ${C.hairline}`, color: C.text }}
                />
                <button type="button" onClick={() => removeDate(i)} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ color: C.rose }}>
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <FieldLabel C={C}>Active</FieldLabel>
          <Switch checked={form.active} onChange={(v) => setForm((f) => ({ ...f, active: v }))} C={C} />
        </div>

        <div className="pt-2" style={{ borderTop: `1px solid ${C.hairlineSoft}` }}>
          <div className="pt-4">
            <StudentImportPanel settingsId={initial?.id}  students={students} onStudents={setStudents} C={C} />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-6">
        <GhostButton onClick={onClose} C={C}>Cancel</GhostButton>
        <PrimaryButton
          C={C}
          onClick={() =>
            valid &&
            !saving &&
            onSave({
              ...form,
              expectedDates: form.expectedDates.filter(Boolean),
              students: students.filter((s) => s._errors.length === 0),
              studentImportSummary: students.length
                ? { total: students.length, valid: students.filter((s) => s._errors.length === 0).length }
                : null,
            })
          }
        >
          {saving ? "Saving..." : isEdit ? "Save changes" : "Add onboarding"}
        </PrimaryButton>
      </div>
    </Modal>
  );
}

/* ============================================================
   PAGE
   ============================================================ */

export default function Settings() {
  const { dark, toggleDark, C } = useTheme();
  const { setOpen: setSidebarOpen } = useOutletContext();

  const [tab, setTab] = useState("users");

  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState(null);

  const [onboardings, setOnboardings] = useState([]);
  const [onboardingsLoading, setOnboardingsLoading] = useState(true);
  const [onboardingsError, setOnboardingsError] = useState(null);

  const [logs, setLogs] = useState(seedLogs);

  const [userSearch, setUserSearch] = useState("");
  const [onboardingSearch, setOnboardingSearch] = useState("");
  const [logSearch, setLogSearch] = useState("");

  const [userModal, setUserModal] = useState(null); // null | "new" | user object
  const [onboardingModal, setOnboardingModal] = useState(null); // null | "new" | onboarding object
  const [savingUser, setSavingUser] = useState(false);
  const [savingOnboarding, setSavingOnboarding] = useState(false);

  const [confirmDeleteUser, setConfirmDeleteUser] = useState(null);
  const [confirmDeleteOnboarding, setConfirmDeleteOnboarding] = useState(null);
  

  const addLog = (entry) => {
    setLogs((prev) => [{ id: nextId(prev), timestamp: new Date(), actor: "You", ...entry }, ...prev]);
  };

  const loadUsers = async () => {
    try {
      setUsersLoading(true);
      setUsersError(null);
      const res = await getUsers();
      const rows = res.data.data;
      setUsers(rows.map(normalizeUser));
    } catch (err) {
      console.error(err);
      setUsersError("Couldn't load users. Please try again.");
    } finally {
      setUsersLoading(false);
    }
  };

  const loadOnboardings = async () => {
    try {
      setOnboardingsLoading(true);
      setOnboardingsError(null);
      const res = await apiGetOnboardingSettings();
      const rows = res.data.data;
      setOnboardings(rows.map(normalizeOnboarding));
    } catch (err) {
      console.error(err);
      setOnboardingsError("Couldn't load onboarding cycles. Please try again.");
    } finally {
      setOnboardingsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
    loadOnboardings();
  }, []);

const handleSyncStudents = async (onboarding) => {
  const result = await Swal.fire({
    icon: "question",
    title: "Sync Students?",
    text: `This will sync the latest students for the 2026 onboarding year.`,
    showCancelButton: true,
    confirmButtonText: "Yes, Sync Students",
    cancelButtonText: "Cancel",
    confirmButtonColor: "#0f766e",
    cancelButtonColor: "#64748b",
  });

  if (!result.isConfirmed) {
    return;
  }

  try {
    const { data } = await syncStudents(onboarding.id);

    Swal.fire({
      icon: "success",
      title: "Sync Complete",
      html: `
        <b>${data.inserted}</b> students added<br>
        <b>${data.updated}</b> students updated
      `,
      confirmButtonColor: "#0f766e",
    });

    loadOnboardings();

  } catch (err) {
    Swal.fire({
      icon: "error",
      title: "Sync Failed",
      text:
        err.response?.data?.message ||
        "Failed to sync students.",
      confirmButtonColor: "#0f766e",
    });
  }
};

  /* ---------- user actions (backed by /settings/users) ---------- */

const saveUser = async (form) => {
  setSavingUser(true);

  try {
    if (userModal === "new") {
      const payload = {
        name: form.name,
        email: form.email,
        role: form.role,
        active: form.active,
        password: form.password,
      };

      const res = await apiCreateUser(payload);

      const created = normalizeUser(res.data.data);

      setUsers((prev) => [created, ...prev]);

      addLog({
        action: "Created",
        entityType: "User",
        entityLabel: created.name,
        details: `Role: ${created.role}`,
      });

    } else {
      const payload = {
        name: form.name,
        email: form.email,
        role: form.role,
      };

      if (form.password.trim()) {
        payload.password = form.password;
      }

      await apiUpdateUser(userModal.id, payload);

      setUsers((prev) =>
        prev.map((u) =>
          u.id === userModal.id
            ? {
                ...u,
                name: form.name,
                email: form.email,
                role: form.role,
              }
            : u
        )
      );

      addLog({
        action: "Updated",
        entityType: "User",
        entityLabel: form.name,
        details: `Role: ${form.role}`,
      });
    }

    setUserModal(null);

  } catch (err) {
    console.error(err);

    // Show backend error message
    const message =
      err.response?.data?.message ||
      "Couldn't save that user. Please try again.";

    setUsersError(message);

  } finally {
    setSavingUser(false);
  }
};

  const deleteUser = async (user) => {
    try {
      await apiDeleteUser(user.id);
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      addLog({ action: "Deleted", entityType: "User", entityLabel: user.name, details: "Removed from system" });
    } catch (err) {
      console.error(err);
      setUsersError("Couldn't delete that user. Please try again.");
    } finally {
      setConfirmDeleteUser(null);
    }
  };

  const toggleUserActive = async (user) => {
    try {
      const active = !user.active;
      await apiToggleUserStatus(user.id,active);
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, active: !u.active } : u)));
      addLog({ action: user.active ? "Deactivated" : "Activated", entityType: "User", entityLabel: user.name, details: user.active ? "Marked inactive" : "Marked active" });
    } catch (err) {
      console.error(err);
      setUsersError("Couldn't update that user's status. Please try again.");
    }
  };



  const importStudentsForOnboarding = async (onboardingId, students) => {
    return Promise.resolve({ imported: students.length });
  };

  const saveOnboarding = async (form) => {
    setSavingOnboarding(true);
    const { students, studentImportSummary, year, expectedDates, active } = form;
    const payload = { admission_year: year, admission_dates: expectedDates, active };

    try {
      let onboardingId;
      if (onboardingModal === "new") {
        const res = await apiCreateOnboarding(payload);
        onboardingId = res.data.data?.id ?? res.data.data;
        addLog({ action: "Created", entityType: "Onboarding", entityLabel: year, details: `${expectedDates.length} date(s), ${active ? "active" : "inactive"}` });
      } else {
        onboardingId = onboardingModal.id;
        await apiUpdateOnboarding(onboardingId, payload);
        addLog({ action: "Updated", entityType: "Onboarding", entityLabel: year, details: `${expectedDates.length} date(s), ${active ? "active" : "inactive"}` });
      }

      if (students && students.length > 0) {
        await importStudentsForOnboarding(onboardingId, students);
        addLog({
          action: "Created",
          entityType: "Students",
          entityLabel: year,
          details: `Imported ${students.length} of ${studentImportSummary?.total ?? students.length} students from CSV`,
        });
      }

      await loadOnboardings();
      setOnboardingModal(null);
    } catch (err) {
      console.error(err);
      setOnboardingsError(err?.response?.data?.message || "Couldn't save that onboarding cycle. Please try again.");
    } finally {
      setSavingOnboarding(false);
    }
  };

  const deleteOnboarding = async (onboarding) => {
    try {
      await apiDeleteOnboarding(onboarding.id);
      setOnboardings((prev) => prev.filter((o) => o.id !== onboarding.id));
      addLog({ action: "Deleted", entityType: "Onboarding", entityLabel: onboarding.year, details: "Removed from system" });
    } catch (err) {
      console.error(err);
      setOnboardingsError("Couldn't delete that onboarding cycle. Please try again.");
    } finally {
      setConfirmDeleteOnboarding(null);
    }
  };

  const toggleOnboardingActive = async (onboarding) => {
    try {
      await apiToggleOnboardingStatus(onboarding.id);
      setOnboardings((prev) => prev.map((o) => (o.id === onboarding.id ? { ...o, active: !o.active } : o)));
      addLog({
        action: onboarding.active ? "Deactivated" : "Activated",
        entityType: "Onboarding",
        entityLabel: onboarding.year,
        details: onboarding.active ? "Marked inactive" : "Marked active",
      });
    } catch (err) {
      console.error(err);
      setOnboardingsError("Couldn't update that onboarding cycle's status. Please try again.");
    }
  };

  /* ---------- filtered lists ---------- */

  const visibleUsers = useMemo(() => {
    const q = userSearch.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  }, [users, userSearch]);

  const visibleOnboardings = useMemo(() => {
    const q = onboardingSearch.trim().toLowerCase();
    if (!q) return onboardings;
    return onboardings.filter(
      (o) => o.year.toLowerCase().includes(q) || (o.active ? "active" : "inactive").includes(q)
    );
  }, [onboardings, onboardingSearch]);

  const visibleLogs = useMemo(() => {
    const q = logSearch.trim().toLowerCase();
    if (!q) return logs;
    return logs.filter(
      (l) =>
        l.actor.toLowerCase().includes(q) ||
        l.action.toLowerCase().includes(q) ||
        l.entityType.toLowerCase().includes(q) ||
        String(l.entityLabel).toLowerCase().includes(q)
    );
  }, [logs, logSearch]);
   
  
  const tabs = [
      
      { key: "users", label: "Users", icon: Users },{ key: "onboarding", label: "Onboarding Details", icon: Calendar },
      // { key: "logs", label: "Logs", icon: History },
  ];

  const roleBadge = { Admin: C.rose, Coordinator: C.brass, "Desk Operator": C.amber, Viewer: C.mutedSoft };
  const roleBadgeSoft = { Admin: C.roseSoft, Coordinator: C.brassSoft, "Desk Operator": C.amberSoft, Viewer: C.hairlineSoft };
  const actionBadge = {
    Created: [C.green, C.greenSoft],
    Updated: [C.brass, C.brassSoft],
    Deleted: [C.rose, C.roseSoft],
    Activated: [C.green, C.greenSoft],
    Deactivated: [C.rose, C.roseSoft],
  };

  return (
    <div style={{ background: C.bg, minHeight: "100%" }} className="transition-colors duration-300 p-6 md:p-10">
      <div className="mx-auto">
        {/* header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 lg:hidden"
              style={{ background: C.panel, border: `1px solid ${C.hairline}`, color: C.text, boxShadow: C.cardShadow }}
            >
              <Menu size={18} />
            </button>
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] uppercase" style={{ color: C.brass }}>Administration</p>
              <h1 className="text-4xl md:text-5xl font-semibold mt-2" style={{ color: C.text }}>Settings</h1>
            </div>
          </div>
          <button
            onClick={toggleDark}
            className="w-11 h-11 rounded-xl flex items-center justify-center transition shrink-0"
            style={{ background: C.panel, border: `1px solid ${C.hairline}`, color: C.brass, boxShadow: C.cardShadow }}
          >
            {dark ? <Sun size={17} /> : <Moon size={17} />}
          </button>
        </div>

        {/* tabs */}
        <div className="mb-6">
          <div className="inline-flex flex-wrap rounded-2xl p-1 gap-1" style={{ background: C.panel, border: `1px solid ${C.hairline}`, boxShadow: C.cardShadow }}>
            {tabs.map((t) => {
              const Icon = t.icon;
              const active = tab === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all"
                  style={{ background: active ? C.brass : "transparent", color: active ? "#fff" : C.muted }}
                >
                  <Icon size={14} />
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ============ USERS TAB ============ */}
        {tab === "users" && (
          <div>
            <div className="flex flex-col sm:flex-row gap-3 justify-between mb-4">
              <div className="relative w-full sm:max-w-xs">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: C.muted }} />
                <input
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search users..."
                  className="w-full pl-10 pr-4 h-11 rounded-xl outline-none text-sm"
                  style={{ background: C.panel, border: `1px solid ${C.hairline}`, color: C.text }}
                />
              </div>
              <button
                onClick={() => setUserModal("new")}
                className="h-11 px-4 rounded-xl flex items-center gap-2 text-sm font-medium text-white shrink-0"
                style={{ background: C.brass }}
              >
                <UserPlus size={16} /> Create user
              </button>
            </div>

            {usersError && (
              <div className="rounded-2xl p-4 mb-4 flex items-center justify-between gap-4" style={{ background: C.roseSoft, border: `1px solid ${C.rose}` }}>
                <p className="text-sm font-medium" style={{ color: C.rose }}>{usersError}</p>
                <button onClick={loadUsers} className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white shrink-0" style={{ background: C.rose }}>
                  Retry
                </button>
              </div>
            )}

            {usersLoading && users.length === 0 && !usersError ? (
              <div className="rounded-2xl py-16 text-center" style={{ background: C.panel, border: `1px solid ${C.hairline}` }}>
                <p className="text-sm" style={{ color: C.muted }}>Loading users…</p>
              </div>
            ) : (
              <div className="rounded-2xl overflow-hidden" style={{ background: C.panel, border: `1px solid ${C.hairline}`, boxShadow: C.cardShadow }}>
              <table className="w-full table-auto">
                <thead style={{ borderBottom: `1px solid ${C.hairline}` }}>
                  <tr>
                    <th className="px-5 py-4 text-left text-xs uppercase tracking-wider" style={{ color: C.muted }}>Name</th>
                    <th className="px-5 py-4 text-left text-xs uppercase tracking-wider" style={{ color: C.muted }}>Email</th>
                    <th className="px-5 py-4 text-left text-xs uppercase tracking-wider" style={{ color: C.muted }}>Role</th>
                    <th className="px-5 py-4 text-left text-xs uppercase tracking-wider" style={{ color: C.muted }}>Status</th>
                    <th className="px-5 py-4 text-right text-xs uppercase tracking-wider" style={{ color: C.muted }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleUsers.length === 0 && (
                    <tr><td colSpan={5} className="px-5 py-10 text-center text-sm" style={{ color: C.muted }}>No users match your search.</td></tr>
                  )}
                  {visibleUsers.map((u) => (
                    <tr key={u.id} style={{ borderBottom: `1px solid ${C.hairline}` }}>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full text-white flex items-center justify-center text-xs font-semibold" style={{ background: `linear-gradient(135deg,${C.brass},${C.green})` }}>
                            {u.name.charAt(0)}
                          </div>
                          <span className="text-sm font-medium" style={{ color: C.text }}>{u.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-sm flex items-center gap-1.5" style={{ color: C.muted }}>
                          <Mail size={12} /> {u.email}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge label={u.role} color={roleBadge[u.role] || C.muted} bg={roleBadgeSoft[u.role] || C.hairlineSoft} />
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge label={u.active ? "Active" : "Inactive"} color={u.active ? C.green : C.mutedSoft} bg={u.active ? C.greenSoft : C.hairlineSoft} />
                      </td>
                      <td className="px-5 py-3.5">
                        {confirmDeleteUser === u.id ? (
                          <ConfirmDelete C={C} label={u.name} onConfirm={() => deleteUser(u)} onCancel={() => setConfirmDeleteUser(null)} />
                        ) : (
                          <div className="flex items-center justify-end gap-1">
                            <IconButton C={C} icon={Pencil} title="Edit user" onClick={() => setUserModal(u)} />
                            <IconButton
                              C={C}
                              icon={u.active ? UserX : UserCheck}
                              title={u.active ? "Deactivate" : "Activate"}
                              color={u.active ? C.amber : C.green}
                              onClick={() => toggleUserActive(u)}
                            />
                            <IconButton C={C} icon={Trash2} title="Delete user" color={C.rose} onClick={() => setConfirmDeleteUser(u.id)} />
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            )}
          </div>
        )}

        {/* ============ ONBOARDING TAB ============ */}
        {tab === "onboarding" && (
          <div>
            <div className="flex flex-col sm:flex-row gap-3 justify-between mb-4">
              <div className="relative w-full sm:max-w-xs">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: C.muted }} />
                <input
                  value={onboardingSearch}
                  onChange={(e) => setOnboardingSearch(e.target.value)}
                  placeholder="Search onboarding by year or status..."
                  className="w-full pl-10 pr-4 h-11 rounded-xl outline-none text-sm"
                  style={{ background: C.panel, border: `1px solid ${C.hairline}`, color: C.text }}
                />
              </div>
              <button
                onClick={() => setOnboardingModal("new")}
                className="h-11 px-4 rounded-xl flex items-center gap-2 text-sm font-medium text-white shrink-0"
                style={{ background: C.brass }}
              >
                <CalendarPlus size={16} /> Add onboarding
              </button>
            </div>

            {onboardingsError && (
              <div className="rounded-2xl p-4 mb-4 flex items-center justify-between gap-4" style={{ background: C.roseSoft, border: `1px solid ${C.rose}` }}>
                <p className="text-sm font-medium" style={{ color: C.rose }}>{onboardingsError}</p>
                <button onClick={loadOnboardings} className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white shrink-0" style={{ background: C.rose }}>
                  Retry
                </button>
              </div>
            )}

            {onboardingsLoading && onboardings.length === 0 && !onboardingsError ? (
              <div className="rounded-2xl py-16 text-center" style={{ background: C.panel, border: `1px solid ${C.hairline}` }}>
                <p className="text-sm" style={{ color: C.muted }}>Loading onboarding cycles…</p>
              </div>
            ) : (
              <div className="rounded-2xl overflow-hidden" style={{ background: C.panel, border: `1px solid ${C.hairline}`, boxShadow: C.cardShadow }}>
                <table className="w-full table-auto">
                  <thead style={{ borderBottom: `1px solid ${C.hairline}` }}>
                    <tr>
                      <th className="px-5 py-4 text-left text-xs uppercase tracking-wider" style={{ color: C.muted }}>Year</th>
                      <th className="px-5 py-4 text-left text-xs uppercase tracking-wider" style={{ color: C.muted }}>Expected dates</th>
                      <th className="px-5 py-4 text-left text-xs uppercase tracking-wider" style={{ color: C.muted }}>Status</th>
                      <th className="px-5 py-4 text-left text-xs uppercase tracking-wider" style={{ color: C.muted }}>Last updated by</th>
                      <th className="px-5 py-4 text-right text-xs uppercase tracking-wider" style={{ color: C.muted }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleOnboardings.length === 0 && (
                      <tr><td colSpan={5} className="px-5 py-10 text-center text-sm" style={{ color: C.muted }}>No onboarding cycles match your search.</td></tr>
                    )}
                    {visibleOnboardings.map((o) => (
                      <tr key={o.id} style={{ borderBottom: `1px solid ${C.hairline}`, opacity: o.active ? 1 : 0.6 }}>
                        <td className="px-5 py-3.5">
                          <span className="text-sm font-semibold" style={{ color: C.text}}>{o.year}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          {o.expectedDates.length === 0 ? (
                            <span className="text-xs" style={{ color: C.mutedSoft }}>No dates set</span>
                          ) : (
                            <div className="flex flex-wrap gap-1.5">
                              {o.expectedDates.map((d) => (
                                <span key={d} className="px-2 py-1 rounded-lg text-xs" style={{ background: C.panel2, color: C.muted }}>
                                  {formatDate(d)}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-3.5">
                          <Badge label={o.active ? "Active" : "Inactive"} color={o.active ? C.green : C.mutedSoft} bg={o.active ? C.greenSoft : C.hairlineSoft} />
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="text-xs" style={{ color: C.muted }}>
                            {o.updatedByName || o.createdByName || "—"}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          {confirmDeleteOnboarding === o.id ? (
                            <ConfirmDelete C={C} label={o.year} onConfirm={() => deleteOnboarding(o)} onCancel={() => setConfirmDeleteOnboarding(null)} />
                          ) : (
                            <div className="flex items-center justify-end gap-1">
                             <IconButton
                                C={C}
                                icon={RefreshCw}
                                title="Sync students"
                                color={C.teal}
                                onClick={() => handleSyncStudents(o)}
                              />

                              <IconButton C={C} icon={Pencil} title="Edit onboarding" onClick={() => setOnboardingModal(o)} />
                              <IconButton
                                C={C}
                                icon={o.active ? PowerOff : Power}
                                title={o.active ? "Deactivate" : "Activate"}
                                color={o.active ? C.amber : C.green}
                                onClick={() => toggleOnboardingActive(o)}
                              />
                              <IconButton C={C} icon={Trash2} title="Delete onboarding" color={C.rose} onClick={() => setConfirmDeleteOnboarding(o.id)} />
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ============ LOGS TAB ============ */}
        {tab === "logs" && (
          <div>
            <div className="flex flex-col sm:flex-row gap-3 justify-between mb-4">
              <div className="relative w-full sm:max-w-xs">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: C.muted }} />
                <input
                  value={logSearch}
                  onChange={(e) => setLogSearch(e.target.value)}
                  placeholder="Search logs by actor, action, entity..."
                  className="w-full pl-10 pr-4 h-11 rounded-xl outline-none text-sm"
                  style={{ background: C.panel, border: `1px solid ${C.hairline}`, color: C.text }}
                />
              </div>
              <span className="text-xs self-center" style={{ color: C.mutedSoft }}>{visibleLogs.length} entries</span>
            </div>

            <div className="rounded-2xl overflow-hidden" style={{ background: C.panel, border: `1px solid ${C.hairline}`, boxShadow: C.cardShadow }}>
              <table className="w-full table-auto">
                <thead style={{ borderBottom: `1px solid ${C.hairline}` }}>
                  <tr>
                    <th className="px-5 py-4 text-left text-xs uppercase tracking-wider" style={{ color: C.muted }}>Time</th>
                    <th className="px-5 py-4 text-left text-xs uppercase tracking-wider" style={{ color: C.muted }}>Actor</th>
                    <th className="px-5 py-4 text-left text-xs uppercase tracking-wider" style={{ color: C.muted }}>Action</th>
                    <th className="px-5 py-4 text-left text-xs uppercase tracking-wider" style={{ color: C.muted }}>Entity</th>
                    <th className="px-5 py-4 text-left text-xs uppercase tracking-wider" style={{ color: C.muted }}>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleLogs.length === 0 && (
                    <tr><td colSpan={5} className="px-5 py-10 text-center text-sm" style={{ color: C.muted }}>No activity matches your search.</td></tr>
                  )}
                  {visibleLogs.map((l) => (
                    <tr key={l.id} style={{ borderBottom: `1px solid ${C.hairline}` }}>
                      <td className="px-5 py-3.5 text-sm whitespace-nowrap" style={{ color: C.muted }}>{formatDateTime(l.timestamp)}</td>
                      <td className="px-5 py-3.5 text-sm font-medium" style={{ color: C.text }}>{l.actor}</td>
                      <td className="px-5 py-3.5">
                        <Badge label={l.action} color={(actionBadge[l.action] || [C.muted, C.hairlineSoft])[0]} bg={(actionBadge[l.action] || [C.muted, C.hairlineSoft])[1]} />
                      </td>
                      <td className="px-5 py-3.5 text-sm" style={{ color: C.muted }}>
                        {l.entityType} <span style={{ color: C.text, fontWeight: 600 }}>{l.entityLabel}</span>
                      </td>
                      <td className="px-5 py-3.5 text-sm" style={{ color: C.mutedSoft }}>{l.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* modals */}
      {userModal && (
        <UserFormModal
          C={C}
          initial={userModal === "new" ? null : userModal}
          onClose={() => setUserModal(null)}
          onSave={saveUser}
          saving={savingUser}
        />
      )}
      {onboardingModal && (
        <OnboardingFormModal
          C={C}
          initial={onboardingModal === "new" ? null : onboardingModal}
          onClose={() => setOnboardingModal(null)}
          onSave={saveOnboarding}
          saving={savingOnboarding}
        />
      )}
    </div>
  );
}