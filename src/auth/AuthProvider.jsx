import { useState, useEffect } from "react";
import AuthContext from "./AuthContext";
import {
  checkSession,
  normalizeUser,
  logoutAPI,
} from "../services/authService";
import { cancelAllRequests } from "../services/requestManager";

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const validateSession = async () => {
      try {
        setLoading(true);

        const res = await checkSession();

        if (isMounted) {
          setUser(res?.logged_in ? normalizeUser(res) : null);
        }
      } catch (err) {
        console.error("Auth error:", err);

        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    validateSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const logout = async () => {
    try {
      cancelAllRequests();
      await logoutAPI();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setUser(null);
      localStorage.clear();
      window.location.href = "/";
    }
  };
  
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, setUser, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;