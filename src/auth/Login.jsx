import { useEffect, useState } from "react";
import { useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login, normalizeUser } from "../services/authService";
import { AuthContext } from "./AuthProvider";
import { LOGOS, IMAGES } from "../assets/assets";
import { getPendingPolicies } from "../services/policyEndorsement";

const Login = () => {

    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [loginCode, setLoginCode] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { setUser } = useContext(AuthContext);

    useEffect(() => {
        document.body.classList.add("login-open");
        return () => document.body.classList.remove("login-open");
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        const trimmedCode = loginCode.trim();

        if (!trimmedCode || !password.trim()) {
            setError("Login code and password are required");
            return;
        }

        try {
            setLoading(true);

            const response = await login({
              login_code: trimmedCode,
              password,
            });

            if (!response?.status) {
              setError(response?.message || "Invalid login");
              return;
            }

           /* if (!response?.csrf_token) {
            setError("Security token missing. Please login again.");
            return;
            }*/

            if (response?.csrf_token) {
              sessionStorage.setItem(
                "csrf_token",
                response.csrf_token
              );
            }
            
            // Store auth data
            localStorage.setItem("user", JSON.stringify(response.user));
            //localStorage.setItem("token", response.token);

            //IMPORTANT: Set user in context
            setUser(normalizeUser(response.user));

            /*
            ====================================
            CHECK MANDATORY PENDING POLICIES
            ====================================
            */

            try {
                const policyRes = await getPendingPolicies();

               if (
                  policyRes?.status &&
                  Array.isArray(policyRes?.policies) &&
                  policyRes.policies.length > 0
                ){  sessionStorage.setItem(
                    "HAS_PENDING_POLICY",
                    "true"
                     );

                    navigate(
                      "/policy-acceptance",
                      {
                        replace: true,
                      }
                    );
                    return;
                  }

                sessionStorage.removeItem(
                  "HAS_PENDING_POLICY"
                );

                navigate("/eportal/dashboard", {
                  replace: true,
                });

            } catch (err) {
              console.error(
                "Policy verification failed",
                err
              );

               setError(
                  "Unable to verify policy acceptance. Please try again."
                );

                return;
            }

          } catch (err) {
            console.error("Login error:", err);
            setError(
            err?.response?.data?.message || "Server error. Please try again."
            );
        } finally {
            setLoading(false);
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
                    <img
                        src={LOGOS.MAIN}
                        alt="Logo"
                        className="login-logo"
                    />
                </div>

                <div className="login-userheading mb-4">
                  <h3>Sign In</h3>
                  <h4>
                    Access the SDL modules using your email and password.
                  </h4>
                </div>

                {/* Employee Code */}
                <div className="mb-3">
                  <label className="form-label">Employee Code</label>
                  <div className="input-group">
                    <input
                        type="text"
                        className="form-control border-end-0"
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
                        <input                     
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter password"
                            className="pass-input form-control"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />                   
                        <span role="button" tabIndex={0}
                            className="ti toggle-password text-gray-9"
                            onClick={() => setShowPassword(!showPassword)}
                            >
                            <i className={`ti ${showPassword ? "ti-eye" : "ti-eye-off"}`} />
                        </span>
                    </div>
                </div>

                {/* Remember + Forgot */}
                <div className="form-login authentication-check">
                  <div className="row">
                    <div className="col-6">
                      <label className="checkboxs ps-4 mb-0 pb-0 line-height-1">
                        <input type="checkbox" />
                        <span className="checkmarks"></span>
                        Remember me
                      </label>
                    </div>
                    <div className="col-6 text-end">                     
                        <Link
                            className="forgot-link"
                            to={"/forgot-password"}>                            
                            Forgot Password?
                        </Link>
                    </div>
                  </div>
                </div>
                 {/* ERROR */}
                {error && (
                  <div className="alert alert-danger py-2">
                    {error}
                  </div>
                )}

                {/* Submit */}
                <div className="form-login mt-3">                  
                     <button
                        type="submit"
                        className="btn btn-login w-100"
                        disabled={loading}>

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
            <img
                src={IMAGES.AUTHENTICATION}
                alt="Login visual"
            />
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;