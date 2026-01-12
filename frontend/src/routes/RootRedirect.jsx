import { Navigate } from "react-router-dom";
import Cookies from "js-cookie";

const RootRedirect = () => {
  const token = Cookies.get("token");
  const role = Cookies.get("role");

  if (!token || !role) {
    Cookies.remove("token");
    Cookies.remove("role");
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={`/${role}`} replace />;
};

export default RootRedirect;
