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
  const [errorMsg, setErrorMsg] = useState(false);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [loading, setLoading] = useState(true);
  const [lrData, setLRData] = useState({});
  const [formData, setFormData] = useState({});
  const { isOpen, modalDate } = modalState;
  console.log(
    "=========== --------- Outdoor Duty Submitted ---------- =========",
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
  const enablePostRemarks = (isEditMode && status === "Not send to auth") || isPostRemarkMode;
  const [leaveBal, setLeaveBal] = useState({});
  const mid = modalState.mid;
  const [isLeaveAllowed, setIsLeaveAllowed] = useState(true);

  useEffect(() => {
    setLoading(true);
    console.log("+++++=== isLeaveAllowed ========", isLeaveAllowed);
    if(isLeaveAllowed){
      if (isOpen) {
        setIsSubmitting(false); // reset every time modal opens
        //setIsUpdating(false);
      }
    } else {
      setLoading(false);
      closeModal();

      Swal.fire({
        icon: "error",
        title: "Error",
        text: "You have already applied leave!",
      });
      return;
    }
  }, [isOpen, isLeaveAllowed, closeModal]);

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

  const formatLocalDateTime = (date) => {
    const pad = (n) => String(n).padStart(2, '0');

    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  const fetchLRData = async () => {
    console.log("======Params========", modalDate);
    try {
      setLoading(true);
      const response = await getLRDataDetails({
        id: modalState.id || null,
        //ID: mid || null,
        ID: modalState.id || null,
        getLrdata: true,
        ro: undefined,
        //hiddenTaskId: formConfig.taskIdHdn || null
        modal_date: formatLocalDateTime(modalDate)
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

  

  



  

  // ===========================
  // Initialize Form Data
  // ===========================
  useEffect(() => {
    console.log("-----------+++++ lrData +++++-------------", lrData);
    const types = lrData?.var?.type;
    if (!types) return;

    if(lrData.flag !== "Yes" || lrData.flag === "No") {
      setIsLeaveAllowed(false);
      // Swal.fire({
      //   icon: "error",
      //   title: "Failed",
      //   text: `You have already applied leave for this date!`,
      // });
      // return;
    }
    

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
  const validateLeaveStatus = async (dataNw) => {
    console.log("=========== dataNw++++++ =========", dataNw);
    if (dataNw.LVE_CODE !== "LWP") {
      if (parseFloat(dataNw.noDaysNww) > parseFloat(dataNw.NET_BAL) - parseFloat(dataNw.UNAUTH_BAL)
      ) {
        //Diable save button - Pending
        return { status: false, message: "Insufficient leave balance" };
      } else {
        //Enable save button - Pending 
        //---------OL Validation-----------
        if(dataNw.LVE_CODE == "OL"){
          const dateStart = dataNw.LVE_DATE_FR;
          const date1 = new Date();
          const date2 = new Date(dateStart);
          const Difference_In_Time = date2.getTime() - date1.getTime();
          const Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);
          
          if (dateStart === '') {
            return true;
          } else {
            try {
              const responseOL = await checkOL({
                OlValidate: true,
                EMP_CODE: dataNw.EMP_CODE,
                lv_type: dataNw.LVE_CODE,
                attd_date: dataNw.LVE_DATE_FR,
              });

              if (responseOL?.data?.data === 1) {
                console.log("----------CL RESPONSE---------", responseOL);
                console.log("diff days :", Difference_In_Days);
                if (Difference_In_Days <= 5) {
                  //Diable save button - Pending
                  return { status: false, message: "Note: Optional leave has to be informed atleast 6 days prior!" }; 
                }
              } else if (responseOL?.data?.data === 0) {
                //Diable save button - Pending
                return { status: false, message: "Optional leave for this date is not applicable!" };   
              } else {
                //Enable save button - Pending
              }
            } catch (error) {
              console.error("Error fetching data:", error);
              return { status: false, message: "Error validating CLe" };
            }
          }
        }

        //---------PL Validation-----------
        if (dataNw.LVE_CODE === "PL") {
          const numDays = dataNw.NO_DAYS !== undefined && dataNw.NO_DAYS !== null 
            ? dataNw.NO_DAYS 
            : calculateNoDays(dataNw.LVE_DATE_FR, dataNw.LVE_DATE_TO);

          if (dataNw.PL_COUNT >= 3 || numDays <= 2) {
            return {
              valid: false,
              message: "PL can avail only 3/year and should be minimum 3 days!",
            };
          } else {
            //Enable save button - Pending
          }
        } 

        //-----------CL Validation----------
        if (dataNw.LVE_CODE === "CL") {
          const lveFrom = dataNw.LVE_DATE_FR;
          const lveTo = dataNw.LVE_DATE_TO;
          if (lveFrom !== null && lveTo !== null) {
            try {
              const responseCL = await checkCL({
                ClValidate: true,
                EMP_CODE: dataNw.EMP_CODE,
                no_days: dataNw.NO_DAYS,
                fr_dt: dataNw.LVE_DATE_FR,
                to_dt: dataNw.LVE_DATE_TO
              });

              if (responseCL?.data?.data === 0) {
                //Diable save button - Pending
                return { status: false, message: "CL can not be taken more than thrice in a month and CL can not be more than 2 days!" };   
              } else {
                //Enable save button - Pending
              }
            } catch (error) {
              console.error("Error fetching data:", error);
              return { status: false, message: "Error validating CL" };
            }
          }
        }

        // ================= PLC =================
        if (dataNw.LVE_CODE === "PLC") {
          const eff = moment(dataNw.EFF_DATE);
          const upto = moment(dataNw.UPTO_DATE);
  
          if (
            !moment(dataNw.LVE_DATE_FR).isBetween(eff, upto, null, "[]") ||
            !moment(dataNw.LVE_DATE_TO).isBetween(eff, upto, null, "[]")
          ) {
            return {
              valid: false,
              message: "PLC not applicable for selected dates",
            };
          }
        }
      } 
    }  
    return { status: true, message: "" };
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

    console.log("============= 1111233444 Updated 1233456666=============", updated);
    const lveCodeNw       = updated.LVE_CODE;
    const lveFromNw       = updated.LVE_DATE_FR;
    const lveToNw         = updated.LVE_DATE_TO;
    const startDayNw      = new Date(lveFromNw);
    const endDayNw        = new Date(lveToNw);
    const millisBetweenNw = endDayNw.getTime() - startDayNw.getTime();
    const daysNw          = millisBetweenNw / 1000 / 60 / 60 / 24;
    const noDaysNw        = millisBetweenNw / 1000 / 60 / 60 / 24 + 1;
    const leaveStartNw    = updated.LEAVE_STARTS;
    const leaveEndNw      = updated.LEAVE_ENDS;
    console.log(
      "--1--lveCodeNw: ", lveCodeNw, 
      "--2--lveFromNw: ", lveFromNw, 
      "--3--lveToNw: ", lveToNw,
      "--4--startDayNw: ", startDayNw, 
      "--5--endDayNw: ", endDayNw, 
      "--6--millisBetweenNw: ", millisBetweenNw, 
      "--7--daysNw: ", daysNw, 
      "--8--noDaysNw: ", noDaysNw, 
      "--9--leaveStartNw: ", leaveStartNw, 
      "--10--leaveEndNw: ", leaveEndNw);
      let noDaysNww;

    if ((leaveStartNw === "M" && leaveEndNw === "E") ||  (leaveStartNw === "B" && leaveEndNw === "M")) {
      // half day
      noDaysNww = noDaysNw - 0.5;
    } else {
      noDaysNww = noDaysNw;
    }
    updated.NO_DAYS = noDaysNww; 
    updated.noDaysNww = noDaysNww;
    try {
      const isAllow = await validateLeaveStatus(updated);
      if (!isAllow.status) {
        setErrorMsg(isAllow.message);  
      } else {
        setErrorMsg(false);
      }  
    } catch (err) {
      setErrorMsg(err);
    }

    // // PL logic
    // if (updated.LVE_CODE === "PL") {
    //   updated.LEAVE_STARTS = "B";
    //   updated.LEAVE_ENDS = "E";
    //   setIsSTENDLocked(true);
    // } else {
    //   setIsSTENDLocked(false);
    // }
    setFormData(updated);
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
                {/* {clError && (
                  <span className="text-danger ms-2 fs-16">- {clError}</span>
                )} */}
                {errorMsg && (
                  <span className="text-danger ms-2 fs-16">- {errorMsg}</span>
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
