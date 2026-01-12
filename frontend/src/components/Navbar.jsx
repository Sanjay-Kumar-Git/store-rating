import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { LogOut, User } from "lucide-react";

/**
 * Navbar
 * ------------------------------------------------
 * Top navigation bar displayed after login.
 *
 * Features:
 * - Shows application title
 * - Displays logged-in user role
 * - Provides logout functionality
 */
const Navbar = () => {
  const navigate = useNavigate();
  const role = Cookies.get("role") || "user";

  /* ======================================================
     HANDLERS
  ====================================================== */
  const handleLogout = () => {
    // Clear authentication cookies
    Cookies.remove("token");
    Cookies.remove("role");

    // Redirect to login page
    navigate("/login", { replace: true });
  };

  /* ======================================================
     UI
  ====================================================== */
  return (
    <nav className="flex h-16 w-full items-center justify-between border-b border-gray-100 bg-white px-6">
      {/* LEFT: APP TITLE */}
      <h1 className="text-lg font-black text-gray-900">
        Store Ratings
      </h1>

      {/* RIGHT: USER INFO + LOGOUT */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-600">
          <User size={16} />
          <span className="capitalize">{role}</span>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold text-red-600 transition hover:bg-red-50"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
