import { Navigate } from "react-router-dom";
import Cookies from "js-cookie";

const RoleRoute = ({ allowedRoles, children }) => {
  const token = Cookies.get("token");
  const role = Cookies.get("role");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(role)) {
    return <Navigate to={`/${role}`} replace />;
  }

  return children;
};

export default RoleRoute;
