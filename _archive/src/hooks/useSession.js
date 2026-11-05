import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { checkSession } from "../services/authService";

export function useSession() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    const verifySession = async () => {
      try {
        const res = await checkSession();

        if (res?.status && res?.data?.logged_in) {
          setUser(res.data);
        } else {
          navigate("/login", { replace: true });
        }
      } catch (err) {
        navigate("/login", { replace: true });
      } finally {
        setCheckingSession(false);
      }
    };

    verifySession();
  }, [navigate]);

  return { user, checkingSession };
}
