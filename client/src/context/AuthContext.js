"use client";

import { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user")
    return savedUser ? JSON.parse(savedUser) : null
  });
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token)
      // Set axios default header
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
    } else {
      localStorage.removeItem("token")
      // Remove axios default header
      delete axios.defaults.headers.common["Authorization"]
    }
  }, [token]);

  const login = async (email, password) => {
    setLoading(true)
    try {
      const res = await axios.post("http://localhost:5001/api/auth/login", { email, password })

      if (res.data && res.data.token && res.data.user) {
        setToken(res.data.token)
        setUser(res.data.user)
        localStorage.setItem("token", res.data.token)
        localStorage.setItem("user", JSON.stringify(res.data.user))

        // Set axios default header
        axios.defaults.headers.common["Authorization"] = `Bearer ${res.data.token}`
      } else {
        console.error("Login response missing token or user.")
      }
    } catch (err) {
      console.error("Login failed:", err.response?.data || err.message)
      throw err // Re-throw to allow handling in the component
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    setToken("")
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    // Remove axios default header
    delete axios.defaults.headers.common["Authorization"]
  }

  // Set default axios header when component mounts if token exists
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
    }
  }, [token]);

  return <AuthContext.Provider value={{ user, token, login, logout, loading }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext);
