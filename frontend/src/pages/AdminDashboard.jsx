import { useEffect, useState, useMemo, useCallback } from "react";
import Cookies from "js-cookie";
import DashboardLayout from "@/layouts/DashboardLayout";
import { API_BASE } from "@/utils/api";

import CreateUserModal from "@/components/admin/CreateUserModal";
import CreateStoreModal from "@/components/admin/CreateStoreModal";
import ChangeRoleModal from "@/components/admin/ChangeRoleModal";

import {
  Users,
  Store,
  Search,
  Mail,
  Shield,
  ChevronRight,
  Loader2,
  Trash2,
  Info,
  Calendar,
  Star,
  Download,
  ShieldCheck,
  User,
} from "lucide-react";

/**
 * AdminDashboard
 * ------------------------------------------------
 * Main control panel for admin users.
 *
 * Features:
 * - Manage users & stores
 * - View details
 * - Change roles
 * - Delete records
 * - Export CSV reports
 */
const AdminDashboard = () => {
  const token = Cookies.get("token");

  /* ======================================================
     STATE
  ====================================================== */
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

  /* ======================================================
     FETCH USERS / STORES
  ====================================================== */
  const fetchData = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    setError("");

    try {
      const endpoint =
        activeTab === "users" ? "/api/admin/users" : "/api/admin/stores";

      const res = await fetch(`${API_BASE}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load data");

      setItems(
        activeTab === "users" ? data.filter((u) => u.role !== "owner") : data
      );
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

  /* ======================================================
     SEARCH FILTER
  ====================================================== */
  const filteredItems = useMemo(() => {
    const q = search.toLowerCase().trim();
    return items.filter(
      (item) =>
        item.name?.toLowerCase().includes(q) ||
        item.email?.toLowerCase().includes(q)
    );
  }, [items, search]);

  /* ======================================================
     CSV EXPORT
  ====================================================== */
  const handleGenerateReport = () => {
    if (!filteredItems.length) return;

    const headers =
      activeTab === "users"
        ? ["ID", "Name", "Email", "Role"]
        : ["ID", "Store Name", "Owner", "Rating"];

    const rows = filteredItems.map((item) =>
      activeTab === "users"
        ? [item.id, item.name, item.email, item.role]
        : [
            item.id,
            item.name,
            item.owner?.name || "N/A",
            item.averageRating || 0,
          ]
    );

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${activeTab}_report_${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    link.click();
  };

  /* ======================================================
     DELETE USER / STORE
  ====================================================== */
  const handleDelete = async () => {
    if (!selectedItem) return;

    if (!window.confirm(`Permanently delete this ${activeTab.slice(0, -1)}?`))
      return;

    setActionLoading(true);

    try {
      const endpoint =
        activeTab === "users"
          ? `/api/admin/users/${selectedItem.id}`
          : `/api/admin/stores/${selectedItem.id}`;

      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Deletion failed");

      setItems((prev) => prev.filter((i) => i.id !== selectedItem.id));
      setSelectedItem(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  /* ======================================================
     UI
  ====================================================== */
  return (
    <DashboardLayout>
      <div className="mx-auto max-w-[1440px] px-6 py-4">
        {/* HEADER STATS */}
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
          <QuickStat
            label={`Active ${activeTab}`}
            value={items.length}
            icon={
              activeTab === "users" ? (
                <Users className="text-blue-500" size={20} />
              ) : (
                <Store className="text-indigo-500" size={20} />
              )
            }
          />

          <QuickStat
            label="Privilege"
            value="Super Admin"
            icon={<ShieldCheck className="text-emerald-500" size={20} />}
          />

          <button
            onClick={handleGenerateReport}
            className="group flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:bg-slate-50"
          >
            <div className="rounded-xl bg-blue-50 p-3 group-hover:bg-blue-100">
              <Download size={20} className="text-blue-600" />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Export Data
              </p>
              <p className="text-sm cursor-pointer font-black text-slate-900">
                Download CSV
              </p>
            </div>
          </button>

          <QuickStat
            label="Status"
            value="System Live"
            icon={
              <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
            }
          />
        </div>

        {/* MAIN CONTENT */}
        <div className="flex min-h-[750px] flex-col overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm md:flex-row">
          {/* SIDEBAR */}
          <div className="w-full border-r border-slate-100 bg-slate-50/30 md:w-96">
            <div className="border-b border-slate-100 bg-white p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black capitalize text-slate-800">
                  {activeTab}
                </h2>

                <button
                  onClick={() =>
                    activeTab === "users"
                      ? setShowCreateUser(true)
                      : setShowCreateStore(true)
                  }
                  className="rounded-xl cursor-pointer bg-slate-900 px-4 py-2 text-xs font-bold text-white transition hover:scale-105"
                >
                  NEW +
                </button>
              </div>

              {/* TABS */}
              <div className="flex rounded-xl bg-slate-100 p-1">
                {["users", "stores"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 cursor-pointer rounded-lg py-2 text-sm font-bold transition ${
                      activeTab === tab
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-slate-500"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* SEARCH */}
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  placeholder="Quick search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-xl bg-slate-50 py-2 pl-10 pr-4 text-sm outline-none transition focus:bg-white focus:ring-2 focus:ring-blue-50"
                />
              </div>
            </div>

            {/* LIST */}
            <div className="flex-1 overflow-y-auto p-2">
              {loading ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="animate-spin text-slate-300" />
                </div>
              ) : (
                filteredItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className={`mb-1 flex cursor-pointer items-center justify-between rounded-2xl p-4 transition ${
                      selectedItem?.id === item.id
                        ? "bg-white shadow-md ring-1 ring-slate-100"
                        : "hover:bg-white/60"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-xs font-bold uppercase">
                        {item.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-700">
                          {item.name}
                        </p>
                        <p className="text-[10px] font-medium text-slate-400">
                          {item.email || "Store Profile"}
                        </p>
                      </div>
                    </div>
                    <ChevronRight size={14} className="text-slate-300" />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* DETAILS */}
          <div className="flex-1 bg-white">
            {!selectedItem ? (
              <div className="flex h-full flex-col items-center justify-center p-10 text-center text-slate-300">
                <Info size={48} strokeWidth={1} className="mb-4" />
                <p className="font-bold">Select a record to manage</p>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-right-4 p-10">
                <div className="mb-10 flex items-center gap-6">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-2xl font-black text-white shadow-lg shadow-blue-100">
                    {selectedItem.name?.charAt(0)}
                  </div>

                  <div>
                    <h2 className="text-3xl font-black text-slate-900">
                      {selectedItem.name}
                    </h2>
                    <span className="mt-1 inline-block rounded-full bg-blue-50 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-blue-600">
                      {activeTab === "users"
                        ? selectedItem.role
                        : "Verified Store"}
                    </span>
                  </div>
                </div>

                <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-3">
                  <DetailBox
                    icon={<Mail size={16} />}
                    label="Email"
                    value={selectedItem.email || "N/A"}
                  />

                  {activeTab === "stores" ? (
                    <>
                      <DetailBox
                        icon={<User size={16} />}
                        label="Owner"
                        value={selectedItem.owner?.name || "Unassigned"}
                      />
                      <DetailBox
                        icon={<Star size={16} />}
                        label="Rating"
                        value={selectedItem.averageRating || "0.0"}
                        color="text-amber-500"
                      />
                    </>
                  ) : (
                    <DetailBox
                      icon={<Calendar size={16} />}
                      label="Joined"
                      value="2026-01-10"
                    />
                  )}
                </div>

                <div className="flex flex-wrap gap-4 border-t border-slate-100 pt-8">
                  {activeTab === "users" && (
                    <button
                      onClick={() => setShowChangeRole(true)}
                      className="flex cursor-pointer items-center gap-2 rounded-2xl bg-indigo-600 px-8 py-4 font-bold text-white shadow-lg shadow-indigo-100 transition hover:bg-indigo-700"
                    >
                      <Shield size={18} />
                      Manage User Role
                    </button>
                  )}

                  <button
                    onClick={handleDelete}
                    disabled={actionLoading}
                    className="flex cursor-pointer items-center gap-2 rounded-2xl bg-red-50 px-8 py-4 font-bold text-red-600 transition hover:bg-red-600 hover:text-white disabled:opacity-50"
                  >
                    <Trash2 size={18} />
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODALS */}
      {showCreateUser && (
        <CreateUserModal
          onClose={() => setShowCreateUser(false)}
          onSuccess={fetchData}
        />
      )}

      {showCreateStore && (
        <CreateStoreModal
          onClose={() => setShowCreateStore(false)}
          onSuccess={fetchData}
        />
      )}

      {showChangeRole && selectedItem && (
        <ChangeRoleModal
          user={selectedItem}
          onClose={() => setShowChangeRole(false)}
          onSuccess={fetchData}
        />
      )}
    </DashboardLayout>
  );
};

/* ======================================================
   SMALL UI COMPONENTS
====================================================== */

const QuickStat = ({ label, value, icon }) => (
  <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
    <div className="rounded-xl bg-slate-50 p-3">{icon}</div>
    <div>
      <p className="mb-0.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
        {label}
      </p>
      <p className="text-lg font-black text-slate-900">{value}</p>
    </div>
  </div>
);

const DetailBox = ({ icon, label, value, color = "text-slate-700" }) => (
  <div className="rounded-2xl bg-slate-50/30 p-5">
    <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
      {icon}
      {label}
    </div>
    <p className={`text-sm font-bold ${color}`}>{value}</p>
  </div>
);

export default AdminDashboard;
