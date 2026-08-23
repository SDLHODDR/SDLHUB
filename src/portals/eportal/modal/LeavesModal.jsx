import { useState, useEffect, useMemo } from "react";
import moment from "moment";

import SDLCalendar from "../../../components/calendar/SDLCalendar";

import {
  getLRDataDetails,
  saveLRData,
  saveLRDataAUTH,
  editLRData,
  editLRDataAUTH,
  checkCL,
  checkOL,
} from "../services/leavesService";

import {
  notifyError,
  notifySuccess,
} from "../../../services/alertService";

const LeavesModal = ({
  formSettings,
  modalState,
  closeModal,
  onSuccess,
}) => {
  const {
    modalPage,
    mode,
    modeLabel,
    form_header,
    form_text,
  } = formSettings || {};

  const { isOpen, modalDate } = modalState || {};

  /* ============================================================
     STATE
  ============================================================ */

  const [loading, setLoading] = useState(true);

  const [lrData, setLRData] = useState({});
  const [formData, setFormData] = useState({});
  const [leaveBal, setLeaveBal] = useState({});

  const [errors, setErrors] = useState({});

  /*
   * This is the message displayed at the top of the modal.
   *
   * Examples:
   * - CL can not be taken more than thrice in a month...
   * - Insufficient leave balance
   * - Optional leave...
   */
  const [errorMsg, setErrorMsg] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  /*
   * When true Save button will be disabled because business
   * validation failed.
   */
  const [isBtnDisable, setIsBtnDisable] = useState(false);

  const [isLeaveAllowed, setIsLeaveAllowed] = useState(true);

  const [isSTENDLocked, setIsSTENDLocked] = useState(false);

  const mid = modalState?.mid;

  const isEditMode = mode === "edit";
  const isCreateMode = mode === "create";
  const isReadOnly =
    mode === "view" || mode === "readonly";

  /* ============================================================
     INITIAL FORM
  ============================================================ */

  const initialFormData = useMemo(
    () => ({
      LVE_CODE: "",
      LVE_DATE_FR: "",
      LEAVE_STARTS: "",
      LVE_DATE_TO: "",
      LEAVE_ENDS: "",
      EMP_CODE: "",
      REASON: "",
      NO_DAYS: "",
      BAL: 0,
      NET_BAL: 0,
      UNAUTH_BAL: 0,
    }),
    [],
  );

  /* ============================================================
     HELPERS
  ============================================================ */

  /**
   * Convert any date value into YYYY-MM-DD.
   *
   * Handles:
   * - Date
   * - YYYY-MM-DD
   * - YYYY-MM-DD HH:mm:ss
   * - moment values
   */
  const formatDateForForm = (value) => {
    if (!value) return "";

    if (moment.isMoment(value)) {
      return value.format("YYYY-MM-DD");
    }

    if (value instanceof Date) {
      if (Number.isNaN(value.getTime())) return "";

      return moment(value).format("YYYY-MM-DD");
    }

    const str = String(value);

    if (!str) return "";

    /*
     * Already YYYY-MM-DD
     */
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
      return str;
    }

    const parsed = moment(str);

    return parsed.isValid()
      ? parsed.format("YYYY-MM-DD")
      : "";
  };

  /**
   * Convert YYYY-MM-DD into Date object for PrimeReact Calendar.
   */
  const toCalendarDate = (value) => {
    if (!value) return null;

    if (value instanceof Date) {
      return Number.isNaN(value.getTime())
        ? null
        : value;
    }

    const parsed = moment(
      String(value),
      "YYYY-MM-DD",
      true,
    );

    if (!parsed.isValid()) return null;

    return parsed.toDate();
  };

  /**
   * Format Date object received from SDLCalendar.
   */
  const handleCalendarDateChange = (
    fieldName,
    selectedDate,
  ) => {
    const formatted = formatDateForForm(selectedDate);

    setFormData((prev) => {
      const updated = {
        ...prev,
        [fieldName]: formatted,
      };

      /*
       * Automatically calculate number of days when dates change.
       *
       * Leave start/end selection is also taken into account.
       */
      updated.NO_DAYS = calculateLeaveDays(
        updated.LVE_DATE_FR,
        updated.LVE_DATE_TO,
        updated.LEAVE_STARTS,
        updated.LEAVE_ENDS,
      );

      updated.noDaysNww = updated.NO_DAYS;

      return updated;
    });

    /*
     * Clear field-specific error.
     */
    if (errors[fieldName]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[fieldName];
        return next;
      });
    }

    /*
     * Important:
     *
     * DO NOT run leave validation if leave code has not
     * been selected yet.
     */
    if (!formData.LVE_CODE) {
      setErrorMsg("");
      setIsBtnDisable(false);
      return;
    }

    /*
     * Validate after state has been updated.
     */
    setTimeout(() => {
      validateCurrentLeave({
        ...formData,
        [fieldName]: formatted,
      });
    }, 0);
  };

  /**
   * Calculate leave days.
   */
  const calculateLeaveDays = (
    from,
    to,
    leaveStarts,
    leaveEnds,
  ) => {
    if (!from || !to) return 0;

    const start = moment(from, "YYYY-MM-DD", true);
    const end = moment(to, "YYYY-MM-DD", true);

    if (!start.isValid() || !end.isValid()) {
      return 0;
    }

    if (end.isBefore(start, "day")) {
      return 0;
    }

    const normalDays =
      end.diff(start, "days") + 1;

    /*
     * Existing half-day logic:
     *
     * M -> E = half day
     * B -> M = half day
     */
    if (
      (leaveStarts === "M" && leaveEnds === "E") ||
      (leaveStarts === "B" && leaveEnds === "M")
    ) {
      return normalDays - 0.5;
    }

    return normalDays;
  };

  const getByteLength = (str) => {
    return new TextEncoder().encode(
      str || "",
    ).length;
  };

  /* ============================================================
     RESET
  ============================================================ */

  const resetForm = () => {
    setFormData(initialFormData);
    setErrors({});
    setLRData({});
    setLeaveBal({});
    setErrorMsg("");
    setIsSubmitting(false);
    setIsBtnDisable(false);
    setIsLeaveAllowed(true);
    setIsSTENDLocked(false);
    setLoading(false);
  };

  const handleCloseModal = () => {
    resetForm();
    closeModal();
  };

  /* ============================================================
     LOAD DATA
  ============================================================ */

  useEffect(() => {
    if (!isOpen) return;

    setIsSubmitting(false);
    setErrorMsg("");
    setErrors({});
    setIsBtnDisable(false);

    fetchLRData();
  }, [isOpen]);

  const formatLocalDateTime = (dateValue) => {
    if (!dateValue) {
      return moment().format(
        "YYYY-MM-DD HH:mm:ss",
      );
    }

    const date =
      dateValue instanceof Date
        ? dateValue
        : new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return moment().format(
        "YYYY-MM-DD HH:mm:ss",
      );
    }

    const pad = (n) =>
      String(n).padStart(2, "0");

    return `${date.getFullYear()}-${pad(
      date.getMonth() + 1,
    )}-${pad(
      date.getDate(),
    )} ${pad(
      date.getHours(),
    )}:${pad(
      date.getMinutes(),
    )}:${pad(
      date.getSeconds(),
    )}`;
  };

  const fetchLRData = async () => {
    try {
      setLoading(true);

      const response =
        await getLRDataDetails({
          id: modalState?.id || null,
          ID: modalState?.id || null,
          getLrdata: true,
          ro: undefined,
          modal_date:
            formatLocalDateTime(modalDate),
        });

      console.log(
        "Leave Request Response:",
        response,
      );

      const passData =
        response?.data?.pass || {};

      setLRData(passData);

      setLeaveBal(
        passData?.LEAVEBALARR || {},
      );
    } catch (error) {
      console.error(
        "Error fetching Leave Request Data:",
        error,
      );

      setErrorMsg(
        "Unable to load leave request data.",
      );
    } finally {
      setLoading(false);
    }
  };

  /* ============================================================
     CONFIG
  ============================================================ */

  const config = lrData?.var || {
    type: {},
  };

  /* ============================================================
     INITIALIZE FORM FROM API
  ============================================================ */

  useEffect(() => {
    const types = lrData?.var?.type;

    if (!types) return;

    /*
     * Important correction:
     *
     * Old code:
     * if (lrData.flag !== "Yes" || lrData.flag === "No")
     *
     * That condition is effectively:
     * flag !== "Yes"
     *
     * and can incorrectly block the form.
     */
    if (
      lrData.flag !== undefined &&
      lrData.flag !== null &&
      lrData.flag !== "" &&
      lrData.flag !== "Yes"
    ) {
      setIsLeaveAllowed(false);
      setErrorMsg(
        "You have already applied leave for this date!",
      );
    } else {
      setIsLeaveAllowed(true);
    }

    const initial = {};

    Object.values(types).forEach((group) => {
      if (!group) return;

      Object.values(group).forEach((field) => {
        if (field?.name) {
          initial[field.name] =
            field.value ?? "";
        }
      });
    });

    /*
     * ==========================================================
     * IMPORTANT:
     * Automatically populate FROM DATE from modalDate.
     * ==========================================================
     *
     * When user clicks a date in the calendar page:
     *
     * modalDate = selected date
     *
     * That date becomes LVE_DATE_FR.
     */
    const rawFrom =
      modalState?.fromDate ||
      modalDate ||
      initial.LVE_DATE_FR;

    if (rawFrom) {
      initial.LVE_DATE_FR =
        formatDateForForm(rawFrom);
    }

    /*
     * To date:
     *
     * Existing selected value gets priority.
     * Otherwise use modal to/from date.
     */
    const rawTo =
      modalState?.toDate ||
      initial.LVE_DATE_TO ||
      modalDate;

    if (rawTo) {
      initial.LVE_DATE_TO =
        formatDateForForm(rawTo);
    }

    if (mid) {
      initial.ID = String(mid);
    }

    /*
     * CREATE MODE
     */
    if (!mid) {
      initial.LVE_CODE = "";
      initial.BAL = 0;
      initial.NET_BAL = 0;
      initial.UNAUTH_BAL = 0;

      const startOptions =
        types?.SELECT?.LEAVE_STARTS
          ?.options || {};

      const firstStartKey =
        Object.keys(startOptions)[0];

      if (firstStartKey) {
        initial.LEAVE_STARTS =
          firstStartKey;
      }

      const endOptions =
        types?.SELECT?.LEAVE_ENDS
          ?.options || {};

      const firstEndKey =
        Object.keys(endOptions)[0];

      if (firstEndKey) {
        initial.LEAVE_ENDS =
          firstEndKey;
      }
    }

    initial.NO_DAYS =
      calculateLeaveDays(
        initial.LVE_DATE_FR,
        initial.LVE_DATE_TO,
        initial.LEAVE_STARTS,
        initial.LEAVE_ENDS,
      );

    initial.noDaysNww =
      initial.NO_DAYS;

    setFormData(initial);

    /*
     * Do NOT validate here.
     *
     * Especially do not validate balance before LVE_CODE
     * is selected.
     */
    setErrorMsg("");
    setIsBtnDisable(false);
  }, [
    lrData,
    modalDate,
    modalState?.fromDate,
    modalState?.toDate,
    mid,
  ]);

  /* ============================================================
     VALIDATE FORM FIELDS
  ============================================================ */

  const validateForm = (data) => {
    const newErrors = {};

    if (!data.LVE_CODE) {
      newErrors.LVE_CODE =
        "Leave Code is required";
    }

    if (!data.LVE_DATE_FR) {
      newErrors.LVE_DATE_FR =
        "From Date is required";
    }

    if (!data.LVE_DATE_TO) {
      newErrors.LVE_DATE_TO =
        "To Date is required";
    }

    if (!data.LEAVE_STARTS) {
      newErrors.LEAVE_STARTS =
        "Leave Starts is required";
    }

    if (!data.LEAVE_ENDS) {
      newErrors.LEAVE_ENDS =
        "Leave Ends is required";
    }

    if (
      !data.NO_DAYS ||
      Number(data.NO_DAYS) <= 0
    ) {
      newErrors.NO_DAYS =
        "Invalid number of days";
    }

    if (
      !data.REASON ||
      data.REASON.trim() === ""
    ) {
      newErrors.REASON =
        "Reason is required";
    }

    /*
     * To date cannot be before From date.
     */
    if (
      data.LVE_DATE_FR &&
      data.LVE_DATE_TO
    ) {
      const from = moment(
        data.LVE_DATE_FR,
        "YYYY-MM-DD",
        true,
      );

      const to = moment(
        data.LVE_DATE_TO,
        "YYYY-MM-DD",
        true,
      );

      if (
        from.isValid() &&
        to.isValid() &&
        to.isBefore(from, "day")
      ) {
        newErrors.LVE_DATE_TO =
          "To Date cannot be before From Date";
      }
    }

    setErrors(newErrors);

    return Object.keys(newErrors)
      .length === 0;
  };

  /* ============================================================
     CL / OL / PL / PLC VALIDATION
  ============================================================ */

  const validateLeaveStatus = async (data) => {
  /* ============================================================
     DO NOT VALIDATE UNTIL LEAVE CODE IS SELECTED
  ============================================================ */

  if (!data?.LVE_CODE) {
    return {
      status: true,
      message: "",
    };
  }

  /* ============================================================
     DO NOT VALIDATE UNTIL BOTH DATES ARE AVAILABLE
  ============================================================ */

  if (
    !data?.LVE_DATE_FR ||
    !data?.LVE_DATE_TO
  ) {
    return {
      status: true,
      message: "",
    };
  }

  const leaveCode = String(
    data.LVE_CODE || ""
  )
    .trim()
    .toUpperCase();

  const noDays = Number(
    data.NO_DAYS || 0
  );

  /* ============================================================
     CL VALIDATION
  ============================================================ */

  if (leaveCode === "CL") {
    try {
      console.log(
        "========== SENDING CL VALIDATION =========="
      );

      console.log({
        ClValidate: true,
        EMP_CODE: data.EMP_CODE,
        no_days: data.NO_DAYS,
        fr_dt: data.LVE_DATE_FR,
        to_dt: data.LVE_DATE_TO,
      });

      const responseCL = await checkCL({
        ClValidate: true,
        EMP_CODE: data.EMP_CODE,
        no_days: data.NO_DAYS,
        fr_dt: data.LVE_DATE_FR,
        to_dt: data.LVE_DATE_TO,
      });

      console.log(
        "========== CL VALIDATION RESPONSE =========="
      );

      console.log(responseCL);

      /*
       * Depending on your axios service implementation,
       * response can be:
       *
       * 1. { status: false, message: "..." }
       *
       * OR
       *
       * 2. { data: { status: false, message: "..." } }
       */

      const result =
        responseCL?.data &&
        typeof responseCL.data === "object" &&
        (
          responseCL.data.status !== undefined ||
          responseCL.data.message !== undefined
        )
          ? responseCL.data
          : responseCL;

      console.log(
        "Normalized CL Response:",
        result
      );

      /* --------------------------------------------------------
         API VALIDATION FAILED
      -------------------------------------------------------- */

      if (result?.status === false) {
        return {
          status: false,
          message:
            result?.message ||
            "CL Leaves verification failed.",
        };
      }

      /* --------------------------------------------------------
         API VALIDATION SUCCESS
      -------------------------------------------------------- */

      return {
        status: true,
        message: "",
      };

    } catch (error) {
      console.error(
        "CL validation error:",
        error
      );

      /*
       * Try to extract backend error message
       */

      const apiError =
        error?.response?.data;

      return {
        status: false,
        message:
          apiError?.message ||
          error?.message ||
          "Unable to validate CL leave.",
      };
    }
  }

  /* ============================================================
     OL VALIDATION
  ============================================================ */

  if (leaveCode === "OL") {
    const dateStart =
      data.LVE_DATE_FR;

    if (!dateStart) {
      return {
        status: true,
        message: "",
      };
    }

    try {
      const responseOL = await checkOL({
        OlValidate: true,
        EMP_CODE: data.EMP_CODE,
        lv_type: leaveCode,
        attd_date: dateStart,
      });

      console.log(
        "OL Validation Response:",
        responseOL
      );

      const result =
        responseOL?.data &&
        typeof responseOL.data === "object" &&
        responseOL.data.data !== undefined
          ? responseOL.data
          : responseOL;

      const olResult =
        result?.data;

      if (
        olResult === 1 ||
        olResult === "1"
      ) {
        const today =
          moment().startOf("day");

        const selected =
          moment(
            dateStart,
            "YYYY-MM-DD",
            true
          ).startOf("day");

        const difference =
          selected.diff(
            today,
            "days"
          );

        if (difference <= 5) {
          return {
            status: false,
            message:
              "Note: Optional leave has to be informed atleast 6 days prior!",
          };
        }
      }

      if (
        olResult === 0 ||
        olResult === "0"
      ) {
        return {
          status: false,
          message:
            "Optional leave for this date is not applicable!",
        };
      }

      return {
        status: true,
        message: "",
      };

    } catch (error) {
      console.error(
        "OL validation error:",
        error
      );

      return {
        status: false,
        message:
          error?.response?.data?.message ||
          error?.message ||
          "Optional leave validation failed.",
      };
    }
  }

  /* ============================================================
     PL VALIDATION
  ============================================================ */

  if (leaveCode === "PL") {
    const numDays =
      Number(
        data.NO_DAYS ||
        calculateLeaveDays(
          data.LVE_DATE_FR,
          data.LVE_DATE_TO,
          data.LEAVE_STARTS,
          data.LEAVE_ENDS
        )
      );

    if (
      Number(data.PL_COUNT || 0) >= 3 ||
      numDays <= 2
    ) {
      return {
        status: false,
        message:
          "PL can avail only 3/year and should be minimum 3 days!",
      };
    }
  }

  /* ============================================================
     PLC VALIDATION
  ============================================================ */

  if (leaveCode === "PLC") {
    const eff = moment(data.EFF_DATE);
    const upto = moment(data.UPTO_DATE);

    const from = moment(data.LVE_DATE_FR);
    const to = moment(data.LVE_DATE_TO);

    if (
      !from.isBetween(
        eff,
        upto,
        null,
        "[]"
      ) ||
      !to.isBetween(
        eff,
        upto,
        null,
        "[]"
      )
    ) {
      return {
        status: false,
        message:
          "PLC not applicable for selected dates",
      };
    }
  }

  /* ============================================================
     NO DAYS VALIDATION
  ============================================================ */

  if (noDays <= 0) {
    return {
      status: false,
      message:
        "Cannot proceed further. No. of days are zero or negative.",
    };
  }

  /* ============================================================
     LEAVE BALANCE
  ============================================================ */

  const netBalance =
    Number(data.NET_BAL || 0);

  const unauthorizedBalance =
    Number(data.UNAUTH_BAL || 0);

  const availableBalance =
    netBalance -
    unauthorizedBalance;

  /*
   * LWP does not require balance.
   */

  if (leaveCode !== "LWP") {
    if (
      noDays > availableBalance
    ) {
      return {
        status: false,
        message:
          "Insufficient leave balance",
      };
    }
  }

  /* ============================================================
     EVERYTHING VALID
  ============================================================ */

  return {
    status: true,
    message: "",
  };
};

  /* ============================================================
     RUN BUSINESS VALIDATION
  ============================================================ */

  const validateCurrentLeave = async (
    data,
  ) => {
    /*
     * CRITICAL:
     * No leave code = no business validation.
     */
    if (!data?.LVE_CODE) {
      setErrorMsg("");
      setIsBtnDisable(false);

      return {
        status: true,
        message: "",
      };
    }

    /*
     * Don't validate until both dates exist.
     */
    if (
      !data.LVE_DATE_FR ||
      !data.LVE_DATE_TO
    ) {
      setErrorMsg("");
      setIsBtnDisable(false);

      return {
        status: true,
        message: "",
      };
    }

    const validation =
      await validateLeaveStatus(data);

    if (!validation.status) {
      setErrorMsg(
        validation.message || "",
      );

      setIsBtnDisable(true);

      return validation;
    }

    setErrorMsg("");
    setIsBtnDisable(false);

    return validation;
  };

  /* ============================================================
     TEXT CHANGE
  ============================================================ */

  const handleChangeTxT = (e) => {
    const {
      name,
      value,
    } = e.target;

    /*
     * 200 BYTE LIMIT
     */
    if (
      [
        "REMARKS",
        "AUTH_REMARKS",
        "REASON",
      ].includes(name)
    ) {
      if (
        getByteLength(value) > 200
      ) {
        return;
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => {
        const next = {
          ...prev,
        };

        delete next[name];

        return next;
      });
    }
  };

  /* ============================================================
     SELECT CHANGE
  ============================================================ */

  const handleChange = async (e) => {
  const { name, value } = e.target;

  let updated = {
    ...formData,
    [name]: value,
  };

  /* ---------------------------------------------------------
     Clear field error
  --------------------------------------------------------- */

  if (errors[name]) {
    setErrors((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }


  /* ---------------------------------------------------------
     Leave Code
  --------------------------------------------------------- */

  if (name === "LVE_CODE") {

    const selected = leaveBal[value];

    updated.BAL = selected?.[0] ?? 0;
    updated.UNAUTH_BAL = selected?.[2] ?? 0;
    updated.NET_BAL = selected?.[1] ?? 0;
  }


  /* ---------------------------------------------------------
     Calculate leave days ONLY when both dates exist
  --------------------------------------------------------- */

  const fromDate = updated.LVE_DATE_FR;
  const toDate = updated.LVE_DATE_TO;

  let noDays = 0;


  if (fromDate && toDate) {

    const start = moment(fromDate, "YYYY-MM-DD", true);
    const end = moment(toDate, "YYYY-MM-DD", true);


    if (
      start.isValid() &&
      end.isValid()
    ) {

      if (end.isBefore(start, "day")) {

        noDays = 0;

      } else {

        /*
         * Inclusive date calculation
         *
         * 21 -> 21 = 1
         * 21 -> 22 = 2
         * 21 -> 23 = 3
         */

        noDays =
          end.diff(start, "days") + 1;
      }
    }
  }


  /* ---------------------------------------------------------
     Half-day adjustment
  --------------------------------------------------------- */

  const leaveStart = updated.LEAVE_STARTS;
  const leaveEnd = updated.LEAVE_ENDS;


  if (
    noDays > 0 &&
    (
      (leaveStart === "M" && leaveEnd === "E") ||
      (leaveStart === "B" && leaveEnd === "M")
    )
  ) {

    noDays = noDays - 0.5;
  }


  updated.NO_DAYS = noDays;
  updated.noDaysNww = noDays;


  /* ---------------------------------------------------------
     IMPORTANT:
     Do not run CL/PL/OL validation until:

     Leave Code
     From Date
     To Date

     are all available.
  --------------------------------------------------------- */

  if (
    updated.LVE_CODE &&
    updated.LVE_DATE_FR &&
    updated.LVE_DATE_TO &&
    noDays > 0
  ) {

    try {

      const isAllow =
        await validateLeaveStatus(updated);


      if (!isAllow.status) {

        setErrorMsg(isAllow.message);
        setIsBtnDisable(true);

      } else {

        setErrorMsg("");
        setIsBtnDisable(false);
      }

    } catch (err) {

      console.error(
        "Leave validation error:",
        err
      );

      setErrorMsg(
        "Unable to validate leave."
      );

      setIsBtnDisable(true);
    }

  } else {

    /*
     * No leave validation yet.
     *
     * This prevents:
     * "Insufficient leave balance"
     * appearing before Leave Code selection.
     */

    setErrorMsg("");
    setIsBtnDisable(false);
  }


  setFormData(updated);
};

  /* ============================================================
     SAVE
  ============================================================ */

  const handleSave = async (e) => {
    e.preventDefault();

    /*
     * Prevent double-click / duplicate requests.
     */
    if (isSubmitting) {
      return;
    }

    /*
     * First standard field validation.
     */
    const isValid =
      validateForm(formData);

    if (!isValid) {
      return;
    }

    /*
     * IMPORTANT:
     *
     * Run business validation again immediately before saving.
     *
     * This protects against:
     * - CL monthly limit
     * - CL max 2 days
     * - insufficient balance
     * - OL restrictions
     * - PLC restrictions
     */
    setIsSubmitting(true);

    try {
      const validation =
        await validateLeaveStatus(
          formData,
        );

      if (!validation.status) {
        setErrorMsg(
          validation.message ||
            "Leave validation failed.",
        );

        setIsBtnDisable(true);
        setIsSubmitting(false);

        return;
      }

      setErrorMsg("");
      setIsBtnDisable(false);

      const isEdit =
        modalState?.mode === "edit";

      const payload = {
        ...formData,

        ...(isEdit
          ? {
              editLrData: true,
            }
          : {
              saveLrData: true,
            }),
      };

      console.log(
        "Leave Save Payload:",
        payload,
      );

      const apiCall = isEdit
        ? editLRData
        : saveLRData;

      const response =
        await apiCall(payload);

      console.log(
        "Leave Save Response:",
        response,
      );

      if (response?.status) {
        notifySuccess(
          response?.message ||
            `Leave Request ${
              isEdit
                ? "updated"
                : "saved"
            } successfully.`,
        );

        resetForm();

        onSuccess?.();

        closeModal();

        return;
      }

      /*
       * If backend rejects save, show backend message
       * at TOP of modal instead of generic failure.
       */
      const backendMessage =
        response?.message ||
        response?.data?.message ||
        "Unable to save Leave Request.";

      setErrorMsg(
        backendMessage,
      );

      setIsSubmitting(false);
    } catch (err) {
      console.error(
        "Submit Error:",
        err,
      );

      const backendMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Something went wrong while saving data.";

      setErrorMsg(
        backendMessage,
      );

      setIsSubmitting(false);
    }
  };

  /* ============================================================
     SAVE + AUTH
  ============================================================ */

  const handleSaveAuth = async (e) => {
    e.preventDefault();

    if (isSubmitting) {
      return;
    }

    const isValid =
      validateForm(formData);

    if (!isValid) {
      return;
    }

    setIsSubmitting(true);

    try {
      /*
       * Run same validation before AUTH save.
       */
      const validation =
        await validateLeaveStatus(
          formData,
        );

      if (!validation.status) {
        setErrorMsg(
          validation.message ||
            "Leave validation failed.",
        );

        setIsBtnDisable(true);
        setIsSubmitting(false);

        return;
      }

      setErrorMsg("");
      setIsBtnDisable(false);

      const isEdit =
        modalState?.mode === "edit";

      const payload = {
        ...formData,

        ...(isEdit
          ? {
              editLrData: true,
            }
          : {
              saveLrData: true,
            }),

        withAuth: true,
      };

      const apiCall = isEdit
        ? editLRDataAUTH
        : saveLRDataAUTH;

      const response =
        await apiCall(payload);

      if (response?.status) {
        notifySuccess(
          response?.message ||
            `Leave Request ${
              isEdit
                ? "updated"
                : "saved"
            } successfully.`,
        );

        resetForm();

        onSuccess?.();

        closeModal();

        return;
      }

      const backendMessage =
        response?.message ||
        response?.data?.message ||
        "Unable to save Leave Request.";

      setErrorMsg(
        backendMessage,
      );

      setIsSubmitting(false);
    } catch (err) {
      console.error(
        "Submit Auth Error:",
        err,
      );

      setErrorMsg(
        err?.response?.data?.message ||
          err?.message ||
          "Something went wrong while saving data.",
      );

      setIsSubmitting(false);
    }
  };

  /* ============================================================
     CALENDAR LIMITS
  ============================================================ */

  const calendarMinDate =
    moment()
      .startOf("month")
      .toDate();

  const calendarMaxDate =
    moment()
      .add(1, "month")
      .endOf("month")
      .toDate();

  /* ============================================================
     JSX
  ============================================================ */

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      aria-hidden="false"
      role="dialog"
      style={{
        backgroundColor:
          "rgba(0,0,0,0.5)",
      }}
    >
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content">
          {/* ====================================================
              HEADER
          ==================================================== */}

          <div className="modal-header">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                width: "100%",
              }}
            >
              <h4 className="modal-title mb-1">
                Apply For Leave Request
              </h4>

              {errorMsg && (
                <span
                  className="text-danger ms-2 fs-16"
                  style={{
                    fontWeight: 500,
                  }}
                >
                  {errorMsg}
                </span>
              )}
            </div>

            <button
              type="button"
              className="btn-close custom-btn-close p-0"
              onClick={handleCloseModal}
              aria-label="Close"
              disabled={isSubmitting}
            >
              <i className="ti ti-x" />
            </button>
          </div>

          {/* ====================================================
              FORM
          ==================================================== */}

          <form onSubmit={handleSave}>
            <div className="modal-body">
              {/* ==================================================
                  LEAVE BALANCE
              ================================================== */}

              <div className="row mb-4">
                {Object.entries(
                  leaveBal || {},
                ).map(
                  ([key, values]) => (
                    <div
                      className="col text-center"
                      key={key}
                    >
                      <h6 className="text-info">
                        {key}
                      </h6>

                      <strong>
                        {values?.[1] ??
                          0}{" "}
                        /{" "}
                        {values?.[0] ??
                          0}
                      </strong>
                    </div>
                  ),
                )}
              </div>

              {/* ==================================================
                  ROW 1
              ================================================== */}

              <div className="row mb-3">
                {/* LEAVE CODE */}

                <div className="col-md-3">
                  <label>
                    Leave Code
                  </label>

                  <select
                    className={`select2 form-control ${
                      errors.LVE_CODE
                        ? "is-invalid"
                        : ""
                    }`}
                    name="LVE_CODE"
                    value={
                      formData.LVE_CODE ||
                      ""
                    }
                    onChange={
                      handleChange
                    }
                    disabled={
                      isReadOnly ||
                      isSubmitting
                    }
                  >
                    <option
                      value=""
                      disabled
                    >
                      Select Leave Code
                    </option>

                    {(
                      config?.type
                        ?.SELECT
                        ?.LVE_CODE
                        ?.options || []
                    ).map((opt) => (
                      <option
                        key={
                          opt.LVE_CODE
                        }
                        value={
                          opt.LVE_CODE
                        }
                      >
                        {opt.LVED}
                      </option>
                    ))}
                  </select>

                  {errors.LVE_CODE && (
                    <div className="invalid-feedback">
                      {
                        errors.LVE_CODE
                      }
                    </div>
                  )}
                </div>

                {/* ALLOTTED */}

                <div className="col-md-3">
                  <label>
                    Alloted
                  </label>

                  <input
                    className="form-control"
                    value={
                      formData.BAL ??
                      0
                    }
                    readOnly
                  />
                </div>

                {/* UNAPPROVED */}

                <div className="col-md-3">
                  <label>
                    Unapproved
                  </label>

                  <input
                    className="form-control"
                    value={
                      formData.UNAUTH_BAL ??
                      0
                    }
                    readOnly
                  />
                </div>

                {/* NET */}

                <div className="col-md-3">
                  <label>
                    Net Balance
                  </label>

                  <input
                    className="form-control"
                    value={
                      formData.NET_BAL ??
                      0
                    }
                    readOnly
                  />
                </div>
              </div>

              {/* ==================================================
                  ROW 2 - FROM DATE + START
              ================================================== */}

              <div className="row mb-3">
                {/* FROM DATE */}

                <div className="col-md-6">
                  <label>
                    From Date
                  </label>

                  <SDLCalendar
                    value={toCalendarDate(
                      formData.LVE_DATE_FR,
                    )}
                    onChange={(date) =>
                      handleCalendarDateChange(
                        "LVE_DATE_FR",
                        date,
                      )
                    }
                    minDate={
                      calendarMinDate
                    }
                    maxDate={
                      calendarMaxDate
                    }
                    allowAllDates={true}
                    disabled={
                      isReadOnly ||
                      isSubmitting ||
                      /*
                       * Keep the old behaviour:
                       * In CREATE mode the date selected
                       * on the main calendar automatically
                       * populates From Date.
                       *
                       * If you want user to manually change
                       * From Date, remove this isCreateMode.
                       */
                      isCreateMode
                    }
                  />

                  {errors.LVE_DATE_FR && (
                    <div className="text-danger small mt-1">
                      {
                        errors.LVE_DATE_FR
                      }
                    </div>
                  )}
                </div>

                {/* LEAVE STARTS */}

                <div className="col-md-6">
                  <label>
                    Leave Starts
                  </label>

                  <select
                    className={`select2 form-control ${
                      errors.LEAVE_STARTS
                        ? "is-invalid"
                        : ""
                    }`}
                    name="LEAVE_STARTS"
                    value={
                      formData.LEAVE_STARTS ||
                      ""
                    }
                    onChange={
                      handleChange
                    }
                    disabled={
                      isSTENDLocked ||
                      isReadOnly ||
                      isSubmitting
                    }
                  >
                    <option value="">
                      Select
                    </option>

                    {Object.entries(
                      config?.type
                        ?.SELECT
                        ?.LEAVE_STARTS
                        ?.options ||
                        {},
                    ).map(
                      ([key, value]) => (
                        <option
                          key={key}
                          value={key}
                        >
                          {value}
                        </option>
                      ),
                    )}
                  </select>

                  {errors.LEAVE_STARTS && (
                    <div className="invalid-feedback">
                      {
                        errors.LEAVE_STARTS
                      }
                    </div>
                  )}
                </div>
              </div>

              {/* ==================================================
                  ROW 3 - TO DATE + END
              ================================================== */}

              <div className="row mb-3">
                {/* TO DATE */}

                <div className="col-md-6">
                  <label>
                    To Date
                  </label>

                  <SDLCalendar
                    value={toCalendarDate(
                      formData.LVE_DATE_TO,
                    )}
                    onChange={(date) =>
                      handleCalendarDateChange(
                        "LVE_DATE_TO",
                        date,
                      )
                    }
                    minDate={
                      /*
                       * To Date should never be before
                       * From Date.
                       */
                      formData.LVE_DATE_FR
                        ? toCalendarDate(
                            formData.LVE_DATE_FR,
                          )
                        : calendarMinDate
                    }
                    maxDate={
                      calendarMaxDate
                    }
                    allowAllDates={true}
                    disabled={
                      isReadOnly ||
                      isSubmitting
                    }
                  />

                  {errors.LVE_DATE_TO && (
                    <div className="text-danger small mt-1">
                      {
                        errors.LVE_DATE_TO
                      }
                    </div>
                  )}
                </div>

                {/* LEAVE ENDS */}

                <div className="col-md-6">
                  <label>
                    Leave Ends
                  </label>

                  <select
                    className={`select2 form-control ${
                      errors.LEAVE_ENDS
                        ? "is-invalid"
                        : ""
                    }`}
                    name="LEAVE_ENDS"
                    value={
                      formData.LEAVE_ENDS ||
                      ""
                    }
                    onChange={
                      handleChange
                    }
                    disabled={
                      isSTENDLocked ||
                      isReadOnly ||
                      isSubmitting
                    }
                  >
                    <option value="">
                      Select
                    </option>

                    {Object.entries(
                      config?.type
                        ?.SELECT
                        ?.LEAVE_ENDS
                        ?.options ||
                        {},
                    ).map(
                      ([key, value]) => (
                        <option
                          key={key}
                          value={key}
                        >
                          {value}
                        </option>
                      ),
                    )}
                  </select>

                  {errors.LEAVE_ENDS && (
                    <div className="invalid-feedback">
                      {
                        errors.LEAVE_ENDS
                      }
                    </div>
                  )}
                </div>
              </div>

              {/* ==================================================
                  ROW 4 - DAYS + REASON
              ================================================== */}

              <div className="row mb-3">
                {/* DAYS */}

                <div className="col-md-4">
                  <label>
                    No Of Days
                  </label>

                  <input
                    className={`form-control ${
                      errors.NO_DAYS
                        ? "is-invalid"
                        : ""
                    }`}
                    value={
                      formData.NO_DAYS ??
                      ""
                    }
                    readOnly
                  />

                  {errors.NO_DAYS && (
                    <div className="invalid-feedback">
                      {
                        errors.NO_DAYS
                      }
                    </div>
                  )}
                </div>

                {/* REASON */}

                <div className="col-md-8">
                  <label>
                    Reason
                  </label>

                  <div
                    className="position-relative"
                  >
                    <textarea
                      className={`form-control ${
                        errors.REASON
                          ? "is-invalid"
                          : ""
                      }`}
                      name="REASON"
                      value={
                        formData.REASON ||
                        ""
                      }
                      onChange={
                        handleChangeTxT
                      }
                      disabled={
                        isReadOnly ||
                        isSubmitting
                      }
                      style={{
                        paddingBottom:
                          "20px",
                      }}
                    />

                    {errors.REASON && (
                      <div className="invalid-feedback">
                        {
                          errors.REASON
                        }
                      </div>
                    )}

                    <div
                      style={{
                        position:
                          "absolute",
                        bottom: "2px",
                        right: "8px",
                        fontSize:
                          "11px",
                        color:
                          getByteLength(
                            formData.REASON ||
                              "",
                          ) > 180
                            ? "red"
                            : "#666",
                        background:
                          "#fff",
                        padding:
                          "0 4px",
                      }}
                    >
                      {getByteLength(
                        formData.REASON ||
                          "",
                      )}{" "}
                      / 200
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ====================================================
                HIDDEN FIELDS
            ==================================================== */}

            {Object.values(
              config?.type?.HIDDEN ||
                {},
            ).map((field, i) => (
              <input
                key={i}
                type="hidden"
                name={field.name}
                value={
                  formData[
                    field.name
                  ] || ""
                }
              />
            ))}

            {/* ====================================================
                FOOTER
            ==================================================== */}

            <div className="modal-footer">
              <div className="d-flex gap-2">
                {mode === "create" && (
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={
                      isSubmitting ||
                      isBtnDisable ||
                      !isLeaveAllowed
                    }
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" />

                        Processing...
                      </>
                    ) : (
                      "Save"
                    )}
                  </button>
                )}

                <button
                  type="button"
                  className="btn btn-secondary me-2"
                  onClick={
                    handleCloseModal
                  }
                  disabled={
                    isSubmitting
                  }
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LeavesModal;