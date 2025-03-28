"use client";

import { createContext, useContext, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { setUser, setToken, clearState } from "../redux/scoreSlice";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.score);

  useEffect(() => {
    // Initialize user from localStorage if available
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      dispatch(setUser(JSON.parse(savedUser)));
    }

    // Set axios default header if token exists
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
  }, [dispatch, token]);

  useEffect(() => {
    // Update axios default header when token changes
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  }, [token]);

  const login = async (email, password) => {
    try {
      console.log("Sending login request:", { email });

      const res = await axios.post("http://localhost:5001/api/auth/login", { email, password });

      if (res.data && res.data.token && res.data.user) {
        dispatch(setToken(res.data.token));
        dispatch(setUser(res.data.user));
        localStorage.setItem("user", JSON.stringify(res.data.user));
      } else {
        console.error("Login response missing token or user.");
      }
    } catch (err) {
      console.error("Login failed:", err.response?.data || err.message);
      throw err;
    }
  }

  const logout = () => {
    dispatch(clearState());
    localStorage.removeItem("user");
  }

  return <AuthContext.Provider value={{ user, token, login, logout }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext);
