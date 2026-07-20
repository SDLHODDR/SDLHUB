import { useEffect, useState, useRef } from "react";
import { getActivePolicies } from "../../services/policyService";
import BreadcrumbNav from "../breadcrumb-nav/BreadcrumbNav";

import { POLICY_MESSAGES } from "../../constants/policies-documentsConstants";

const Policies = () => {
  const hasFetched = useRef(false);

  const [policies, setPolicies] = useState([]);
  const [selectedPolicy, setSelectedPolicy] = useState(null);

  const [loading, setLoading] = useState(true);
  const [pdfLoading, setPdfLoading] = useState(false);

  /* ================= FETCH POLICIES ================= */

  const fetchPolicies = async () => {
    try {
      const res = await getActivePolicies();

      if (res?.status) {
        const policyList = res.data || [];

        setPolicies(policyList);

        if (policyList.length > 0) {
          setPdfLoading(true);
          setSelectedPolicy(policyList[0]);
        }
      } else {
        setPolicies([]);
      }
    } catch (error) {
      console.error("Policy fetch error:", error);
      setPolicies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hasFetched.current) return;

    hasFetched.current = true;
    fetchPolicies();
  }, []);

  useEffect(() => {
    if (!pdfLoading) return;

    const timer = setTimeout(() => {
      setPdfLoading(false);
    }, 4000);

    return () => clearTimeout(timer);
  }, [pdfLoading]);

  return (
    <>
      {/* ================= PAGE HEADER ================= */}

      <div className="page-header">
        <div className="add-item d-flex">
          <div className="page-title">
            <h4>Policies</h4>
          </div>
        </div>

        <BreadcrumbNav
          items={[
            { text: "Home", link: "/eportal/dashboard" },
            { text: "Policies" },
          ]}
        />
      </div>

      {/* ================= MAIN CARD ================= */}

      <div className="card">
        <div className="card-body">
          <div className="row">
            {/* ================= LEFT SIDE POLICY LIST ================= */}

            <div className="col-xl-3 border-end">
              <nav className="nav flex-column nav-tabs nav-style-5">
                {loading && (
                  <div className="p-3 text-muted">
                    {POLICY_MESSAGES.LOADING}
                  </div>
                )}

                {!loading && policies.length === 0 && (
                  <div className="p-3 text-muted">
                    {POLICY_MESSAGES.NO_POLICIES}
                  </div>
                )}

                {policies.map((policy) => (
                  <button
                    key={policy.policyId}
                    type="button"
                    className={`nav-link text-start mb-2 ${
                      selectedPolicy?.policyId === policy.policyId
                        ? "active"
                        : ""
                    }`}
                    onClick={() => {
                      if (selectedPolicy?.previewUrl !== policy.previewUrl) {
                        setPdfLoading(true);
                        setSelectedPolicy(policy);
                      }
                    }}
                  >
                    <div className="fw-semibold">{policy.policyName}</div>

                    <small className="text-muted">{policy.startDate}</small>
                  </button>
                ))}
              </nav>
            </div>

            {/* ================= RIGHT SIDE PDF PREVIEW ================= */}

            <div className="col-xl-9 d-flex flex-column">
              <h6 className="mb-3">Policy Preview</h6>

              {selectedPolicy ? (
                <div className="position-relative flex-grow-1">
                  {pdfLoading && (
                    <div
                      className="position-absolute top-50 start-50 translate-middle"
                      style={{ zIndex: 10 }}
                    >
                      <div
                        className="spinner-border text-warning"
                        role="status"
                      />
                    </div>
                  )}

                  <iframe
                    key={selectedPolicy.previewUrl}
                    src={`${selectedPolicy.previewUrl}#toolbar=1&navpanes=0`}
                    title="Policy Preview"
                    width="100%"
                    onLoad={() => {
                      console.log("iframe loaded");
                      setPdfLoading(false);
                    }}
                    style={{
                      height: "85vh",
                      border: "1px solid #ddd",
                      borderRadius: "6px",
                      opacity: pdfLoading ? 0 : 1,
                      transition: "opacity .3s",
                    }}
                  />

                </div>
              ) : (
                <div
                  className="d-flex align-items-center justify-content-center flex-grow-1"
                  style={{
                    minHeight: "85vh",
                    border: "1px solid #ddd",
                    borderRadius: "6px",
                    background: "#fafafa",
                  }}
                >
                  <div className="text-center text-muted">
                    <i
                      className="bx bx-file"
                      style={{
                        fontSize: "48px",
                        marginBottom: "10px",
                      }}
                    ></i>

                    <h6 className="mb-1">{POLICY_MESSAGES.NO_PREVIEW}</h6>

                    <small>{POLICY_MESSAGES.NO_ACTIVE_POLICY}</small>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Policies;
