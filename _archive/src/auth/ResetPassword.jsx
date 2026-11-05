import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { resetPassword } from "../services/authService";

import {
  notifySuccess,
  notifyError,
} from "../services/alertService";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    if (!token) {
      notifyError("Invalid or expired reset link.");
      return;
    }

    if (!password.trim()) {
      notifyError("Password is required.");
      return;
    }

    try {
      setLoading(true);

      const res = await resetPassword({
        token,
        new_password: password,
      });

      if (!res?.success) {
        notifyError(res?.message || "Failed to reset password.");
        return;
      }

      notifySuccess("Password updated successfully.");

      navigate("/login", { replace: true });

    } catch (err) {
      notifyError(
        err?.response?.data?.message ||
          "Invalid or expired reset link."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Reset Password</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="Enter new password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          required
        />

        <button
          type="submit"
          disabled={loading}
        >
          {loading ? "Updating..." : "Update Password"}
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;