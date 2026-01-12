import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { LogOut, User } from "lucide-react";

const Navbar = () => {
  const navigate = useNavigate();
  const role = Cookies.get("role");

  const handleLogout = () => {
    Cookies.remove("token");
    Cookies.remove("role");

    navigate("/login", { replace: true });
  };

  return (
    <nav className="w-full h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6">
      {/* LEFT */}
      <h1 className="text-lg font-black text-gray-900">
        Store Ratings
      </h1>

      {/* RIGHT */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-gray-600 font-semibold">
          <User size={16} />
          <span className="capitalize">{role}</span>
        </div>

        <button
          onClick={handleLogout}
          className="flex cursor-pointer items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 transition"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
