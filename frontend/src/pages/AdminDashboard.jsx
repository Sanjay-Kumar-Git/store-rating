import { useEffect, useState, useMemo, useCallback } from "react";
import Cookies from "js-cookie";
import DashboardLayout from "@/layouts/DashboardLayout";
import { API_BASE } from "@/utils/api";
import CreateUserModal from "@/components/admin/CreateUserModal";
import CreateStoreModal from "@/components/admin/CreateStoreModal";
import ChangeRoleModal from "@/components/admin/ChangeRoleModal";
import {
  Users, Store, Search, Mail, MapPin, Shield, ChevronRight,
  Loader2, Trash2, Info, Calendar, UserPlus, AlertCircle, PlusCircle,
  User, Briefcase, RefreshCw, Star, Download, ShieldCheck
} from "lucide-react";

const AdminDashboard = () => {
  const token = Cookies.get("token");

  const [activeTab, setActiveTab] = useState("users");
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showCreateStore, setShowCreateStore] = useState(false);
  const [showChangeRole, setShowChangeRole] = useState(false);

  /* ---------------- FETCH DATA ---------------- */
  const fetchData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");

    try {
      const endpoint = activeTab === "users" ? "/api/admin/users" : "/api/admin/stores";
      const res = await fetch(`${API_BASE}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load data");
      
      setItems(activeTab === "users" ? data.filter(u => u.role !== "owner") : data);
    } catch (err) {
      setError(err.message);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab, token]);

  useEffect(() => {
    setSelectedItem(null);
    fetchData();
  }, [activeTab, fetchData]);

  /* ---------------- FUNCTIONALITY: GENERATE REPORT ---------------- */
  const handleGenerateReport = () => {
    if (items.length === 0) return;
    
    // Create CSV Header
    const headers = activeTab === "users" 
      ? ["ID", "Name", "Email", "Role"] 
      : ["ID", "Store Name", "Owner", "Rating"];
    
    // Map Data
    const rows = filteredItems.map(item => {
      return activeTab === "users"
        ? [item.id, item.name, item.email, item.role]
        : [item.id, item.name, item.owner?.name || "N/A", item.averageRating || 0];
    });

    // Build CSV String
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    // Trigger Download
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${activeTab}_report_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const [summary, setSummary] = useState({
  totalUsers: 0,
  totalStores: 0,
  totalRatings: 0
});

useEffect(() => {
  const fetchSummary = async () => {
    const res = await fetch(`${API_BASE}/api/admin/dashboard`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (res.ok) setSummary(data);
  };
  fetchSummary();
}, [token]);

const fetchUserDetails = async (id) => {
  try {
    setLoading(true);
    const res = await fetch(`${API_BASE}/api/admin/users/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    setSelectedItem(data);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};



  /* ---------------- HANDLERS ---------------- */
  const handleDelete = async () => {
    if (!selectedItem || !token) return;
    if (!window.confirm(`Permanently delete this ${activeTab.slice(0,-1)}?`)) return;

    setActionLoading(true);
    try {
      const endpoint = activeTab === "users" 
        ? `/api/admin/users/${selectedItem.id}` 
        : `/api/admin/stores/${selectedItem.id}`;

      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Deletion failed.");
      
      setItems(prev => prev.filter(i => i.id !== selectedItem.id));
      setSelectedItem(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const filteredItems = useMemo(() => {
    const q = search.toLowerCase().trim();
    return items.filter((item) => 
      item.name?.toLowerCase().includes(q) || 
      item.email?.toLowerCase().includes(q)
    );
  }, [items, search]);

  return (
    <DashboardLayout>
      <div className="max-w-[1440px] mx-auto px-6 py-4">
        
        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <QuickStat label={`Active ${activeTab}`} value={items.length} icon={activeTab === "users" ? <Users size={20} className="text-blue-500" /> : <Store size={20} className="text-indigo-500" />} />
          <QuickStat label="Privilege" value="Super Admin" icon={<ShieldCheck size={20} className="text-emerald-500" />} />
          <button 
            onClick={handleGenerateReport}
            className="bg-white p-5 rounded-2xl border border-slate-100 flex items-center gap-4 shadow-sm hover:bg-slate-50 transition-colors group"
          >
            <div className="p-3 bg-blue-50 rounded-xl group-hover:bg-blue-100"><Download size={20} className="text-blue-600" /></div>
            <div className="text-left">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Export Data</p>
              <p className="text-sm font-black text-slate-900">Download CSV</p>
            </div>
          </button>
          <QuickStat label="Status" value="System Live" icon={<div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />} />
        </div>

        <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm flex flex-col md:flex-row min-h-[750px]">
          
          {/* SIDEBAR */}
          <div className="w-full md:w-96 border-r border-slate-100 flex flex-col bg-slate-50/30">
            <div className="p-6 space-y-4 bg-white border-b border-slate-100">
              <div className="flex justify-between items-center">
                <h2 className="font-black text-xl text-slate-800 tracking-tight capitalize">{activeTab}</h2>
                <button 
                  onClick={() => activeTab === "users" ? setShowCreateUser(true) : setShowCreateStore(true)}
                  className="p-2 text-white bg-slate-900 rounded-xl hover:scale-105 transition-transform px-4 text-xs font-bold"
                >
                  NEW +
                </button>
              </div>

              <div className="flex p-1 bg-slate-100 rounded-xl">
                {['users', 'stores'].map((tab) => (
                  <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === tab ? "bg-white shadow-sm text-blue-600" : "text-slate-500"}`}>
                    {tab}
                  </button>
                ))}
              </div>

              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  placeholder="Quick search..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-blue-50 rounded-xl text-sm outline-none transition-all"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              {loading ? (
                <div className="flex justify-center py-20"><Loader2 className="animate-spin text-slate-300" /></div>
              ) : filteredItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={`p-4 mb-1 rounded-2xl cursor-pointer transition-all flex items-center justify-between ${selectedItem?.id === item.id ? "bg-white shadow-md ring-1 ring-slate-100" : "hover:bg-white/60"}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs uppercase">
                      {item.name?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-700">{item.name}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{item.email || "Store Profile"}</p>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-slate-300" />
                </div>
              ))}
            </div>
          </div>

          {/* MAIN DETAIL VIEW */}
          <div className="flex-1 bg-white">
            {!selectedItem ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-300 p-10 text-center">
                <Info size={48} strokeWidth={1} className="mb-4" />
                <p className="font-bold">Select a record to manage</p>
              </div>
            ) : (
              <div className="p-10 animate-in fade-in slide-in-from-right-4">
                <div className="flex justify-between items-center mb-10">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-2xl font-black shadow-lg shadow-blue-100">
                      {selectedItem.name?.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-3xl font-black text-slate-900">{selectedItem.name}</h2>
                      <span className="inline-block mt-1 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold uppercase tracking-widest">
                        {activeTab === "users" ? selectedItem.role : "Verified Store"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                  <DetailBox icon={<Mail size={16} />} label="Email" value={selectedItem.email || "N/A"} />
                  {activeTab === "stores" ? (
                    <>
                      <DetailBox icon={<User size={16} />} label="Owner" value={selectedItem.owner?.name || "Unassigned"} color="text-indigo-600" />
                      <DetailBox icon={<Star size={16} />} label="Rating" value={selectedItem.averageRating || "0.0"} color="text-amber-500" />
                    </>
                  ) : (
                    <DetailBox icon={<Calendar size={16} />} label="Joined" value="2026-01-10" />
                  )}
                </div>

                <div className="pt-8 border-t border-slate-100 flex flex-wrap gap-4">
                  {activeTab === "users" && (
                    <button
                      onClick={() => setShowChangeRole(true)}
                      className="flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                    >
                      <Shield size={18} />
                      Manage User Role
                    </button>
                  )}
                  
                  <button 
                    onClick={handleDelete}
                    disabled={actionLoading}
                    className="flex items-center gap-2 px-8 py-4 bg-red-50 text-red-600 rounded-2xl font-bold hover:bg-red-600 hover:text-white transition-all disabled:opacity-50"
                  >
                    <Trash2 size={18} />
                    Delete Record
                  </button>

                  <button 
                    onClick={handleGenerateReport}
                    className="flex items-center gap-2 px-8 py-4 bg-slate-100 text-slate-700 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                  >
                    <Download size={18} />
                    Report
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODALS */}
      {showCreateUser && <CreateUserModal onClose={() => setShowCreateUser(false)} onSuccess={() => { setShowCreateUser(false); fetchData(); }} />}
      {showCreateStore && <CreateStoreModal onClose={() => setShowCreateStore(false)} onSuccess={() => { setShowCreateStore(false); fetchData(); }} />}
      {showChangeRole && selectedItem && (
        <ChangeRoleModal
          user={selectedItem}
          onClose={() => setShowChangeRole(false)}
          onSuccess={() => { setShowChangeRole(false); fetchData(); }}
        />
      )}
    </DashboardLayout>
  );
};

const QuickStat = ({ label, value, icon }) => (
  <div className="bg-white p-5 rounded-2xl border border-slate-100 flex items-center gap-4 shadow-sm">
    <div className="p-3 bg-slate-50 rounded-xl">{icon}</div>
    <div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
      <p className="text-lg font-black text-slate-900">{value}</p>
    </div>
  </div>
);

const DetailBox = ({ icon, label, value, color = "text-slate-700" }) => (
  <div className="p-5 rounded-2xl border border-slate-50 bg-slate-50/30">
    <div className="flex items-center gap-2 text-slate-400 mb-2 uppercase text-[10px] font-black tracking-widest">
      {icon} {label}
    </div>
    <p className={`font-bold text-sm ${color}`}>{value}</p>
  </div>
);

export default AdminDashboard;