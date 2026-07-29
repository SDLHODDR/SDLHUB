import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import "../assets/css/PolicyAcceptance.css";

import { notifyError } from "../services/alertService";

import {
  getPendingPolicies,
  acceptPolicy,
} from "../services/policyEndorsement";

const PolicyAcceptance = () => {
  const navigate = useNavigate();

  /* ======================================================
      STATE
  ====================================================== */

  const [policies, setPolicies] = useState([]);
  const [policyCount, setPolicyCount] = useState(0);

  const [currentIndex, setCurrentIndex] = useState(0);

  const [loading, setLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);

  const [checked, setChecked] = useState(false);

  const [selectedDate] = useState(new Date());

  const HRMS_DOC_BASE_URL =
    import.meta.env.VITE_HRMS_DOC_BASE_URL;

  const [isMobile, setIsMobile] = useState(
    window.innerWidth < 768,
  );

  /* ======================================================
      BODY CLASS
  ====================================================== */

  useEffect(() => {
    document.body.classList.add("policy-layout");

    return () => {
      document.body.classList.remove("policy-layout");
    };
  }, []);

  /* ======================================================
      LOAD PENDING POLICIES
  ====================================================== */

  const loadPendingPolicies = useCallback(async () => {
    try {
      setLoading(true);

      const res = await getPendingPolicies();

      if (res?.status) {
        const { count = 0, policies = [] } = res.data || {};

        setPolicies(policies);
        setPolicyCount(count);

        setCurrentIndex(0);
        setChecked(false);

        if (count === 0) {
          sessionStorage.removeItem("HAS_PENDING_POLICY");

          navigate("/eportal/dashboard", {
            replace: true,
          });

          return;
        }

        sessionStorage.setItem("HAS_PENDING_POLICY", "true");
      } else {
        notifyError(
          res?.message ||
            "Unable to load pending policies.",
        );
      }
    } catch (err) {
      console.error(err);

      notifyError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load pending policies.",
      );
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  /* ======================================================
      INITIAL LOAD
  ====================================================== */

  useEffect(() => {
    loadPendingPolicies();
  }, [loadPendingPolicies]);

  /* ======================================================
      MOBILE CHECK
  ====================================================== */

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener(
      "resize",
      handleResize,
    );

    return () => {
      window.removeEventListener(
        "resize",
        handleResize,
      );
    };
  }, []);

  /* ======================================================
      CURRENT POLICY
  ====================================================== */

  const currentPolicy = policies[currentIndex];

  /* ======================================================
      ACCEPT POLICY
  ====================================================== */

  const handleAccept = async () => {
    try {
      if (!checked) {
        notifyError(
          "Please confirm policy acceptance.",
        );
        return;
      }

      if (!currentPolicy?.POLI_ID) {
        return;
      }

      setBtnLoading(true);

      const res = await acceptPolicy({
        policy_id: currentPolicy.POLI_ID,
      });

      if (res?.status) {
        setChecked(false);

        const nextIndex = currentIndex + 1;

        if (nextIndex < policyCount) {
          setCurrentIndex(nextIndex);
        } else {
          await loadPendingPolicies();
        }
      } else {
        notifyError(
          res?.message ||
            "Failed to accept policy.",
        );
      }
    } catch (error) {
      console.error(error);

      notifyError(
        error?.response?.data?.message ||
          error?.message ||
          "Something went wrong.",
      );
    } finally {
      setBtnLoading(false);
    }
  };

  /* ======================================================
      LOADING
  ====================================================== */

  if (loading) {
    return (
      <div className="vh-100 d-flex justify-content-center align-items-center">
        <div className="text-center">
          <div
            className="spinner-border text-primary mb-3"
            role="status"
          />
          <h6>Loading Policies...</h6>
        </div>
      </div>
    );
  }

  /* ======================================================
      NO POLICY
  ====================================================== */

  if (!currentPolicy) {
    return null;
  }

  return (
  <>
    <div className="policy-page">
      <div className="policy-card">
        <div className="container-fluid bg-light min-vh-100 d-flex flex-column p-0">

          {/* ======================================================
              HEADER
          ====================================================== */}

          <div className="bg-primary text-white shadow-sm px-4 py-3">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2">
              <div>
                <h4 className="mb-0 fw-bold">Policy Acceptance</h4>

                <small>
                  Mandatory policies must be accepted before accessing ePortal
                </small>
              </div>

              <div className="text-end">
                <div className="fw-semibold">
                  Policy {currentIndex + 1} of {policyCount}
                </div>

                <div
                  className="progress mt-2"
                  style={{
                    width: "180px",
                    height: "6px",
                  }}
                >
                  <div
                    className="progress-bar"
                    role="progressbar"
                    style={{
                      width: `${
                        policyCount
                          ? ((currentIndex + 1) / policyCount) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ======================================================
              BODY
          ====================================================== */}

          <div
            className="flex-grow-1 d-flex flex-column p-3"
            style={{ minHeight: 0 }}
          >

            {/* ======================================================
                PDF VIEWER
            ====================================================== */}

            <div className="card shadow-sm border-0 overflow-hidden mb-3 pdf-card">
              <div className="card-header bg-white d-flex justify-content-between align-items-center">
                <h6 className="mb-0 fw-bold">Policy Document</h6>

                {currentPolicy?.DOC_PATH && (
                  <a
                    href={`${HRMS_DOC_BASE_URL}${encodeURI(
                      currentPolicy.DOC_PATH
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-decoration-none fw-semibold"
                  >
                    Open Fullscreen
                  </a>
                )}
              </div>

              <div
                className="card-body p-0"
                style={{
                  height: "calc(100% - 57px)",
                }}
              >
                {currentPolicy?.DOC_PATH ? (
                  isMobile ? (
                    <div className="h-100 d-flex flex-column justify-content-center align-items-center p-4">
                      <i
                        className="bi bi-file-earmark-pdf text-danger mb-3"
                        style={{
                          fontSize: "4rem",
                        }}
                      />

                      <h6 className="mb-2">
                        Policy Document
                      </h6>

                      <p className="text-muted text-center mb-3">
                        Click below to view the policy
                        document.
                      </p>

                      <a
                        href={`${HRMS_DOC_BASE_URL}${encodeURI(
                          currentPolicy.DOC_PATH
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-primary"
                      >
                        View Document
                      </a>
                    </div>
                  ) : (
                    <iframe
                      title="Policy Document"
                      src={`${HRMS_DOC_BASE_URL}${encodeURI(
                        currentPolicy.DOC_PATH
                      )}`}
                      width="100%"
                      height="100%"
                      style={{
                        border: "none",
                        display: "block",
                      }}
                    />
                  )
                ) : (
                  <div className="h-100 d-flex justify-content-center align-items-center text-muted">
                    No document available.
                  </div>
                )}
              </div>
            </div>

            {/* ======================================================
                ACCEPTANCE SECTION
            ====================================================== */}

            <div className="card shadow-sm border-0">
              <div className="card-body">
                <div className="row align-items-center">

                  {/* Left */}

                  <div className="col-lg-5">

                    <span className="badge bg-info mb-2">
                      COMPANY POLICY
                    </span>

                    <h5
                      className="fw-bold mb-2 text-truncate"
                      title={currentPolicy.POLICY_NAME}
                    >
                      {currentPolicy.POLICY_NAME}
                    </h5>

                    <div className="d-flex flex-wrap small text-muted mb-2">
                      <div className="me-4">
                        <strong>Effective:</strong>{" "}
                        {currentPolicy.START_DATE || "-"}
                      </div>

                      <div>
                        <strong>Valid Till:</strong>{" "}
                        {currentPolicy.END_DATE || "-"}
                      </div>
                    </div>

                    {currentPolicy.POLICY_DESC && (
                      <p
                        className="text-muted small mb-0"
                        style={{
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {currentPolicy.POLICY_DESC}
                      </p>
                    )}
                  </div>

                  {/* Center */}

                  <div className="col-lg-4 my-3 my-lg-0">
                    <div className="border rounded p-3 bg-light acknowledgement-box">
                      <div className="form-check">
                        <input
                          id="policyAccept"
                          className="form-check-input"
                          type="checkbox"
                          checked={checked}
                          onChange={(e) =>
                            setChecked(e.target.checked)
                          }
                        />

                        <label
                          htmlFor="policyAccept"
                          className="form-check-label"
                        >
                          <strong>
                            Policy Acknowledgement
                          </strong>

                          <div className="small text-muted mt-1">
                            I have read, understood and
                            accepted this company policy
                            and agree to comply with it.
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Right */}

                  <div className="col-lg-3 text-center text-lg-end mt-3 mt-lg-0">

                    <div className="alert policy-warning mb-3">
                      Access to ePortal remains restricted
                      until all mandatory policies are
                      accepted.
                    </div>

                    <button
                      onClick={handleAccept}
                      disabled={!checked || btnLoading}
                      className="btn btn-primary px-4 policy-btn"
                    >
                      {btnLoading
                        ? "Processing..."
                        : currentIndex + 1 === policyCount
                        ? "Accept & Continue"
                        : "Accept & Next"}
                    </button>

                  </div>

                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  </>
);

};

export default PolicyAcceptance;