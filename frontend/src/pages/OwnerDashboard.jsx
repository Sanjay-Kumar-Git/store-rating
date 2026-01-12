import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import DashboardLayout from "@/layouts/DashboardLayout";
import { API_BASE } from "@/utils/api";
import { 
  Store, 
  Star, 
  Loader2, 
  AlertCircle, 
  Users, 
  TrendingUp, 
  MapPin 
} from "lucide-react";

const OwnerDashboard = () => {
  const token = Cookies.get("token");

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/owner/dashboard`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const result = await res.json();
        if (!res.ok) throw new Error(result.message || "Failed to fetch dashboard");

        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchDashboard();
  }, [token]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-40">
          <Loader2 className="animate-spin text-indigo-600 mb-4" size={48} />
          <p className="text-slate-500 font-medium animate-pulse">Loading analytics...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="max-w-md mx-auto mt-20 p-8 bg-red-50 rounded-3xl border border-red-100 text-center">
          <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
          <h2 className="text-red-900 font-black text-xl mb-2">System Error</h2>
          <p className="text-red-700 font-medium">{error}</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* HEADER SECTION */}
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-200">
              <Store size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">{data.store.name}</h1>
              <div className="flex items-center gap-1 text-slate-500 text-sm">
                <MapPin size={14} />
                <span>{data.store.address}</span>
              </div>
            </div>
          </div>
        </header>

        {/* STATS OVERVIEW */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <StatCard 
            label="Average Rating" 
            value={data.averageRating.toFixed(1)} 
            icon={<Star className="fill-amber-400 text-amber-400" />}
            suffix="/ 5.0"
          />
          <StatCard 
            label="Total Reviews" 
            value={data.ratings.length} 
            icon={<Users className="text-blue-500" />}
          />
          <StatCard 
            label="Store Status" 
            value="Active" 
            icon={<TrendingUp className="text-emerald-500" />}
          />
        </div>

        {/* RATINGS TABLE/LIST */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
            <h2 className="text-xl font-black text-slate-800">Recent Ratings</h2>
            <span className="px-3 py-1 bg-white border rounded-full text-xs font-bold text-slate-500">
              {data.ratings.length} Total
            </span>
          </div>

          <div className="p-4">
            {data.ratings.length === 0 ? (
              <div className="py-20 text-center">
                <p className="text-slate-400 font-medium italic">No customer feedback yet.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {data.ratings.map((r, i) => (
                  <div 
                    key={i} 
                    className="flex justify-between items-center p-4 rounded-2xl hover:bg-slate-50 transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-600 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                        {r.userName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{r.userName}</p>
                        <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Verified Customer</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, starIndex) => (
                          <Star 
                            key={starIndex} 
                            size={14} 
                            className={`${starIndex < r.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"}`}
                          />
                        ))}
                      </div>
                      <span className="ml-2 font-black text-slate-900 text-lg">{r.rating}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

/* ---------------- HELPER COMPONENTS ---------------- */

const StatCard = ({ label, value, icon, suffix = "" }) => (
  <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center gap-3 mb-4">
      <div className="p-2 bg-slate-50 rounded-xl group-hover:bg-white transition-colors">
        {icon}
      </div>
      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</span>
    </div>
    <div className="flex items-baseline gap-1">
      <span className="text-3xl font-black text-slate-900">{value}</span>
      {suffix && <span className="text-slate-400 font-bold text-sm">{suffix}</span>}
    </div>
  </div>
);

export default OwnerDashboard;