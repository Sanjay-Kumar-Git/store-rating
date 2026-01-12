import Navbar from "../components/Navbar";

/**
 * DashboardLayout
 * ------------------------------------------------
 * Shared layout for all authenticated dashboard pages.
 *
 * Features:
 * - Persistent top navigation bar
 * - Consistent background and spacing
 *
 * Props:
 * - children: React nodes rendered inside the layout
 */
const DashboardLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Top Navigation */}
      <Navbar />

      {/* Page Content */}
      <main className="p-6">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
