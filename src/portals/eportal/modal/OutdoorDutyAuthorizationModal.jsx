import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { getGpAttdData, authGPData, rejectGPData } from "../services/outdoorDutyService";
import { notifyError, notifySuccess } from "../../../services/alertService";
import SDLAuthorizationActionButtons from "../../../components/SDLAuthorizationActionButtons";

const FILE_BASE_URL = import.meta.env.VITE_FILE_BASE_URL || "";

const OutdoorDutyAuthorizationModal = ({
  outddorduty,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const OUT_TYPE_LABELS = {
    OI: "In/Out same day",
    OD: "Out for full day",
    FO: "First Half Out",
    SO: "Second Half Out",
    FW: "Field Work",
    TO: "Tour",
    "": "-",
  };

  const location = useLocation();
  const segments = location.pathname.split("/").filter(Boolean);
  const currentTaskId = segments[segments.length - 1]; // "21" or "349"
  const isPostRemarksView = currentTaskId === "21"; // read-only view mode

  const [loading, setLoading] = useState(true);
  const [gpAttdData, setGPAttdData] = useState({});

  const getByteLength = (str) => new TextEncoder().encode(str || "").length;
  const FILE_BASE_URL = import.meta.env.VITE_DOWNLOAD_URL || "";

  const buildFileUrl = (path) => {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path; // already a full URL, don't double-prefix
  // FILE_BASE_URL already ends with "/", so just strip any leading "/" from path to avoid "//"
  return `${FILE_BASE_URL}${String(path).replace(/^\/+/, "")}`;
};

  const [formData, setFormData] = useState(() => ({
    ID: outddorduty.TRAN_CODE,
    TASK_ID: outddorduty.ID,
    TRAN_CODE: outddorduty.TRAN_CODE,
    OUT_TYPE: outddorduty.OUT_TYPE,
    empName: outddorduty.REQUEST_FOR,
    empCode: outddorduty.DETAILS?.EMP_CODE,
    TabId: outddorduty.TASK_ID,
    REMARKS: outddorduty.REMARKS,
    POST_REMARKS: outddorduty.POST_REMARKS,
    GPASS_DATE: outddorduty.GPASS_DATE,
    ATTACHMENT_URL: buildFileUrl(outddorduty.POST_REMARKS_DOC),
  }));

  const fetchGPAttdData = async (frmDt) => {
    try {
      setLoading(true);
      const response = await getGpAttdData({
        emp_code: frmDt?.DETAILS?.EMP_CODE || null,
        gpass_date: frmDt.GPASS_DATE || null,
        out_type: frmDt.OUT_TYPE || null,
        getGpAttddata: true,
      });
      if (response.status) {
        setGPAttdData(response.data || {});
      } else {
        notifyError(response?.message || `Unable to fetch Emp Attendance.`);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Skip the attendance fetch entirely in the read-only Post Remarks view
    if (!isPostRemarksView) {
      fetchGPAttdData(outddorduty);
    } else {
      setLoading(false);
    }
  }, [outddorduty, isPostRemarksView]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;

    if (["REMARKS", "POST_REMARKS", "AUTH_REMARKS"].includes(name)) {
      const bytes = new TextEncoder().encode(newValue);
      if (bytes.length > 200) {
        newValue = newValue.slice(0, 200);
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };

  const handleReject = async () => {
    try {
      const response = await rejectGPData({
        ...formData,
        authForm: true,
        flag: "R",
      });

      if (!response?.status) {
        notifyError("Error Occurred");
        return;
      }

      onClose?.();
      notifySuccess("Request rejected successfully");
      onSuccess?.();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAuthorize = async () => {
    try {
      const response = await authGPData({
        ...formData,
        authForm: true,
        flag: "A",
      });

      if (!response?.status) {
        notifyError("Error Occurred!");
        return;
      }
      onClose?.();
      notifySuccess("Request authorized successfully");
      onSuccess?.();
    } catch (err) {
      console.error(err);
      notifyError("Something went wrong");
    }
  };

  return (
    <>
      <div
        className={`modal fade ${isOpen ? "show d-block" : ""}`}
        tabIndex="-1"
        aria-hidden={!isOpen}
        role="dialog"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      >
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <h4 className="modal-title">
                  <div>
                    OutDoor Duty Request for &nbsp;
                    <span className="fw-semibold">{formData.empName ?? ""}</span>
                    <span className="text-muted ms-2" style={{ fontSize: "14px" }}>
                      ({formData.GPASS_DATE || ""})
                    </span>
                  </div>
                </h4>
              </div>
              <button
                type="button"
                className="btn-close custom-btn-close p-0"
                onClick={onClose}
                aria-label="Close"
              >
                <i className="ti ti-x" />
              </button>
            </div>

            <form>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="fw-semibold">Out Type :</label>
                      <span className="ms-2">{OUT_TYPE_LABELS[formData.OUT_TYPE || ""]}</span>
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-12">
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Remarks :</label>
                      <span className="ms-2">{formData.REMARKS || ""}</span>
                    </div>
                  </div>
                </div>

                {/* Post Remarks + Attachment: only in the /21 read-only view */}
                {isPostRemarksView && (
                  <>
                    {formData.POST_REMARKS && (
                      <div className="row">
                        <div className="col-md-12">
                          <div className="mb-3">
                            <label className="form-label fw-semibold">Post Remarks :</label>
                            <span className="ms-2">{formData.POST_REMARKS}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {formData.ATTACHMENT_URL && (
                      <div className="row">
                        <div className="col-md-12">
                          <div className="mb-3">
                            <label className="form-label fw-semibold">Attachment :</label>
                            <span className="ms-2 d-inline-flex gap-3 align-items-center">
                              <a
                                href={formData.ATTACHMENT_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <i className="ti ti-eye me-1" />
                                View
                              </a>
                              {/* <a href={formData.ATTACHMENT_URL} download>
                                <i className="ti ti-download me-1" />
                                Download
                              </a> */}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Auth Remarks + attendance info: only in the /349 action view */}
                {!isPostRemarksView && (
                  <>
                    <div className="row">
                      <div className="col-12">
                        <div className="form-group mb-3">
                          <label className="form-label">Auth Remarks:</label>
                          <textarea
                            className="form-control"
                            name="AUTH_REMARKS"
                            value={formData.AUTH_REMARKS || ""}
                            onChange={handleChange}
                          />
                          <div className="char-counter">
                            {getByteLength(formData.AUTH_REMARKS || "")} / 200
                          </div>
                        </div>
                      </div>
                    </div>

                    {gpAttdData?.keyRt && (
                      <div className="row">
                        <div className="col-12">
                          <div className="form-group mb-3">
                            <label className="form-label">{gpAttdData.keyRt}:</label>
                            <span className="ms-2">{gpAttdData.valRt || ""}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Authorize / Reject: only in the /349 action view */}
              {/* {!isPostRemarksView && (
                <div className="modal-footer">
                  <SDLAuthorizationActionButtons
                  onAuthorize={handleAuthorize}
                  onReject={handleReject}
                />
                </div>
              )} */}
              <div className="modal-footer">
                {isPostRemarksView ? (
                  <button type="button" className="btn btn-secondary" onClick={onClose}>
                    Close Task
                  </button>
                ) : (
                  <SDLAuthorizationActionButtons
                    onAuthorize={handleAuthorize}
                    onReject={handleReject}
                  />
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default OutdoorDutyAuthorizationModal;