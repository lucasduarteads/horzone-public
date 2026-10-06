import { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { isSessionTokenValid, useAuth } from "../contexts/AuthContext";

export default function PrivateRoute() {
  const { token, logout } = useAuth();
  const isValid = isSessionTokenValid(token);

  useEffect(() => {
    if (token && !isValid) logout();
  }, [token, isValid, logout]);

  return isValid ? <Outlet /> : <Navigate to="/login" replace />;
}
