import { useState, useEffect } from "react";
import {
  getLRDataDetails,
  saveLRData,
  saveLRDataAUTH,
  editLRData,
  editLRDataAUTH,
  isDateAllowed,
  checkCL,
  checkOL,
} from "../services/leavesService";
import Swal from "sweetalert2";
import moment from "moment";

const LeavesModal = ({ formSettings, modalState, closeModal, onSuccess }) => {
  const { modalPage, mode, modeLabel, form_header, form_text } = formSettings;

  const [date, setDate] = useState(new Date());
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [loading, setLoading] = useState(true);
  const [lrData, setLRData] = useState({});
  const [formData, setFormData] = useState({});
  const { isOpen, modalDate } = modalState;
  console.log(
    "===========Outdoor Duty Submitted=========",
    formSettings,
    modalState,
  );
  const [errors, setErrors] = useState({});
  const isReadOnly = ["view", "readonly"].includes(mode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = modalState.mode === "edit";
  const isPostRemarkMode = mode === "postremark";
  const isCreateMode = mode === "create";
  const [isFormValid, setIsFormValid] = useState(true);
  const [clError, setClError] = useState("");
  const [isCLValid, setIsCLValid] = useState(true);
  const [isSTENDLocked, setIsSTENDLocked] = useState(false);
  const isRejectEditMode = mode === "edit-reject";

  const enablePostRemarks =
    (isEditMode && status === "Not send to auth") || isPostRemarkMode;

  const [leaveBal, setLeaveBal] = useState({});

  const mid = modalState.mid;
  useEffect(() => {
    if (isOpen) {
      setIsSubmitting(false); // reset every time modal opens
      //setIsUpdating(false);
    }
  }, [isOpen]);

  const initialFormData = {
    LVE_CODE: "",
    LVE_DATE_FR: "",
    LEAVE_STARTS: "",
    LVE_DATE_TO: "",
    LEAVE_ENDS: "",
    EMP_CODE: "",
    REASON: "",
  };

  const initialErrors = {};

  const resetForm = () => {
    setFormData(initialFormData);
    setErrors(initialErrors);
    setLRData({});
    setIsSubmitting(false);
    setLoading(false);
  };

  const handleCloseModal = () => {
    resetForm();
    closeModal();
  };

  const handleSave = async (e) => {
    e.preventDefault();

    const isValid = validateForm(formData);
    if (!isValid) return;

    setIsSubmitting(true); // disable immediatel

    try {
      const isEdit = modalState.mode === "edit";
      const payload = {
        ...formData,
        ...(isEdit ? { editLrData: true } : { saveLrData: true }),
      };
      const apiCall = isEdit ? editLRData : saveLRData;

      const response = await apiCall(payload);
      if (response?.status) {
        await Swal.fire({
          icon: "success",
          title: "Success",
          text:
            response?.message ||
            `Leave Request ${isEdit ? "updated" : "saved"} successfully.`,
        });

        //onSuccess?.();
        resetForm();
        onSuccess?.();
        closeModal();
      } else {
        setIsSubmitting(false); // re-enable
        Swal.fire({
          icon: "error",
          title: "Failed",
          text:
            response?.message ||
            `Unable to ${isEdit ? "update" : "save"} Leave Request.`,
        });
      }
      console.log("Submitting:", formData);

      console.log("-------Submitting:-------Payload---", payload);
      setLoading(true);
      console.log("==============Save Response:==========", response);
    } catch (err) {
      console.error("Submit Error:", err);
      setIsSubmitting(false); // re-enable on error
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Something went wrong while saving data.",
      });
    } finally {
      setIsSubmitting(false); // ALWAYS reset
      setLoading(false);
    }
  };

  const handleSaveAuth = async (e) => {
    e.preventDefault();

    const isValid = validateForm(formData);
    if (!isValid) return;

    setIsSubmitting(true); // disable immediatel

    try {
      const isEdit = modalState.mode === "edit";
      const payload = {
        ...formData,
        ...(isEdit ? { editLrData: true } : { saveLrData: true }),
        withAuth: true,
      };
      const apiCall = isEdit ? editLRDataAUTH : saveLRDataAUTH;

      const response = await apiCall(payload);
      if (response?.status) {
        await Swal.fire({
          icon: "success",
          title: "Success",
          text:
            response?.message ||
            `Leave Request ${isEdit ? "updated" : "saved"} successfully.`,
        });

        //onSuccess?.();
        resetForm();
        onSuccess?.();
        closeModal();
      } else {
        setIsSubmitting(false); // re-enable
        Swal.fire({
          icon: "error",
          title: "Failed",
          text:
            response?.message ||
            `Unable to ${isEdit ? "update" : "save"} Leave Request.`,
        });
      }
      console.log("Submitting:", formData);

      console.log("-------Submitting:-------Payload---", payload);
      setLoading(true);
      console.log("==============Save Response:==========", response);
    } catch (err) {
      console.error("Submit Error:", err);
      setIsSubmitting(false); // re-enable on error
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Something went wrong while saving data.",
      });
    } finally {
      setIsSubmitting(false); // ALWAYS reset
      setLoading(false);
    }
  };

  // ===========================
  // Fetch Data
  // ===========================
  useEffect(() => {
    if (isOpen) {
      fetchLRData();
    }
  }, [isOpen]);

  const formatDateNW = (date) => {
    if (!date) return "";

    return new Date(date).toISOString().split("T")[0];
  };

  const fetchLRData = async () => {
    try {
      setLoading(true);

      const response = await getLRDataDetails({
        id: modalState.id || null,
        //ID: mid || null,
        ID: modalState.id || null,
        getLrdata: true,
        ro: undefined,
        //hiddenTaskId: formConfig.taskIdHdn || null
      });

      console.log("================= Response ------", response);
      setLRData(response || {});
      setLeaveBal(response.LEAVEBALARR || {});
    } catch (error) {
      console.error("Error fetching Leave Request Data:", error);
    } finally {
      setLoading(false);
    }
  };

  console.log("================= lrData ------", lrData);

  // ===========================
  // Prepare Config
  // ===========================
  const config = lrData?.var || { type: {} };
  console.log("========= COnfig ===========", config);

  const getByteLength = (str) => new TextEncoder().encode(str || "").length;

  const formatModalDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const months = [
      "JAN",
      "FEB",
      "MAR",
      "APR",
      "MAY",
      "JUN",
      "JUL",
      "AUG",
      "SEP",
      "OCT",
      "NOV",
      "DEC",
    ];
    return `${String(d.getDate()).padStart(2, "0")}-${months[d.getMonth()]}-${d.getFullYear()}`;
  };

  const formatToInputDate = (dateStr) => {
    if (!dateStr) return "";
    const parts = dateStr.split("-");
    const months = {
      JAN: "01",
      FEB: "02",
      MAR: "03",
      APR: "04",
      MAY: "05",
      JUN: "06",
      JUL: "07",
      AUG: "08",
      SEP: "09",
      OCT: "10",
      NOV: "11",
      DEC: "12",
    };
    if (parts.length === 3 && months[parts[1]]) {
      return `${parts[2]}-${months[parts[1]]}-${parts[0]}`;
    }
    return "";
  };

  const calculateDays = (from, to, start, end) => {
    if (!from || !to) return "";

    const startDate = new Date(from);
    const endDate = new Date(to);

    const diff = endDate - startDate;
    let days = diff / (1000 * 60 * 60 * 24) + 1;

    //Half-day logic (from legacy)
    if ((start === "M" && end === "E") || (start === "B" && end === "M")) {
      days = days - 0.5;
    }

    return days > 0 ? parseFloat(days) : "";
  };

  const isValidDateRange = (from, to) => {
    if (!from || !to) return true;
    if (new Date(to) < new Date(from)) {
      Swal.fire("Invalid", "To Date must be ≥ From Date", "warning");
      return false;
    }
    return true;
  };

  // ===========================
  // Initialize Form Data
  // ===========================
  useEffect(() => {
    const types = lrData?.var?.type;
    if (!types) return;

    const initial = {};
    for (const group of Object.values(types)) {
      for (const field of Object.values(group)) {
        if (field?.name) {
          initial[field.name] = field.value ?? "";
        }
      }
    }
    console.log("===============initial==============", initial);
    // Priority: API date → modalDate
    // Dates
    //const rawFrom = initial["LVE_DATE_FR"] || modalDate;
    const rawFrom = modalState?.fromDate || modalDate;

    if (rawFrom) {
      initial["LVE_DATE_FR"] = moment(rawFrom).format("YYYY-MM-DD");
    }
    //const rawTo = initial["LVE_DATE_TO"] || modalDate;
    const rawTo = modalState?.toDate || modalDate;

    if (rawTo) {
      initial["LVE_DATE_TO"] = moment(rawTo).format("YYYY-MM-DD");
    }

    if (mid) {
      initial.ID = String(mid);
    }

    // Leave Code default
    if (!mid) {
      initial["LVE_CODE"] = ""; // force no selection
      initial.BAL = 0;
      initial.NET_BAL = 0;
      initial.UNAUTH_BAL = 0;
    }

    // Leave Starts
    if (!mid) {
      const startOptions = types?.SELECT?.LEAVE_STARTS?.options || {};
      const firstKey = Object.keys(startOptions)[0];

      if (firstKey) {
        initial["LEAVE_STARTS"] = firstKey;
      }
    }
    // Leave Ends
    if (!mid) {
      const endOptions = types?.SELECT?.LEAVE_ENDS?.options || {};
      const firstKey = Object.keys(endOptions)[0];

      if (firstKey) {
        initial["LEAVE_ENDS"] = firstKey;
      }
    }
    if (initial.NO_DAYS === "") initial.NO_DAYS = 1;

    console.log("=========== Date ============", initial);
    setFormData(initial);
  }, [lrData, modalDate, mid, leaveBal]);

  // ================= MAIN VALIDATION =================
  const validateLeave = async (data) => {
    console.log("+++++++++++++++++++++11111111", data);
    const days = calculateDays(
      data.LVE_DATE_FR,
      data.LVE_DATE_TO,
      data.LEAVE_STARTS,
      data.LEAVE_ENDS,
    );

    if (data.LVE_CODE !== "LWP") {
      const available =
        parseFloat(data.NET_BAL || 0) - parseFloat(data.UNAUTH_BAL || 0);

      setClError("");
      setIsCLValid(true);

      const numDays =
        data.NO_DAYS !== undefined && data.NO_DAYS !== null
          ? data.NO_DAYS
          : calculateNoDays(data.LVE_DATE_FR, data.LVE_DATE_TO);

      //console.log("+++++++++++++++++++++ NO of days =============", data.PL_COUNT, numDays);
      // ================= PL =================
      if (data.LVE_CODE === "PL") {
        if (data.PL_COUNT >= 3 || numDays <= 2) {
          setClError("PL can avail only 3/year and should be minimum 3 days!");
          setIsCLValid(false);

          return {
            valid: false,
            message: "PL can avail only 3/year and should be minimum 3 days!",
          };
        }
      }
      console.log("+++++++++++++++++++++3333333", data.LVE_CODE);
      // ================= OL =================
      if (data.LVE_CODE === "OL") {
        const diff = moment(data.LVE_DATE_FR).diff(moment(), "days");
        var dateStart = data.LVE_DATE_FR;
        var date1 = new Date();
        var date2 = new Date(dateStart);
        var Difference_In_Time = date2.getTime() - date1.getTime();
        var Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);

        try {
          //setLoading(true);

          const responseOL = await checkOL({
            OlValidate: true,
            EMP_CODE: data.EMP_CODE,
            lv_type: data.LVE_CODE,
            attd_date: data.LVE_DATE_FR,
          });

          if (responseOL?.data?.data === 1) {
            console.log("----------CL RESPONSE---------", responseOL);
            console.log("diff days :", Difference_In_Days);
            if (Difference_In_Days <= 5) {
              setClError(
                "Optional leave has to be informed atleast 6 days prior!",
              );
              setIsCLValid(false);

              return {
                valid: false,
                message:
                  "CL cannot be taken more than 3 times or more than 2 days",
              };
            }
          } else if (responseOL?.data?.data === 0) {
            setClError("Optional leave for this date is not applicable!");
            setIsCLValid(false);

            return {
              valid: false,
              message: "Optional leave for this date is not applicable!",
            };
          } else {
            setClError("");
            setIsCLValid(true);
            return { valid: true };
          }
        } catch (error) {
          console.error("Error fetching data:", error);
          setIsCLValid(false);
          setClError("Error validating CL");
        } finally {
          //setLoading(false);
        }
        // API CALL (replace)
        // const res = await checkOL(data)
      }

      // ================= CL =================
      console.log("+++++++++++++++++++++", data.LVE_CODE);

      if (data.LVE_CODE === "CL") {
        try {
          //setLoading(true);
          const responseCL = await checkCL({
            ClValidate: true,
            EMP_CODE: data.EMP_CODE,
            no_days: data.NO_DAYS,
            fr_dt: data.LVE_DATE_FR,
            to_dt: data.LVE_DATE_TO,
          });

          if (!responseCL?.data?.status || responseCL?.data?.data === 0) {
            console.log("----------CL RESPONSE---------", responseCL);
            setClError(
              "CL cannot be taken more than 3 times or more than 2 days",
            );
            setIsCLValid(false);

            return {
              valid: false,
              message:
                "CL cannot be taken more than 3 times or more than 2 days",
            };
          } else {
            setClError("");
            setIsCLValid(true);
            return { valid: true };
          }
        } catch (error) {
          console.error("Error fetching data:", error);
          setIsCLValid(false);
          setClError("Error validating CL");
        } finally {
          //setLoading(false);
        }
      }

      // ================= PLC =================
      if (data.LVE_CODE === "PLC") {
        const eff = moment(data.EFF_DATE);
        const upto = moment(data.UPTO_DATE);

        if (
          !moment(data.LVE_DATE_FR).isBetween(eff, upto, null, "[]") ||
          !moment(data.LVE_DATE_TO).isBetween(eff, upto, null, "[]")
        ) {
          setClError("PLC not applicable for selected dates");
          setIsCLValid(false);

          return {
            valid: false,
            message: "PLC not applicable for selected dates",
          };
        }
      }

      //}
    } else if (data.LVE_CODE === "LWP") {
      setClError("");
      setIsCLValid(true);
      return { valid: true };
    }

    return { valid: true, days };
  };

  const calculateNoDays = (from, to) => {
    if (!from || !to) return 0;

    const start = new Date(from);
    const end = new Date(to);
    const diff = end - start;
    const days = diff / (1000 * 60 * 60 * 24) + 1;

    return days;
  };

  // ================= CHANGE =================
  const handleChangeTxT = async (e) => {
    const { name, value } = e.target;
    let updated = { ...formData, [name]: value };

    if (["REMARKS", "AUTH_REMARKS", "REASON"].includes(name)) {
      const encoder = new TextEncoder();
      let bytes = encoder.encode(value || "");

      if (bytes.length > 200) {
        return;
      }
    }

    setFormData(updated);
  };

  const handleChange = async (e) => {
    const { name, value } = e.target;

    let updated = {
      ...formData,
      [name]: value,
    };

    // Leave balance
    if (name === "LVE_CODE") {
      const selected = leaveBal[value];
      updated.BAL = selected?.[0] ?? 0;
      updated.UNAUTH_BAL = selected?.[2] ?? 0;
      updated.NET_BAL = selected?.[1] ?? 0;
    }

    // PL logic
    if (updated.LVE_CODE === "PL") {
      updated.LEAVE_STARTS = "B";
      updated.LEAVE_ENDS = "E";
      setIsSTENDLocked(true);
    } else {
      setIsSTENDLocked(false);
    }

    // Recalculate days
    if (updated.LVE_DATE_FR && updated.LVE_DATE_TO) {
      try {
        const result = await validateLeave(updated);
        console.log("VALIDATION RESULT", result);
        updated.NO_DAYS = Number(result?.days || 1);
        if (!result.valid) {
          setErrors({
            msg: result.message,
          });
        } else {
          setErrors({});
        }
      } catch (err) {
        console.log(err);
      }
    }
    setFormData(updated);
  };

  const validateForm = (formDataVal) => {
    const newErrors = {};

    if (!formDataVal.LVE_CODE) {
      newErrors.LVE_CODE = "Leave Code is required";
    }

    if (!formDataVal.LVE_DATE_FR) {
      newErrors.LVE_DATE_FR = "From Date is required";
    }

    if (!formDataVal.LVE_DATE_TO) {
      newErrors.LVE_DATE_TO = "To Date is required";
    }

    if (!formDataVal.LEAVE_STARTS) {
      newErrors.LEAVE_STARTS = "Leave Starts is required";
    }

    if (!formDataVal.LEAVE_ENDS) {
      newErrors.LEAVE_ENDS = "Leave Ends is required";
    }

    if (!formDataVal.NO_DAYS || formDataVal.NO_DAYS <= 0) {
      newErrors.NO_DAYS = "Invalid number of days";
    }

    // Optional: Reason validation
    if (!formDataVal.REASON || formDataVal.REASON.trim() === "") {
      newErrors.REASON = "Reason is required";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // ===========================
  // Format Date
  // ===========================
  const formatDate = (dateVal) => {
    if (!dateVal) return "";

    const date = new Date(dateVal);

    if (isNaN(date)) return "";

    const day = String(date.getDate()).padStart(2, "0");
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
  };

  // SIMPLE HELPER (core logic)
  const renderField = (value, inputElement, isTextarea = false) => {
    //if (isAuthMode) {
    return (
      <span
        className="form-control-plaintext"
        style={isTextarea ? { whiteSpace: "pre-wrap" } : {}}
      >
        {value ?? "-"}
      </span>
    );
    //}
    return inputElement;
  };

  return (
    <>
      {/* Add Outdoor Duty */}
      <div
        className={`modal fade ${isOpen ? "show d-block" : ""}`}
        tabIndex="-1"
        aria-hidden={!isOpen}
        role="dialog"
        style={{
          backgroundColor: "rgba(0,0,0,0.5)",
        }}
      >
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            {/* Header */}
            <div className="modal-header">
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <h4 className="modal-title mb-1"> Apply For Leave Request </h4>
                {clError && (
                  <span className="text-danger ms-2 fs-16">- {clError}</span>
                )}
              </div>

              <button
                type="button"
                className="btn-close custom-btn-close p-0"
                // onClick={closeModal}
                onClick={handleCloseModal}
                aria-label="Close"
              >
                <i className="ti ti-x" />
              </button>
            </div>

            {/* Form */}
            <form>
              {/* Body */}
              <div className="modal-body">
                {/* ROW 1 */}
                <div className="row mb-4">
                  {Object.entries(leaveBal).map(([key, values]) => (
                    <div className="col text-center" key={key}>
                      <h6 className="text-info">{key}</h6>
                      <strong>
                        {values?.[1] ?? 0} / {values?.[0] ?? 0}
                      </strong>
                    </div>
                  ))}
                </div>

                {/* ROW 2 */}
                <div className="row mb-3">
                  <div className="col-md-3">
                    <label>Leave Code</label>
                    <select
                      className={`select2 form-control ${errors.LVE_CODE ? "is-invalid" : ""}`}
                      name="LVE_CODE"
                      value={formData.LVE_CODE ?? ""}
                      onChange={handleChange}
                    >
                      <option value="" disabled>
                        Select Leave Code
                      </option>

                      {(config?.type?.SELECT?.LVE_CODE?.options || []).map(
                        (opt) => (
                          <option key={opt.LVE_CODE} value={opt.LVE_CODE}>
                            {opt.LVED}
                          </option>
                        ),
                      )}
                    </select>

                    {errors.LVE_CODE && (
                      <div className="invalid-feedback">{errors.LVE_CODE}</div>
                    )}
                  </div>

                  <div className="col-md-3">
                    <label>Alloted</label>

                    <input
                      className="form-control"
                      value={formData.BAL || 0}
                      readOnly
                    />
                  </div>

                  <div className="col-md-3">
                    <label>Unapproved</label>

                    <input
                      className="form-control"
                      value={formData.UNAUTH_BAL || 0}
                      readOnly
                    />
                  </div>

                  <div className="col-md-3">
                    <label>Net Balance</label>

                    <input
                      className="form-control"
                      value={formData.NET_BAL || 0}
                      readOnly
                    />
                  </div>
                </div>

                {/* ROW 3 */}
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label>From Date</label>
                    {/* {renderField(formData.LVE_DATE_FR, */}
                    <input
                      type="date"
                      className={`form-control ${errors.LVE_DATE_FR ? "is-invalid" : ""}`}
                      name="LVE_DATE_FR"
                      value={formData.LVE_DATE_FR || ""}
                      onChange={handleChange}
                      //onChange={handleDateChange}
                      min={moment().startOf("month").format("YYYY-MM-DD")}
                      max={
                        moment().month() === 11
                          ? moment().endOf("month").format("YYYY-MM-DD")
                          : moment()
                              .add(1, "month")
                              .endOf("month")
                              .format("YYYY-MM-DD")
                      }
                      disabled={isCreateMode}
                    />
                    {/* )} */}
                    {errors.LVE_DATE_FR && (
                      <div className="invalid-feedback">
                        {errors.LVE_DATE_FR}
                      </div>
                    )}
                  </div>

                  <div className="col-md-6">
                    <label>Leave Starts</label>
                    {/* {renderField(formData.LEAVE_STARTS, */}
                    <select
                      className={`select2 form-control ${errors.LEAVE_STARTS ? "is-invalid" : ""}`}
                      name="LEAVE_STARTS"
                      value={formData.LEAVE_STARTS || ""}
                      onChange={handleChange}
                      //onChange={handleDateChange}
                      disabled={isSTENDLocked}
                    >
                      <option value="">Select</option>
                      {Object.entries(
                        config?.type?.SELECT?.LEAVE_STARTS?.options || {},
                      ).map(([k, v]) => (
                        <option key={k} value={k}>
                          {v}
                        </option>
                      ))}
                    </select>
                    {/* )} */}
                    {errors.LEAVE_STARTS && (
                      <div className="invalid-feedback">
                        {errors.LEAVE_STARTS}
                      </div>
                    )}
                  </div>
                </div>

                {/* ROW 4 */}
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label>To Date</label>
                    {/* {renderField(formData.LVE_DATE_TO, */}
                    <input
                      type="date"
                      className={`form-control ${errors.LVE_DATE_TO ? "is-invalid" : ""}`}
                      name="LVE_DATE_TO"
                      value={formData.LVE_DATE_TO || ""}
                      onChange={handleChange}
                      min={moment().startOf("month").format("YYYY-MM-DD")}
                      max={
                        moment().month() === 11
                          ? moment().endOf("month").format("YYYY-MM-DD")
                          : moment()
                              .add(1, "month")
                              .endOf("month")
                              .format("YYYY-MM-DD")
                      }
                    />
                    {/* )} */}
                    {errors.LVE_DATE_TO && (
                      <div className="invalid-feedback">
                        {errors.LVE_DATE_TO}
                      </div>
                    )}
                  </div>

                  <div className="col-md-6">
                    <label>Leave Ends</label>
                    {/* {renderField(formData.LEAVE_ENDS, */}
                    <select
                      className={`select2 form-control ${errors.LEAVE_ENDS ? "is-invalid" : ""}`}
                      name="LEAVE_ENDS"
                      value={formData.LEAVE_ENDS || ""}
                      onChange={handleChange}
                      disabled={isSTENDLocked}
                    >
                      <option value="">Select</option>
                      {Object.entries(
                        config?.type?.SELECT?.LEAVE_ENDS?.options || {},
                      ).map(([k, v]) => (
                        <option key={k} value={k}>
                          {v}
                        </option>
                      ))}
                    </select>
                    {/* )} */}
                    {errors.LEAVE_ENDS && (
                      <div className="invalid-feedback">
                        {errors.LEAVE_ENDS}
                      </div>
                    )}
                  </div>
                </div>

                {/* ROW 5 */}
                <div className="row mb-3">
                  <div className="col-md-4">
                    <label>No Of Days</label>
                    {/* {renderField(formData.NO_DAYS, */}
                    {/* <input className={`form-control ${errors.NO_DAYS ? "is-invalid" : ""}`} value={formData.NO_DAYS || "1"} readOnly /> */}
                    <input
                      className={`form-control ${errors.NO_DAYS ? "is-invalid" : ""}`}
                      value={formData.NO_DAYS ?? ""}
                      readOnly
                    />
                    {/* )} */}
                    {errors.NO_DAYS && (
                      <div className="invalid-feedback">{errors.NO_DAYS}</div>
                    )}
                  </div>

                  <div className="col-md-8">
                    <label>Reason</label>

                    <div className="position-relative">
                      {/* {renderField( */}

                      <textarea
                        className={`form-control ${errors.REASON ? "is-invalid" : ""}`}
                        name="REASON"
                        value={formData.REASON || ""}
                        onChange={handleChangeTxT}
                        style={{ paddingBottom: "20px" }} // ✅ KEY FIX
                      />

                      {/* )} */}
                      {errors.REASON && (
                        <div className="invalid-feedback">{errors.REASON}</div>
                      )}
                    </div>

                    <div
                      style={{
                        position: "absolute",
                        bottom: "2px",
                        right: "8px",
                        fontSize: "11px",
                        color:
                          getByteLength(formData.REASON || "") > 180
                            ? "red"
                            : "#666",
                        background: "#fff", // ✅ prevents overlap visibility
                        padding: "0 4px",
                      }}
                    >
                      {getByteLength(formData.REASON || "")} / 200 bytes
                    </div>
                  </div>
                </div>
              </div>

              {Object.values(config.type.HIDDEN || {}).map((field, i) => (
                <input
                  key={i}
                  type="hidden"
                  name={field.name}
                  value={formData[field.name] || ""}
                />
              ))}
              {/* Footer */}
              <div className="modal-footer">
                <div className="d-flex gap-2">
                  {mode === "create" && (
                    <button
                      type="submit"
                      className="btn btn-primary"
                      data-bs-dismiss="modal"
                      onClick={handleSave}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Processing...
                        </>
                      ) : (
                        "Save"
                      )}
                    </button>
                  )}
                  {/* <button type="submit" className="btn btn-primary" data-bs-dismiss="modal" >
                    Save and Send for Auth 
                  </button> */}
                  <button
                    type="button"
                    className="btn btn-secondary me-2"
                    // onClick={closeModal}
                    onClick={handleCloseModal}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
      
    </>
  );
};

export default LeavesModal;
