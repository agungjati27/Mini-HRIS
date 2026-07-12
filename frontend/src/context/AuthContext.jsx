import { useState } from "react";
import { AuthContext } from "./AuthContextValue";
import { supabase } from "../services/supabase";
import { normalizeRole } from "../utils/auth";

const normalizeUser = (user) => {
  if (!user) return null;

  const normalizedRole = normalizeRole(user.role ?? user.user?.role);
  const nextUser = {
    ...user,
    role: normalizedRole,
  };

  if (user.user) {
    nextUser.user = {
      ...user.user,
      role: normalizeRole(user.user.role),
    };
  }

  return nextUser;
};

const getStoredUser = () => {
  const token = localStorage.getItem("token");
  const userData = localStorage.getItem("user");

  if (!token || !userData) {
    return null;
  }

  try {
    return normalizeUser(JSON.parse(userData));
  } catch {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return null;
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser);

  const login = (data) => {
    const nextUser = normalizeUser(data.user);

    localStorage.setItem("token", data.session.access_token);
    localStorage.setItem("user", JSON.stringify(nextUser));
    setUser(nextUser);
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
    }
  };

  const updateUser = (updates) => {
    setUser((current) => {
      const nextUser = normalizeUser({
        ...(current || {}),
        ...updates,
      });

      localStorage.setItem("user", JSON.stringify(nextUser));
      return nextUser;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        updateUser,
        loading: false,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
