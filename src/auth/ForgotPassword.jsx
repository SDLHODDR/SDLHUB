import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  forgotPassword,
  verifyOtp,
  resetPassword,
} from "../services/authService";
import { LOGOS, IMAGES } from "../assets/assets";

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1=empCode, 2=otp, 3=reset
  const [empCode, setEmpCode] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);
  const [timer, setTimer] = useState(60);

  const handleOtpChange = (value, index) => {
  if (!/^\d?$/.test(value)) return; // only numbers

  const newOtp = [...otpValues];
  newOtp[index] = value;
  setOtpValues(newOtp);

  // move to next input
  if (value && index < 5) {
    inputRefs.current[index + 1].focus();
  }
};

const handleKeyDown = (e, index) => {
  if (e.key === "Backspace" && !otpValues[index] && index > 0) {
    inputRefs.current[index - 1].focus();
  }
};


  // -------------------------
  // CLEAR MESSAGES HELPER
  // -------------------------
  const clearMessages = () => {
    setMessage("");
    setError("");
  };

  // -------------------------
  // STEP 1 - SEND OTP
  // -------------------------
  const handleSendOtp = async (e) => {
    e.preventDefault();
    clearMessages();

    if (!empCode.trim()) {
      setError("Employee Code is required");
      return;
    }

    try {
      setLoading(true);

      const res = await forgotPassword({
        emp_code: empCode.trim(),
      });

      if (!res?.status) {
        setError(res?.message || "Failed to send OTP");
        return;
      }

      setMessage("OTP sent to your registered mobile number.");
      setStep(2);
      setTimer(60);

    } catch (err) {
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // -------------------------
  // STEP 2 - VERIFY OTP
  // -------------------------
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    clearMessages();

    const otp = otpValues.join("");

    if (otp.length !== 6) {
      setError("Please enter complete 6 digit OTP");
      return;
    }


    try {
      setLoading(true);

      const res = await verifyOtp({
        emp_code: empCode,
        otp: otp,
      });

      if (!res?.status) {
        setError(res?.message || "Invalid OTP");
        return;
      }

      setMessage("OTP verified successfully.");
      setStep(3);

    } catch (err) {
      setError("OTP verification failed.sddsadasd"+err);
    } finally {
      setLoading(false);
    }
  };

  // -------------------------
  // STEP 3 - RESET PASSWORD
  // -------------------------
  const handleResetPassword = async (e) => {
    e.preventDefault();
    clearMessages();

    if (!newPassword || !confirmPassword) {
      setError("All fields are required");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const res = await resetPassword({
        emp_code: empCode,
        password: newPassword,
      });

      if (!res?.status) {
        setError(res?.message || "Reset failed");
        return;
      }

      setMessage("Password reset successfully. Redirecting...");
      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (err) {
      setError("Server error");
    } finally {
      setLoading(false);
    }
  };

  // -------------------------
  // RESEND TIMER
  // -------------------------
  useEffect(() => {
    let interval;
    if (step === 2 && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  return (
    <>
  <div className="main-wrapper">
    <div className="account-content">
      <div className="row login-wrapper m-0">

        {/* LEFT SIDE */}
        <div className="col-lg-6 p-0">
          <div className="login-content">
            <form
              onSubmit={
                step === 1
                  ? handleSendOtp
                  : step === 2
                  ? handleVerifyOtp
                  : handleResetPassword
              }
            >
              <div className="login-userset">

                {/* LOGO */}
                <div className="login-logo logo-normal">
                  <img src={LOGOS.MAIN} alt="logo" />
                </div>

                {/* HEADING */}
                <div className="login-userheading">
                  {step === 1 && (
                    <>
                      <h3>Forgot Password?</h3>
                      <h4>Enter your employee code to receive OTP</h4>
                    </>
                  )}

                  {step === 2 && (
                    <>
                      <h3>Verify OTP</h3>
                      <h4>Enter OTP sent to your registered mobile</h4>
                    </>
                  )}

                  {step === 3 && (
                    <>
                      <h3>Reset Password</h3>
                      <h4>Create a new secure password</h4>
                    </>
                  )}
                </div>

                {/* STEP 1 - EMP CODE */}
                {step === 1 && (
                  <div className="mb-3">
                    <label className="form-label">
                      Employee Code <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter Employee Code"
                      value={empCode}
                      onChange={(e) => setEmpCode(e.target.value)}
                    />
                  </div>
                )}

                {/* STEP 2 - OTP */}
                {step === 2 && (
                  <div className="mb-3 text-center">
                    <label className="form-label d-block">
                      Enter OTP <span className="text-danger">*</span>
                    </label>

                    <div className="d-flex justify-content-center gap-2 mt-2">
                      {otpValues.map((digit, index) => (
                        <input
                          key={index}
                          type="text"
                          maxLength="1"
                          className="form-control text-center otp-input"
                          style={{
                            width: "45px",
                            height: "50px",
                            fontSize: "18px",
                            fontWeight: "600"
                          }}
                          value={digit}
                          onChange={(e) =>
                            handleOtpChange(e.target.value, index)
                          }
                          onKeyDown={(e) =>
                            handleKeyDown(e, index)
                          }
                          ref={(el) => (inputRefs.current[index] = el)}
                        />
                      ))}
                    </div>

                    <div className="text-center mt-3">
                      {timer > 0 ? (
                        <small className="text-muted">
                          Resend OTP in {timer}s
                        </small>
                      ) : (
                        <button
                          type="button"
                          className="btn btn-link p-0"
                          onClick={handleSendOtp}
                        >
                          Resend OTP
                        </button>
                      )}
                    </div>
                  </div>
                )}


                {/* STEP 3 - RESET PASSWORD */}
                {step === 3 && (
                  <>
                    <div className="mb-3">
                      <label className="form-label">
                        New Password <span className="text-danger">*</span>
                      </label>
                      <input
                        type="password"
                        className="form-control"
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">
                        Confirm Password <span className="text-danger">*</span>
                      </label>
                      <input
                        type="password"
                        className="form-control"
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) =>
                          setConfirmPassword(e.target.value)
                        }
                      />
                    </div>
                  </>
                )}

                {/* ALERTS */}
                {error && (
                  <div className="alert alert-danger py-2">
                    {error}
                  </div>
                )}

                {!error && message && (
                  <div className="alert alert-success py-2">
                    {message}
                  </div>
                )}

                {/* BUTTON */}
                <div className="form-login">
                  <button
                    type="submit"
                    className="btn btn-login w-100"
                    disabled={loading}
                  >
                    {loading
                      ? "Please wait..."
                      : step === 1
                      ? "Send OTP"
                      : step === 2
                      ? "Verify OTP"
                      : "Reset Password"}
                  </button>
                </div>

                {/* RETURN */}
                <div className="signinform text-center mt-3">
                  <h4>
                    Return to
                    <Link to="/login" className="hover-a">
                      {" "}login{" "}
                    </Link>
                  </h4>
                </div>

              </div>
            </form>
          </div>
        </div>

        {/* RIGHT SIDE IMAGE */}
        <div className="col-lg-6 p-0">
          <div className="login-img">
            <img
              src={IMAGES.AUTHENTICATION03}
              alt="auth"
              className="img-fluid"
            />
          </div>
        </div>

      </div>
    </div>
  </div>
</>

  );
};

export default ForgotPassword;
