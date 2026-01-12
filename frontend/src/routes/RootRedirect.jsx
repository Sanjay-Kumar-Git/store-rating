import { Navigate } from "react-router-dom";
import Cookies from "js-cookie";

/**
 * RootRedirect
 * ---------------------------------------
 * Handles redirection from the root path (/).
 *
 * Behavior:
 * - If user is NOT authenticated → clears cookies and redirects to /login
 * - If user IS authenticated → redirects to role-based dashboard
 *
 * This prevents users from landing on a blank root route.
 */
const RootRedirect = () => {
  const token = Cookies.get("token");
  const role = Cookies.get("role");

  // Invalid or missing auth state → reset session
  if (!token || !role) {
    Cookies.remove("token");
    Cookies.remove("role");

    return <Navigate to="/login" replace />;
  }

  // Valid session → redirect to role dashboard
  return <Navigate to={`/${role}`} replace />;
};

export default RootRedirect;
