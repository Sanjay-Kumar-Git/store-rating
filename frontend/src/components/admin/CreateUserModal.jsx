import { useState } from "react";
import {
  X,
  Loader2,
  ChevronDown,
  User,
  Mail,
  Lock,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import Cookies from "js-cookie";
import { API_BASE } from "@/utils/api";

/**
 * CreateUserModal
 * ------------------------------------------------
 * Admin modal to create a new account
 * (Standard User or Store Owner).
 *
 * Props:
 * - onClose: function
 * - onSuccess: function (called after successful creation)
 */
const CreateUserModal = ({ onClose, onSuccess }) => {
  const token = Cookies.get("token");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    address: "",
    role: "user",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

    if (!token) {
      setError("Authentication token missing");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_BASE}/api/admin/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to create account");
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
              New Profile
            </h2>
            <p className="text-xs font-medium text-slate-400">
              Add a new user or store owner
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
            <ShieldCheck size={14} />
            {error}
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* INPUT FIELDS */}
          <div className="space-y-4">
            <FormInput
              icon={<User size={18} />}
              name="name"
              placeholder="Full Name"
              onChange={handleChange}
              required
            />

            <FormInput
              icon={<Mail size={18} />}
              name="email"
              type="email"
              placeholder="Email Address"
              onChange={handleChange}
              required
            />

            <FormInput
              icon={<Lock size={18} />}
              name="password"
              type="password"
              placeholder="Password"
              onChange={handleChange}
              required
            />

            <FormInput
              icon={<MapPin size={18} />}
              name="address"
              placeholder="Physical Address"
              onChange={handleChange}
            />
          </div>

          {/* ROLE SELECT */}
          <div className="space-y-2 pt-2">
            <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
              Assign Account Role
            </label>

            <div className="group relative">
              <select
                name="role"
                onChange={handleChange}
                className="w-full cursor-pointer appearance-none rounded-2xl border border-slate-100 bg-slate-50 p-4 pr-12 text-sm font-bold text-slate-700 outline-none transition-all focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
              >
                <option value="user">Standard User</option>
                <option value="owner">Store Owner</option>
              </select>

              <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-slate-400 transition-colors group-focus-within:text-blue-500">
                <ChevronDown size={20} />
              </div>
            </div>
          </div>

          {/* ACTION BUTTON */}
          <button
            disabled={loading}
            className="mt-4 flex w-full items-center justify-center rounded-2xl bg-slate-900 py-4 text-sm font-black tracking-wide text-white shadow-xl shadow-slate-200 transition hover:bg-blue-600 hover:shadow-blue-200 active:scale-[0.98] disabled:opacity-70"
          >
            {loading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              "Create Account"
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
  <div className="relative">
    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">
      {icon}
    </div>

    <input
      {...props}
      className="w-full rounded-2xl border border-slate-100 bg-slate-50 py-4 pl-12 pr-4 text-sm font-medium outline-none transition-all placeholder:text-slate-300 focus:border-blue-200 focus:bg-white focus:ring-4 focus:ring-blue-50"
    />
  </div>
);

export default CreateUserModal;
