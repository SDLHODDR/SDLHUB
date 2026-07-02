import { createContext, useState, useEffect, useRef } from "react";
import { checkSession, normalizeUser, logoutAPI } from "../services/authService";
import { cancelAllRequests } from "../services/requestManager";

export const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  let isMounted = true;

  const validateSession = async () => {
    try {
      setLoading(true);

      const res = await checkSession();

      if (res?.logged_in) {
        if (isMounted) {
          setUser(normalizeUser(res));
        }
      } else {
        if (isMounted) {
          setUser(null);
        }
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
  
  /* ---------------------------
     LOGOUT
  ---------------------------- */
  const logout = async () => {
    try {      
      cancelAllRequests(); // cancel all running APIs
      await logoutAPI();   // destroy PHP session
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setUser(null);
      // Clear all local storage
      localStorage.clear();

      // Redirect to login page
      window.location.href = "/";
    }
  };

  /* ---------------------------
     LOADING STATE
  ---------------------------- */
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
