import { X, Shield, Loader2 } from "lucide-react";
import { useState } from "react";
import Cookies from "js-cookie";
import { API_BASE } from "@/utils/api";

const ChangeRoleModal = ({ user, onClose, onSuccess }) => {
  const token = Cookies.get("token");
  const [role, setRole] = useState(user.role);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(
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

      if (!res.ok) throw new Error("Failed to update role");

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100]">
      <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-xl animate-in zoom-in-95">
        
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-black text-slate-900">
            Change User Role
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full">
            <X size={20} />
          </button>
        </div>

        {/* USER INFO */}
        <div className="mb-6 p-4 bg-slate-50 rounded-xl">
          <p className="text-sm font-bold text-slate-800">{user.name}</p>
          <p className="text-xs text-slate-500">{user.email}</p>
        </div>

        {/* ROLE SELECT */}
        <div className="space-y-2 mb-6">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Select Role
          </label>
          <div className="relative">
            <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 font-bold text-sm outline-none focus:ring-2 focus:ring-blue-100"
            >
              <option value="user">User</option>
              <option value="owner">Owner</option>
            </select>
          </div>
        </div>

        {error && (
          <p className="text-xs text-red-600 font-bold mb-4">{error}</p>
        )}

        {/* ACTION */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-black hover:bg-blue-700 transition-all flex items-center justify-center"
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : "Update Role"}
        </button>
      </div>
    </div>
  );
};

export default ChangeRoleModal;
