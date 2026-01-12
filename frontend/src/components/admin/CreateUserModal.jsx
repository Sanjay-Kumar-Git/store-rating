import { useState } from "react";
import { X, Loader2, ChevronDown, User, Mail, Lock, MapPin, ShieldCheck } from "lucide-react";
import { API_BASE } from "@/utils/api";
import Cookies from "js-cookie";

const CreateUserModal = ({ onClose, onSuccess }) => {
  const token = Cookies.get("token");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    address: "",
    role: "user"
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/admin/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Something went wrong");

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
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">New Profile</h2>
            <p className="text-xs font-medium text-slate-400">Add a new user or store owner</p>
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
            <ShieldCheck size={14} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Form Fields */}
          <div className="space-y-4">
            <FormInput icon={<User size={18}/>} name="name" placeholder="Full Name" onChange={handleChange} required />
            <FormInput icon={<Mail size={18}/>} name="email" placeholder="Email Address" type="email" onChange={handleChange} required />
            <FormInput icon={<Lock size={18}/>} name="password" placeholder="Password" type="password" onChange={handleChange} required />
            <FormInput icon={<MapPin size={18}/>} name="address" placeholder="Physical Address" onChange={handleChange} />
          </div>

          {/* STYLED SELECT ELEMENT */}
          <div className="space-y-2 pt-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
              Assign Account Role
            </label>
            <div className="relative group">
              <select 
                name="role" 
                onChange={handleChange} 
                className="w-full appearance-none bg-slate-50 border border-slate-100 text-slate-700 text-sm font-bold rounded-2xl p-4 pr-12 outline-none focus:bg-white focus:ring-4 focus:ring-blue-50 focus:border-blue-400 transition-all cursor-pointer"
              >
                <option value="user">Standard User</option>
                <option value="owner">Store Owner</option>
              </select>
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                <ChevronDown size={20} />
              </div>
            </div>
          </div>

          <button 
            disabled={loading}
            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-sm tracking-wide shadow-xl shadow-slate-200 hover:bg-blue-600 hover:shadow-blue-200 transition-all active:scale-[0.98] disabled:opacity-70 mt-4"
          >
            {loading ? (
              <Loader2 className="animate-spin mx-auto" size={20} />
            ) : (
              "Create Account"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

/* Internal Helper Component for Inputs */
const FormInput = ({ icon, ...props }) => (
  <div className="relative">
    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">
      {icon}
    </div>
    <input 
      {...props}
      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium outline-none focus:bg-white focus:ring-4 focus:ring-blue-50 focus:border-blue-200 transition-all placeholder:text-slate-300" 
    />
  </div>
);

export default CreateUserModal;