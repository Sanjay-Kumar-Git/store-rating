import Navbar from "../components/Navbar";

const DashboardLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />
      <main className="p-6">{children}</main>
    </div>
  );
};

export default DashboardLayout;
