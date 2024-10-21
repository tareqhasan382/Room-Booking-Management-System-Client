"use client";
import { useState, useEffect } from "react";

const useAuth = () => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  // Function to store token and user information
  const login = (authToken, userData) => {
    localStorage.setItem("token", authToken);
    localStorage.setItem("user", JSON.stringify(userData));
    setToken(authToken);
    setUser(userData);
  };

  // Function to clear token and user information
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    // Retrieve token and user data from local storage
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    if (savedToken) {
      setToken(savedToken);
    }
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, [user, token]);
  return {
    token,
    user,
    login,
    logout,
  };
};

// export default useAuth;
