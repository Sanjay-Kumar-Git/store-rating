import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import DashboardLayout from "@/layouts/DashboardLayout";
import { API_BASE } from "@/utils/api";
import {
  Store,
  Star,
  Loader2,
  AlertCircle,
  MapPin,
  LayoutGrid,
  CheckCircle
} from "lucide-react";

const UserDashboard = () => {
  const token = Cookies.get("token");

  const [stores, setStores] = useState([]);
  const [userRatings, setUserRatings] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ---------------- FETCH STORES ---------------- */
  const fetchStores = async (silent = false) => {
    if (!silent) setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/api/user/stores`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load stores");

      setStores(data);

      /**
       * ✅ SOURCE OF TRUTH
       * Ratings MUST come from backend (myRating)
       */
      const ratingsFromApi = {};
      data.forEach(store => {
        if (store.myRating !== null && store.myRating !== undefined) {
          ratingsFromApi[store.id] = store.myRating;
        }
      });
      setUserRatings(ratingsFromApi);

    } catch (err) {
      if (!silent) setError(err.message);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchStores();
  }, [token]);

  /* ---------------- RATE STORE ---------------- */
  const handleRate = async (storeId, rating) => {
    // Optimistic UI
    setUserRatings(prev => ({ ...prev, [storeId]: rating }));

    try {
      const res = await fetch(`${API_BASE}/api/user/ratings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ storeId, rating })
      });

      if (!res.ok) throw new Error("Rating sync failed");

      // Silent refresh to update avg + persist rating
      fetchStores(true);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* HEADER */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Marketplace
            </h1>
            <p className="text-slate-500 font-medium">
              Discover and rate the best local stores.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl w-fit">
            <button className="px-4 py-2 bg-white shadow-sm rounded-lg text-sm font-bold text-slate-700 flex items-center gap-2">
              <LayoutGrid size={16} /> All Stores
            </button>
          </div>
        </header>

        {/* CONTENT */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <Loader2 className="animate-spin text-indigo-600" size={40} />
            <p className="text-slate-400 font-semibold animate-pulse">
              Fetching stores...
            </p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-24 text-red-600 gap-3">
            <AlertCircle size={40} />
            <p className="font-bold">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {stores.map(store => (
              <StoreCard
                key={store.id}
                store={store}
                userRating={userRatings[store.id]}
                onRate={handleRate}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

/* ---------------- STORE CARD ---------------- */

const StoreCard = ({ store, userRating, onRate }) => {
  const [hover, setHover] = useState(0);
  const activeRating = hover || userRating || 0;

  return (
    <div className="group relative bg-white border border-slate-200 rounded-3xl p-5 transition-all duration-300 hover:border-indigo-200 hover:shadow-[0_20px_50px_rgba(79,70,229,0.07)]">
      {/* TOP */}
      <div className="flex justify-between items-start mb-6">
        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
          <Store className="text-slate-400 group-hover:text-indigo-600 transition-colors" size={24} />
        </div>
        <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
          <Star size={12} className="fill-amber-400 text-amber-400" />
          <span className="text-xs font-bold text-slate-700">
            {store.averageRating?.toFixed(1) || "0.0"}
          </span>
        </div>
      </div>

      {/* BODY */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-slate-800 mb-1 group-hover:text-indigo-600 transition-colors">
          {store.name}
        </h3>
        <div className="flex items-center gap-1 text-slate-400">
          <MapPin size={14} />
          <span className="text-xs font-medium truncate">
            {store.address || "No address provided"}
          </span>
        </div>
      </div>

      {/* FOOTER */}
      <div className="pt-5 border-t border-slate-50">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {userRating ? "Your Rating" : "Rate this store"}
          </span>
          {userRating && <CheckCircle size={14} className="text-emerald-500" />}
        </div>

        <div className="flex items-center gap-1" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map(num => (
            <button
              key={num}
              onMouseEnter={() => setHover(num)}
              onClick={() => onRate(store.id, num)}
              className="p-1 cursor-pointer transition-transform active:scale-90"
            >
              <Star
                size={22}
                className={`transition-all duration-200 ${
                  activeRating >= num
                    ? "fill-indigo-500 text-indigo-500 filter drop-shadow-[0_0_8px_rgba(79,70,229,0.4)]"
                    : "text-slate-200"
                }`}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
