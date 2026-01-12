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
  CheckCircle,
} from "lucide-react";

/**
 * UserDashboard
 * ------------------------------------------------
 * Allows users to:
 * - View all stores
 * - See average ratings
 * - Rate / update ratings (1–5 stars)
 *
 * Ratings are always synced from backend (myRating).
 */
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
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to load stores");
      }

      setStores(data);

      /**
       * Backend is the source of truth.
       * myRating comes directly from API.
       */
      const ratingMap = {};
      data.forEach((store) => {
        if (store.myRating !== null && store.myRating !== undefined) {
          ratingMap[store.id] = store.myRating;
        }
      });

      setUserRatings(ratingMap);
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
    // Optimistic UI update
    setUserRatings((prev) => ({ ...prev, [storeId]: rating }));

    try {
      const res = await fetch(`${API_BASE}/api/user/ratings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ storeId, rating }),
      });

      if (!res.ok) {
        throw new Error("Rating sync failed");
      }

      // Silent refresh to update average rating
      fetchStores(true);
    } catch (err) {
      console.error(err);
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* HEADER */}
        <header className="mb-12 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Marketplace
            </h1>
            <p className="font-medium text-slate-500">
              Discover and rate the best local stores.
            </p>
          </div>

          <div className="flex w-fit items-center gap-2 rounded-xl bg-slate-100 p-1">
            <button className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm">
              <LayoutGrid size={16} />
              All Stores
            </button>
          </div>
        </header>

        {/* CONTENT */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <Loader2 size={40} className="animate-spin text-indigo-600" />
            <p className="animate-pulse font-semibold text-slate-400">
              Fetching stores...
            </p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center gap-3 py-24 text-red-600">
            <AlertCircle size={40} />
            <p className="font-bold">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {stores.map((store) => (
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

/* ======================================================
   STORE CARD COMPONENT
====================================================== */
const StoreCard = ({ store, userRating, onRate }) => {
  const [hoverRating, setHoverRating] = useState(0);

  const activeRating = hoverRating || userRating || 0;

  return (
    <div className="group relative rounded-3xl border border-slate-200 bg-white p-5 transition-all duration-300 hover:border-indigo-200 hover:shadow-[0_20px_50px_rgba(79,70,229,0.07)]">
      {/* HEADER */}
      <div className="mb-6 flex items-start justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 transition-colors group-hover:bg-indigo-50">
          <Store
            size={24}
            className="text-slate-400 transition-colors group-hover:text-indigo-600"
          />
        </div>

        <div className="flex items-center gap-1 rounded-lg border border-slate-100 bg-slate-50 px-2 py-1">
          <Star size={12} className="fill-amber-400 text-amber-400" />
          <span className="text-xs font-bold text-slate-700">
            {store.averageRating?.toFixed(1) || "0.0"}
          </span>
        </div>
      </div>

      {/* BODY */}
      <div className="mb-6">
        <h3 className="mb-1 text-lg font-bold text-slate-800 transition-colors group-hover:text-indigo-600">
          {store.name}
        </h3>

        <div className="flex items-center gap-1 text-slate-400">
          <MapPin size={14} />
          <span className="truncate text-xs font-medium">
            {store.address || "No address provided"}
          </span>
        </div>
      </div>

      {/* FOOTER */}
      <div className="border-t border-slate-50 pt-5">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            {userRating ? "Your Rating" : "Rate this store"}
          </span>
          {userRating && (
            <CheckCircle size={14} className="text-emerald-500" />
          )}
        </div>

        <div
          className="flex items-center gap-1"
          onMouseLeave={() => setHoverRating(0)}
        >
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              onMouseEnter={() => setHoverRating(value)}
              onClick={() => onRate(store.id, value)}
              className="cursor-pointer p-1 transition-transform active:scale-90"
            >
              <Star
                size={22}
                className={`transition-all duration-200 ${
                  activeRating >= value
                    ? "fill-indigo-500 text-indigo-500 drop-shadow-[0_0_8px_rgba(79,70,229,0.4)]"
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
