import { useState } from "react";
import { X, Shield, Loader2 } from "lucide-react";
import Cookies from "js-cookie";
import { API_BASE } from "@/utils/api";

/**
 * ChangeRoleModal
 * ------------------------------------------------
 * Admin modal to update a user's role (user ↔ owner).
 *
 * Props:
 * - user: { id, name, email, role }
 * - onClose: function
 * - onSuccess: function (called after successful update)
 */
const ChangeRoleModal = ({ user, onClose, onSuccess }) => {
  const token = Cookies.get("token");

  const [role, setRole] = useState(user.role);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* ======================================================
     HANDLERS
  ====================================================== */
  const handleSubmit = async () => {
    if (!token) {
      setError("Authentication token missing");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_BASE}/api/admin/users/${user.id}/role`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ role }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update user role");
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
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-xl animate-in zoom-in-95">
        {/* HEADER */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-black text-slate-900">
            Change User Role
          </h2>

          <button
            onClick={onClose}
            aria-label="Close modal"
            className="rounded-full p-2 transition hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        {/* USER INFO */}
        <div className="mb-6 rounded-xl bg-slate-50 p-4">
          <p className="text-sm font-bold text-slate-800">{user.name}</p>
          <p className="text-xs text-slate-500">{user.email}</p>
        </div>

        {/* ROLE SELECT */}
        <div className="mb-6 space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Select Role
          </label>

          <div className="relative">
            <Shield
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm font-bold outline-none transition focus:ring-2 focus:ring-blue-100"
            >
              <option value="user">User</option>
              <option value="owner">Owner</option>
            </select>
          </div>
        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <p className="mb-4 text-xs font-bold text-red-600">
            {error}
          </p>
        )}

        {/* ACTION BUTTON */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="flex w-full items-center justify-center rounded-xl bg-blue-600 py-3 font-black text-white transition hover:bg-blue-700 disabled:opacity-70"
        >
          {loading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            "Update Role"
          )}
        </button>
      </div>
    </div>
  );
};

export default ChangeRoleModal;
