import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { X, Loader2, Store, Mail, MapPin, UserCheck, ChevronDown, AlertCircle } from "lucide-react";
import { API_BASE } from "@/utils/api";

const CreateStoreModal = ({ onClose, onSuccess }) => {
  const token = Cookies.get("token");

  const [owners, setOwners] = useState([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    address: "",
    ownerId: ""
  });

  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState("");

  /* ---------------- FETCH OWNERS ---------------- */
  useEffect(() => {
    const fetchOwners = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/admin/users`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const data = await res.json();
        if (!res.ok) throw new Error("Failed to fetch users");

        // Filter ONLY owners
        const ownerList = data.filter(u => u.role === "owner");
        setOwners(ownerList);
      } catch (err) {
        setError("Failed to load available owners");
      } finally {
        setFetchLoading(false);
      }
    };

    fetchOwners();
  }, [token]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError("");

    if (!form.ownerId) {
      setError("Please assign a store owner");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/admin/stores`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Could not create store");

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">New Store</h2>
            <p className="text-xs font-medium text-slate-400">Register a new business entity</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
          >
            <X size={24} />
          </button>
        </header>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-xs font-bold flex items-center gap-2">
            <AlertCircle size={14} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="space-y-4">
            <FormInput 
              icon={<Store size={18}/>} 
              name="name" 
              placeholder="Store Legal Name" 
              onChange={handleChange} 
              required 
            />
            <FormInput 
              icon={<Mail size={18}/>} 
              name="email" 
              placeholder="Official Store Email" 
              type="email" 
              onChange={handleChange} 
              required 
            />
            <FormInput 
              icon={<MapPin size={18}/>} 
              name="address" 
              placeholder="Store Location Address" 
              onChange={handleChange} 
            />
          </div>

          {/* STYLED OWNER SELECT */}
          <div className="space-y-2 pt-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
              Assign Store Owner
            </label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors">
                <UserCheck size={18} />
              </div>
              <select
                name="ownerId"
                onChange={handleChange}
                required
                disabled={fetchLoading}
                className="w-full appearance-none bg-slate-50 border border-slate-100 text-slate-700 text-sm font-bold rounded-2xl p-4 pl-12 pr-12 outline-none focus:bg-white focus:ring-4 focus:ring-indigo-50 focus:border-indigo-400 transition-all cursor-pointer disabled:opacity-50"
              >
                <option value="">{fetchLoading ? "Loading owners..." : "Select Owner Account"}</option>
                {owners.map(owner => (
                  <option key={owner.id} value={owner.id}>
                    {owner.name}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                <ChevronDown size={20} />
              </div>
            </div>
            {owners.length === 0 && !fetchLoading && (
              <p className="text-[10px] text-amber-600 font-bold ml-1">
                No owner accounts found. Create an owner first.
              </p>
            )}
          </div>

          <button 
            disabled={loading || fetchLoading}
            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-sm tracking-wide shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-[0.98] disabled:opacity-70 mt-4 flex items-center justify-center"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              "Initialize Store"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

/* Internal Helper Component for Inputs */
const FormInput = ({ icon, ...props }) => (
  <div className="relative group">
    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors">
      {icon}
    </div>
    <input 
      {...props}
      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium outline-none focus:bg-white focus:ring-4 focus:ring-indigo-50 focus:border-indigo-200 transition-all placeholder:text-slate-300" 
    />
  </div>
);

export default CreateStoreModal;