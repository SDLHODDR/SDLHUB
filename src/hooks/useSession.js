// src/hooks/useSession.js
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export function useSession() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BASE_URL}/session_check.php`, {
        withCredentials: true,
      })
      .then((res) => {
        if (res.data?.logged_in) {
          setUser(res.data);
        } else {
          navigate("/login", { replace: true });
        }
      })
      .catch(() => {
        navigate("/login", { replace: true });
      })
      .finally(() => {
        setCheckingSession(false);
      });
  }, [navigate]);

  return { user, checkingSession };
}
