import { Navigate } from "react-router-dom";
import Cookies from "js-cookie";

/**
 * RoleRoute
 * ------------------------------------------------
 * Protects routes based on authentication and role.
 *
 * Behavior:
 * - Redirects to /login if user is not authenticated
 * - Redirects to role-specific dashboard if role is unauthorized
 *
 * Props:
 * - allowedRoles: array of roles allowed to access the route
 * - children: protected route component
 */
const RoleRoute = ({ allowedRoles, children }) => {
  const token = Cookies.get("token");
  const role = Cookies.get("role");

  // Not authenticated → Login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Authenticated but role not allowed → Redirect to own dashboard
  if (!allowedRoles.includes(role)) {
    return <Navigate to={`/${role}`} replace />;
  }

  // Authorized → Render protected content
  return children;
};

export default RoleRoute;
