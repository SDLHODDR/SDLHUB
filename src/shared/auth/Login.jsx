import { useContext, useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getCaptcha, login, normalizeUser } from "../services/authService";
import AuthContext from "./AuthContext";
import { LOGOS, IMAGES } from "../assets/assets";
import { getPendingPolicies } from "../services/policyEndorsement";
import { API_MESSAGES } from "../services/apiMessages";

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loginCode, setLoginCode] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(() =>
    new URLSearchParams(window.location.search).get("session") === "expired"
      ? API_MESSAGES.UNAUTHORIZED
      : "",
  );
  const [loading, setLoading] = useState(false);
  const [captcha, setCaptcha] = useState("");
  const [captchaImage, setCaptchaImage] = useState("");
  const [captchaLoading, setCaptchaLoading] = useState(true);
  const { setUser } = useContext(AuthContext);

  // Each image can be used for one login attempt only, so a new one is
  // loaded after every failed attempt.
  const requestCaptcha = () =>
    getCaptcha()
      .then((res) => setCaptchaImage(res?.status ? res.data?.image || "" : ""))
      .catch(() => setCaptchaImage(""))
      .finally(() => setCaptchaLoading(false));

  const loadCaptcha = () => {
    setCaptcha("");
    setCaptchaLoading(true);
    requestCaptcha();
  };

  useEffect(() => {
    requestCaptcha();
    // Runs once, on opening the login page.
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const trimmedCode = loginCode.trim();

    if (!trimmedCode || !password.trim()) {
      setError("Login code and password are required");
      return;
    }

    if (!captcha.trim()) {
      setError("Please enter the captcha.");
      return;
    }

    let loggedIn = false;

    try {
      setLoading(true);

      const response = await login({
        login_code: trimmedCode,
        password,
        captcha: captcha.trim(),
      });

      if (!response?.status) {
        setError(response?.message || "Invalid login");
        return;
      }

      loggedIn = true;

      const { user, csrf_token } = response.data || {}; //redirect

      if (csrf_token) {
        //sessionStorage.setItem("csrf_token", csrf_token);
        localStorage.setItem("csrf_token", csrf_token);
      }

      const normalizedUser = normalizeUser(user);

      // Store auth data
      localStorage.setItem("user", JSON.stringify(normalizedUser));

      // Set user in context
      setUser(normalizedUser);

      // Optional: redirect
      // navigate(redirect || "/eportal/dashboard");

      /*
      ====================================
      CHECK MANDATORY PENDING POLICIES
      ====================================
      */

      try {
        const policyRes = await getPendingPolicies();

        if (!policyRes?.status) {
          setError(policyRes?.message || "Unable to verify policy acceptance.");
          return;
        }

        const { count = 0, policies = [] } = policyRes.data || {};

        if (count > 0 && policies.length > 0) {
          sessionStorage.setItem("HAS_PENDING_POLICY", "true");

          navigate("/policy-acceptance", {
            replace: true,
          });

          return;
        }

        sessionStorage.removeItem("HAS_PENDING_POLICY");

        navigate("/eportal/dashboard", {
          replace: true,
        });
      } catch (err) {
        console.error("Policy verification failed", err);

        setError(
          err?.response?.data?.message ||
          err?.message ||
          "Unable to verify policy acceptance. Please try again."
        );

        return;
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(
        err?.response?.data?.message || "Server error. Please try again.",
      );
    } finally {
      setLoading(false);
      if (!loggedIn) loadCaptcha();
    }
  };

  return (
    <div className="account-content">
      <div className="row login-wrapper m-0">
        {/* LEFT LOGIN FORM */}
        <div className="col-lg-6 p-0">
          <div className="login-content">
            <form autoComplete="off" onSubmit={handleSubmit}>
              <div className="login-userset">
                <div className="login-logo logo-normal mb-3">
                  <img src={LOGOS.MAIN} alt="Logo" className="login-logo" />
                </div>

                <div className="login-userheading mb-4">
                  <h3>Sign In</h3>
                  <h4>Access the SDL modules using your email and password.</h4>
                </div>

                {/* Employee Code */}
                <div className="mb-3">
                  <label className="form-label">Employee Code</label>
                  <div className="input-group">
                    <input name="username"
                      type="text"
                      className="form-control"
                      placeholder="Enter employee code"
                      value={loginCode}
                      onChange={(e) => setLoginCode(e.target.value)}
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="mb-3">
                  <label className="form-label">Password</label>
                  <div className="pass-group">
                    <input name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter password"
                      className="pass-input form-control"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <span
                      role="button"
                      tabIndex={0}
                      className="ti toggle-password text-gray-9"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <i
                        className={`ti ${showPassword ? "ti-eye" : "ti-eye-off"}`}
                      />
                    </span>
                  </div>
                </div>

                {/* Captcha: image, refresh and code on one line */}
                <div className="mb-3 d-flex align-items-center justify-content-center gap-2">
                  <div
                    className="rounded bg-white d-flex align-items-center justify-content-center flex-shrink-0 overflow-hidden"
                    style={{ width: 160, height: 48 }}
                  >
                    {captchaLoading ? (
                      <span className="spinner-border spinner-border-sm" role="status" />
                    ) : captchaImage ? (
                      <img
                        src={captchaImage}
                        alt="Captcha code"
                        width={160}
                        height={48}
                        className="rounded"
                        draggable={false}
                      />
                    ) : (
                      <small className="text-danger px-2 text-center">
                        Unable to load captcha
                      </small>
                    )}
                  </div>
                  <button
                    type="button"
                    className="btn btn-link text-secondary p-0 lh-1 flex-shrink-0 text-decoration-none"
                    style={{ fontSize: 22 }}
                    onClick={loadCaptcha}
                    disabled={captchaLoading || loading}
                    title="Get a new captcha"
                    aria-label="Get a new captcha"
                  >
                    <i className="ti ti-refresh" />
                  </button>
                  <input
                    id="login-captcha"
                    name="captcha"
                    type="text"
                    className="form-control border-0 shadow-none text-center fw-semibold flex-shrink-0"
                    style={{
                      width: 130,
                      height: 48,
                      background: "#e8f0fe",
                      letterSpacing: "0.3em",
                      fontSize: 18,
                    }}
                    placeholder="CODE"
                    aria-label="Captcha code"
                    value={captcha}
                    maxLength={5}
                    autoComplete="off"
                    autoCapitalize="characters"
                    spellCheck={false}
                    onChange={(e) => setCaptcha(e.target.value.toUpperCase())}
                  />
                </div>

                {/* Forgot password */}
                <div className="form-login authentication-check">
                  <div className="row">
                    <div className="col-12 text-end">
                      <Link className="forgot-link" to={"/forgot-password"}>
                        Forgot Password?
                      </Link>
                    </div>
                  </div>
                </div>
                {/* ERROR */}
                {error && (
                  <div className="alert alert-danger py-2">{error}</div>
                )}

                {/* Submit */}
                <div className="form-login mt-3">
                  <button
                    type="submit"
                    className="btn btn-login w-100"
                    disabled={loading}
                  >
                    {loading && (
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                      />
                    )}
                    {loading ? "Signing In..." : "Sign In"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* RIGHT IMAGE */}
        <div className="col-lg-6 p-0">
          <div className="login-img">
            <img src={IMAGES.AUTHENTICATION} alt="Login visual" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
