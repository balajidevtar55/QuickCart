import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";


export const ProtectedRoute = ({ children, roles }) => {
  const navigate = useNavigate();
   console.log("roles",roles)
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (user) {
      const userData = JSON.parse(user);
      const role = userData.role;
      if (roles && !roles.includes(role)) {
        navigate("/unauthorized");
        return;
      }
    }

    // No token → go to login
    if (!token) {
      navigate("/login");
      return;
    }

  
  }, [navigate, roles]);

  return children;
};
