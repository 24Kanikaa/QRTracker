import { useState, useEffect } from "react";
import { X, Building2 } from "lucide-react";

const icons = [
  "door-open",
  "building",
  "clipboard",
  "book",
  "monitor",
  "users",
];

function getSlug(name) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, "-");
}

const emptyForm = {
  desk_name: "",
  description: "",
  location: "",
  display_order: 1,
  is_gate: false,
  active: true,
};

export default function AddDeskModal({
  open,
  onClose,
  onSubmit,
  desk = null,
  isEdit = false,
}) {
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (!open) return;

    if (desk) {
      setForm({
        desk_name: desk.desk_name || "",
        description: desk.description || "",
        location: desk.location || "",
        display_order: desk.display_order || 1,
        is_gate: Boolean(desk.is_gate),
        active: Boolean(desk.active),
      });
    } else {
      setForm(emptyForm);
    }
  }, [desk, open]);

  if (!open) return null;

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : type === "number"
          ? Number(value)
          : value,
    }));
  };

  const submit = (e) => {
    e.preventDefault();

    onSubmit({
      ...form,
      qr_slug: getSlug(form.desk_name),
      icon:
        desk?.icon ||
        icons[
          Math.floor(Math.random() * icons.length)
        ],
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-5">

      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">

        {/* Header */}

        <div className="bg-teal-600 px-6 py-5 flex justify-between items-center">

          <div className="flex items-center gap-3">

            <div className="bg-white/20 p-2 rounded-xl">
              <Building2 className="text-white" />
            </div>

            <div>

              <h2 className="text-xl font-semibold text-white">
                {isEdit ? "Edit Desk" : "Create Desk"}
              </h2>

              <p className="text-teal-100 text-sm">
                {isEdit
                  ? "Update desk information"
                  : "Add a new onboarding desk"}
              </p>

            </div>

          </div>

          <button
            onClick={onClose}
            className="text-white hover:bg-white/10 rounded-lg p-2 transition"
          >
            <X />
          </button>

        </div>

        {/* Form */}

        <form
          onSubmit={submit}
          className="p-6 space-y-5"
        >

          <div>

            <label className="block mb-2 text-sm font-medium">
              Desk Name
            </label>

            <input
              required
              name="desk_name"
              value={form.desk_name}
              onChange={handleChange}
              placeholder="Admission Desk"
              className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500 outline-none"
            />

          </div>

          <div>

            <label className="block mb-2 text-sm font-medium">
              Description
            </label>

            <textarea
              rows={3}
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Document verification and fee confirmation."
              className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500 outline-none"
            />

          </div>

          <div>

            <label className="block mb-2 text-sm font-medium">
              Location
            </label>

            <input
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="Admission Hall"
              className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500 outline-none"
            />

          </div>

          <div className="grid grid-cols-2 gap-5">

            <div>

              <label className="block mb-2 text-sm font-medium">
                Display Order
              </label>

              <input
                type="number"
                min="1"
                name="display_order"
                value={form.display_order}
                onChange={handleChange}
                className="w-full border rounded-xl px-4 py-3"
              />

            </div>

            <div className="flex flex-col justify-end gap-3">

              <label className="flex items-center gap-2">

                <input
                  type="checkbox"
                  name="is_gate"
                  checked={form.is_gate}
                  onChange={handleChange}
                />

                Entry Gate

              </label>

              <label className="flex items-center gap-2">

                <input
                  type="checkbox"
                  name="active"
                  checked={form.active}
                  onChange={handleChange}
                />

                Active

              </label>

            </div>

          </div>

          <div className="flex justify-end gap-3 pt-3">

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 rounded-xl border hover:bg-gray-100"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white"
            >
              {isEdit ? "Save Changes" : "Create Desk"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}