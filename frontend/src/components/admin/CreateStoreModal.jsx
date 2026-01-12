import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import {
  X,
  Loader2,
  Store,
  Mail,
  MapPin,
  UserCheck,
  ChevronDown,
  AlertCircle,
} from "lucide-react";
import { API_BASE } from "@/utils/api";

/**
 * CreateStoreModal
 * ------------------------------------------------
 * Admin modal to create a new store and assign an owner.
 *
 * Props:
 * - onClose: function
 * - onSuccess: function (called after successful creation)
 */
const CreateStoreModal = ({ onClose, onSuccess }) => {
  const token = Cookies.get("token");

  const [owners, setOwners] = useState([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    address: "",
    ownerId: "",
  });

  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState("");

  /* ======================================================
     FETCH OWNERS
  ====================================================== */
  useEffect(() => {
    const fetchOwners = async () => {
      if (!token) {
        setError("Authentication token missing");
        setFetchLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/api/admin/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }

        // Only users with role "owner" are eligible
        setOwners(data.filter((u) => u.role === "owner"));
      } catch {
        setError("Failed to load available owners");
      } finally {
        setFetchLoading(false);
      }
    };

    fetchOwners();
  }, [token]);

  /* ======================================================
     HANDLERS
  ====================================================== */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.ownerId) {
      setError("Please assign a store owner");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_BASE}/api/admin/stores`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Could not create store");
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  /* ======================================================
     UI
  ====================================================== */
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-md rounded-[2.5rem] bg-white p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* HEADER */}
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900">
              New Store
            </h2>
            <p className="text-xs font-medium text-slate-400">
              Register a new business entity
            </p>
          </div>

          <button
            onClick={onClose}
            aria-label="Close modal"
            className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100"
          >
            <X size={24} />
          </button>
        </header>

        {/* ERROR MESSAGE */}
        {error && (
          <div className="mb-6 flex items-center gap-2 rounded-2xl border border-red-100 bg-red-50 p-4 text-xs font-bold text-red-600">
            <AlertCircle size={14} />
            {error}
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <FormInput
              icon={<Store size={18} />}
              name="name"
              placeholder="Store Legal Name"
              onChange={handleChange}
              required
            />

            <FormInput
              icon={<Mail size={18} />}
              name="email"
              type="email"
              placeholder="Official Store Email"
              onChange={handleChange}
              required
            />

            <FormInput
              icon={<MapPin size={18} />}
              name="address"
              placeholder="Store Location Address"
              onChange={handleChange}
            />
          </div>

          {/* OWNER SELECT */}
          <div className="space-y-2 pt-2">
            <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
              Assign Store Owner
            </label>

            <div className="group relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 transition-colors group-focus-within:text-indigo-500">
                <UserCheck size={18} />
              </div>

              <select
                name="ownerId"
                onChange={handleChange}
                required
                disabled={fetchLoading}
                className="w-full appearance-none cursor-pointer rounded-2xl border border-slate-100 bg-slate-50 p-4 pl-12 pr-12 text-sm font-bold text-slate-700 outline-none transition-all focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50 disabled:opacity-50"
              >
                <option value="">
                  {fetchLoading
                    ? "Loading owners..."
                    : "Select Owner Account"}
                </option>

                {owners.map((owner) => (
                  <option key={owner.id} value={owner.id}>
                    {owner.name}
                  </option>
                ))}
              </select>

              <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-slate-400 transition-colors group-focus-within:text-indigo-500">
                <ChevronDown size={20} />
              </div>
            </div>

            {owners.length === 0 && !fetchLoading && (
              <p className="ml-1 text-[10px] font-bold text-amber-600">
                No owner accounts found. Create an owner first.
              </p>
            )}
          </div>

          {/* ACTION BUTTON */}
          <button
            disabled={loading || fetchLoading}
            className="mt-4 flex w-full items-center justify-center rounded-2xl bg-indigo-600 py-4 text-sm font-black tracking-wide text-white shadow-xl shadow-indigo-100 transition hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-70"
          >
            {loading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              "Initialize Store"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

/* ======================================================
   REUSABLE INPUT COMPONENT
====================================================== */
const FormInput = ({ icon, ...props }) => (
  <div className="group relative">
    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 transition-colors group-focus-within:text-indigo-500">
      {icon}
    </div>

    <input
      {...props}
      className="w-full rounded-2xl border border-slate-100 bg-slate-50 py-4 pl-12 pr-4 text-sm font-medium outline-none transition-all placeholder:text-slate-300 focus:border-indigo-200 focus:bg-white focus:ring-4 focus:ring-indigo-50"
    />
  </div>
);

export default CreateStoreModal;
