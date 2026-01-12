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
  MapPin,
} from "lucide-react";

/**
 * OwnerDashboard
 * ------------------------------------------------
 * Displays analytics for store owners:
 * - Store details
 * - Average rating
 * - Customer ratings list
 */
const OwnerDashboard = () => {
  const token = Cookies.get("token");

  /* ---------------- STATE ---------------- */
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ---------------- FETCH DASHBOARD DATA ---------------- */
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await fetch(
          `${API_BASE}/api/owner/dashboard`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();
        if (!response.ok) {
          throw new Error(
            data.message || "Failed to load owner dashboard"
          );
        }

        setDashboardData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchDashboard();
  }, [token]);

  /* ---------------- LOADING STATE ---------------- */
  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-40">
          <Loader2
            size={48}
            className="mb-4 animate-spin text-indigo-600"
          />
          <p className="animate-pulse font-medium text-slate-500">
            Loading analytics...
          </p>
        </div>
      </DashboardLayout>
    );
  }

  /* ---------------- ERROR STATE ---------------- */
  if (error) {
    return (
      <DashboardLayout>
        <div className="mx-auto mt-20 max-w-md rounded-3xl border border-red-100 bg-red-50 p-8 text-center">
          <AlertCircle
            size={48}
            className="mx-auto mb-4 text-red-500"
          />
          <h2 className="mb-2 text-xl font-black text-red-900">
            System Error
          </h2>
          <p className="font-medium text-red-700">{error}</p>
        </div>
      </DashboardLayout>
    );
  }

  /* ---------------- UI ---------------- */
  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl px-6 py-10">

        {/* HEADER */}
        <header className="mb-10">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-2xl bg-indigo-600 p-3 text-white shadow-lg shadow-indigo-200">
              <Store size={28} />
            </div>

            <div>
              <h1 className="text-3xl font-black tracking-tight text-slate-900">
                {dashboardData.store.name}
              </h1>
              <div className="flex items-center gap-1 text-sm text-slate-500">
                <MapPin size={14} />
                <span>{dashboardData.store.address}</span>
              </div>
            </div>
          </div>
        </header>

        {/* STATISTICS */}
        <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          <StatCard
            label="Average Rating"
            value={dashboardData.averageRating.toFixed(1)}
            suffix="/ 5.0"
            icon={<Star className="fill-amber-400 text-amber-400" />}
          />

          <StatCard
            label="Total Reviews"
            value={dashboardData.ratings.length}
            icon={<Users className="text-blue-500" />}
          />

          <StatCard
            label="Store Status"
            value="Active"
            icon={<TrendingUp className="text-emerald-500" />}
          />
        </div>

        {/* RATINGS LIST */}
        <div className="overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white shadow-xl shadow-slate-200/50">
          
          {/* TABLE HEADER */}
          <div className="flex items-center justify-between border-b border-slate-50 bg-slate-50/50 px-8 py-6">
            <h2 className="text-xl font-black text-slate-800">
              Recent Ratings
            </h2>
            <span className="rounded-full border bg-white px-3 py-1 text-xs font-bold text-slate-500">
              {dashboardData.ratings.length} Total
            </span>
          </div>

          {/* TABLE BODY */}
          <div className="p-4">
            {dashboardData.ratings.length === 0 ? (
              <div className="py-20 text-center">
                <p className="italic font-medium text-slate-400">
                  No customer feedback yet.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {dashboardData.ratings.map((rating, index) => (
                  <div
                    key={index}
                    className="group flex items-center justify-between rounded-2xl p-4 transition-colors hover:bg-slate-50"
                  >
                    {/* USER */}
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-600 transition-colors group-hover:bg-indigo-100 group-hover:text-indigo-600">
                        {rating.userName.charAt(0)}
                      </div>

                      <div>
                        <p className="font-bold text-slate-800">
                          {rating.userName}
                        </p>
                        <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                          Verified Customer
                        </p>
                      </div>
                    </div>

                    {/* STARS */}
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, starIndex) => (
                          <Star
                            key={starIndex}
                            size={14}
                            className={
                              starIndex < rating.rating
                                ? "fill-amber-400 text-amber-400"
                                : "text-slate-200"
                            }
                          />
                        ))}
                      </div>
                      <span className="ml-2 text-lg font-black text-slate-900">
                        {rating.rating}
                      </span>
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

/* ======================================================
   HELPER COMPONENTS
====================================================== */
const StatCard = ({ label, value, icon, suffix = "" }) => (
  <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
    <div className="mb-4 flex items-center gap-3">
      <div className="rounded-xl bg-slate-50 p-2">{icon}</div>
      <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
        {label}
      </span>
    </div>

    <div className="flex items-baseline gap-1">
      <span className="text-3xl font-black text-slate-900">
        {value}
      </span>
      {suffix && (
        <span className="text-sm font-bold text-slate-400">
          {suffix}
        </span>
      )}
    </div>
  </div>
);

export default OwnerDashboard;
