import { useEffect, useState, useRef } from "react";

import {
    saveForm12B,
    getForm12B
} from "../../../../services/itReturnService";

import {
    notifySuccess,
    notifyError,
    notifyWarning
} from "../../../../../../services/alertService";

import { ITR_MESSAGES } from "../../../../constants/itrMessages";

import SDLCalendar from '../../../../../../components/calendar/SDLCalendar'

export const Form12BTab = ({ editable }) => {

    /* =========================================
       FORM DATA
    ========================================= */
    const [formData, setFormData] = useState({
        id: "",
        previousEmployerName: "",
        previousEmployerAddress: "",
        tanNumber: "",
        panNumber: "",
        fromDate: "",
        toDate: "",
        totalSalary: "",
        hra: "",
        perquisites: "",
        total: "",
        insurance: "",
        tds: "",
        remarks: "",
    });

    const [eligible, setEligible] = useState(true);

    const [errors, setErrors] = useState({});

    // NEW: Save button state
    const [saving, setSaving] = useState(false);

    const isEditable = Boolean(editable);

    // Prevent duplicate API call
    const hasFetched = useRef(false);

    /* =========================================
       FETCH DATA
    ========================================= */
    const fetchFormData = async () => {

        try {

            const res = await getForm12B();

            if (res?.status) {

                const {
                    eligible = true,
                    form12B = {},
                } = res.data || {};

                setEligible(true);

                if (form12B?.ID) {

                    setFormData({
                        id: form12B.ID || "",

                        previousEmployerName:
                            form12B.NAME_PREVEMP || "",

                        previousEmployerAddress:
                            form12B.ADDRESS_PREVEMP || "",

                        tanNumber:
                            form12B.TAN_PREVEMP || "",

                        panNumber:
                            form12B.PAN_PREVEMP || "",

                        fromDate:
                            form12B.FROM_PREVEMP || "",

                        toDate:
                            form12B.TO_PREVEMP || "",

                        totalSalary:
                            form12B.TOTAL_SALARY || "",

                        hra:
                            form12B.HRA_CA_OTH_ALLOWANCE || "",

                        perquisites:
                            form12B.PERQUISITE_AND_PF || "",

                        total:
                            form12B.TOTAL_5_6_7 || "",

                        insurance:
                            form12B.AMOUNT_DEDUCTED_LI_PF || "",

                        tds:
                            form12B.TOTAL_TAX_DEDUCTED || "",

                        remarks:
                            form12B.REMARKS || "",
                    });

                } else {

                    setFormData({
                        id: "",
                        previousEmployerName: "",
                        previousEmployerAddress: "",
                        tanNumber: "",
                        panNumber: "",
                        fromDate: "",
                        toDate: "",
                        totalSalary: "",
                        hra: "",
                        perquisites: "",
                        total: "",
                        insurance: "",
                        tds: "",
                        remarks: "",
                    });
                }
            }

        } catch (error) {

            console.error(error);

            notifyError(
                ITR_MESSAGES.FAILED_LOAD_FORM12B
            );
        }
    };

    /* =========================================
       INITIAL LOAD
    ========================================= */
    useEffect(() => {

        if (hasFetched.current) {
            return;
        }

        hasFetched.current = true;

        fetchFormData();

    }, []);

    /* =========================================
       DATE -> YYYY-MM-DD
    ========================================= */
    const formatDateForForm = (date) => {

        if (!date) {
            return "";
        }

        const year = date.getFullYear();

        const month = String(
            date.getMonth() + 1
        ).padStart(2, "0");

        const day = String(
            date.getDate()
        ).padStart(2, "0");

        return `${year}-${month}-${day}`;
    };

    /* =========================================
       YYYY-MM-DD -> DATE
    ========================================= */
    const getCalendarDate = (value) => {

        if (!value) {
            return null;
        }

        // If already Date
        if (value instanceof Date) {
            return value;
        }

        // Handles YYYY-MM-DD safely
        const parts = String(value).split("-");

        if (parts.length === 3) {

            const year = Number(parts[0]);
            const month = Number(parts[1]) - 1;
            const day = Number(parts[2]);

            const date = new Date(
                year,
                month,
                day
            );

            if (!isNaN(date.getTime())) {
                return date;
            }
        }

        return null;
    };

    /* =========================================
       DATE CHANGE
    ========================================= */
    const handleDateChange = (field, date) => {

        const formattedDate =
            formatDateForForm(date);

        setFormData((prev) => ({
            ...prev,
            [field]: formattedDate,
        }));

        setErrors((prev) => ({
            ...prev,
            [field]: "",
        }));
    };

    /* =========================================
       NORMAL INPUT CHANGE
    ========================================= */
    const handleChange = (e) => {

        const {
            name,
            value
        } = e.target;

        setFormData((prev) => {

            const updated = {
                ...prev,
                [name]: value,
            };

            // Automatically calculate total
            updated.total = (
                Number(updated.totalSalary || 0) +
                Number(updated.hra || 0) +
                Number(updated.perquisites || 0)
            ).toString();

            return updated;
        });

        setErrors((prev) => ({
            ...prev,
            [name]: "",
        }));
    };

    /* =========================================
       VALIDATION
    ========================================= */
    const validateForm = () => {

        const newErrors = {};

        /* -----------------------------------------
           EMPLOYER NAME
        ----------------------------------------- */
        if (!String(formData.previousEmployerName || "").trim()) {

            newErrors.previousEmployerName =
                "Previous Employer Name is required";
        }

        /* -----------------------------------------
           EMPLOYER ADDRESS
        ----------------------------------------- */
        if (!String(formData.previousEmployerAddress || "").trim()) {

            newErrors.previousEmployerAddress =
                "Previous Employer Address is required";
        }

        /* -----------------------------------------
           TAN
        ----------------------------------------- */
        if (!String(formData.tanNumber || "").trim()) {

            newErrors.tanNumber =
                "TAN Number is required";

        } else if (
            !/^[A-Z]{4}[0-9]{5}[A-Z]$/i.test(
                formData.tanNumber.trim()
            )
        ) {

            newErrors.tanNumber =
                "Enter valid TAN Number";
        }

        /* -----------------------------------------
           PAN
        ----------------------------------------- */
        if (!String(formData.panNumber || "").trim()) {

            newErrors.panNumber =
                "PAN Number is required";

        } else if (
            !/^[A-Z]{5}[0-9]{4}[A-Z]$/i.test(
                formData.panNumber.trim()
            )
        ) {

            newErrors.panNumber =
                "Enter valid PAN Number";
        }

        /* -----------------------------------------
           FROM DATE
        ----------------------------------------- */
        if (!formData.fromDate) {

            newErrors.fromDate =
                "From Date is required";
        }

        /* -----------------------------------------
           TO DATE
        ----------------------------------------- */
        if (!formData.toDate) {

            newErrors.toDate =
                "To Date is required";
        }

        /* -----------------------------------------
           DATE COMPARISON
        ----------------------------------------- */
        if (
            formData.fromDate &&
            formData.toDate
        ) {

            const fromDate =
                getCalendarDate(formData.fromDate);

            const toDate =
                getCalendarDate(formData.toDate);

            if (
                fromDate &&
                toDate &&
                toDate < fromDate
            ) {

                newErrors.toDate =
                    "To Date cannot be earlier than From Date";
            }
        }

        /* -----------------------------------------
           NUMERIC FIELDS
        ----------------------------------------- */
        const numericFields = [
            "totalSalary",
            "hra",
            "perquisites",
            "total",
            "insurance",
            "tds",
        ];

        numericFields.forEach((field) => {

            const value = String(
                formData[field] ?? ""
            ).trim();

            if (!value) {

                newErrors[field] =
                    "This field is required";

            } else if (
                isNaN(value) ||
                Number(value) < 0
            ) {

                newErrors[field] =
                    "Enter valid positive number";
            }
        });

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    /* =========================================
       SAVE
    ========================================= */
    const handleSave = async () => {

        // Prevent double click
        if (saving) {
            return;
        }

        if (!eligible) {

            notifyWarning(
                ITR_MESSAGES.FORM12B_NOT_ELIGIBLE
            );

            return;
        }

        /* -----------------------------------------
           VALIDATE FIRST
        ----------------------------------------- */
        const isValid = validateForm();

        if (!isValid) {
            return;
        }

        /*
         * IMPORTANT:
         * Disable button immediately after validation
         * and before API call.
         */
        setSaving(true);

        try {

            const res = await saveForm12B(formData);

            if (res?.status) {

                notifySuccess(
                    res?.message ||
                    ITR_MESSAGES.FORM12B_SAVED
                );

                await fetchFormData();

                // Clear validation errors
                setErrors({});

            } else {

                notifyError(
                    res?.message ||
                    ITR_MESSAGES.FORM12B_SAVE_FAILED
                );
            }

        } catch (error) {

            console.error(error);

            notifyError(
                ITR_MESSAGES.FORM12B_SAVE_FAILED
            );

        } finally {

            /*
             * Re-enable only after API request completes.
             */
            setSaving(false);
        }
    };

    return (
        <>
            {/* =========================================
                EDIT WARNING
            ========================================= */}

            {!editable && (
                <div className="alert alert-warning mb-3">
                    {ITR_MESSAGES.ITR_EDIT}
                </div>
            )}

            <div>

                {/* =========================================
                    HEADING
                ========================================= */}

                <h5 className="text-danger text-center mb-4">
                    {ITR_MESSAGES.FORM12B_HEADING}
                </h5>

                {/* =========================================
                    ELIGIBILITY
                ========================================= */}

                {!eligible && (
                    <div className="alert alert-warning text-center">
                        {ITR_MESSAGES.FORM12B_NOT_ELIGIBLE}
                    </div>
                )}

                <input
                    type="hidden"
                    name="id"
                    value={formData.id}
                />

                <div className="row">

                    {/* =====================================
                        1A) EMPLOYER NAME
                    ===================================== */}

                    <div className="col-md-4 mb-3">

                        <label className="form-label">
                            1A) Name of Previous Employer
                            <span className="text-danger"> *</span>
                        </label>

                        <input
                            type="text"
                            name="previousEmployerName"
                            className={`form-control ${
                                errors.previousEmployerName
                                    ? "is-invalid"
                                    : ""
                            }`}
                            value={formData.previousEmployerName}
                            onChange={handleChange}
                        />

                        {errors.previousEmployerName && (
                            <div className="invalid-feedback">
                                {errors.previousEmployerName}
                            </div>
                        )}

                    </div>

                    {/* =====================================
                        1B) EMPLOYER ADDRESS
                    ===================================== */}

                    <div className="col-md-4 mb-3">

                        <label className="form-label">
                            1B) Address of Previous Employer
                            <span className="text-danger"> *</span>
                        </label>

                        <input
                            type="text"
                            name="previousEmployerAddress"
                            className={`form-control ${
                                errors.previousEmployerAddress
                                    ? "is-invalid"
                                    : ""
                            }`}
                            value={formData.previousEmployerAddress}
                            onChange={handleChange}
                        />

                        {errors.previousEmployerAddress && (
                            <div className="invalid-feedback">
                                {errors.previousEmployerAddress}
                            </div>
                        )}

                    </div>

                    {/* =====================================
                        2) TAN
                    ===================================== */}

                    <div className="col-md-4 mb-3">

                        <label className="form-label">
                            2) TAN Number of Previous Employer
                            <span className="text-danger"> *</span>
                        </label>

                        <input
                            type="text"
                            name="tanNumber"
                            className={`form-control ${
                                errors.tanNumber
                                    ? "is-invalid"
                                    : ""
                            }`}
                            value={formData.tanNumber}
                            onChange={handleChange}
                            maxLength={10}
                            style={{
                                textTransform: "uppercase"
                            }}
                        />

                        {errors.tanNumber && (
                            <div className="invalid-feedback">
                                {errors.tanNumber}
                            </div>
                        )}

                    </div>

                    {/* =====================================
                        3) PAN
                    ===================================== */}

                    <div className="col-md-4 mb-3">

                        <label className="form-label">
                            3) PAN Number of Previous Employer
                            <span className="text-danger"> *</span>
                        </label>

                        <input
                            type="text"
                            name="panNumber"
                            className={`form-control ${
                                errors.panNumber
                                    ? "is-invalid"
                                    : ""
                            }`}
                            value={formData.panNumber}
                            onChange={handleChange}
                            maxLength={10}
                            style={{
                                textTransform: "uppercase"
                            }}
                        />

                        {errors.panNumber && (
                            <div className="invalid-feedback">
                                {errors.panNumber}
                            </div>
                        )}

                    </div>

                    {/* =====================================
                        4A) FROM DATE
                        DIRECTLY AFTER 3
                    ===================================== */}

                    <div className="col-md-4 mb-3">

                        <label className="form-label">
                            4A) FROM
                            <span className="text-danger"> *</span>
                        </label>

                        <SDLCalendar
                            value={getCalendarDate(
                                formData.fromDate
                            )}
                            onChange={(date) =>
                                handleDateChange(
                                    "fromDate",
                                    date
                                )
                            }
                            disabled={!isEditable}
                            allowAllDates={true}
                            className={`datepickers customdatePics ${
                                errors.fromDate
                                    ? "is-invalid"
                                    : ""
                            }`}
                        />

                        {errors.fromDate && (
                            <div className="text-danger small mt-1">
                                {errors.fromDate}
                            </div>
                        )}

                    </div>

                    {/* =====================================
                        4B) TO DATE
                    ===================================== */}

                    <div className="col-md-4 mb-3">

                        <label className="form-label">
                            4B) TO
                            <span className="text-danger"> *</span>
                        </label>

                        <SDLCalendar
                            value={getCalendarDate(
                                formData.toDate
                            )}
                            onChange={(date) =>
                                handleDateChange(
                                    "toDate",
                                    date
                                )
                            }
                            disabled={!isEditable}
                            allowAllDates={true}
                            className={`datepickers customdatePics ${
                                errors.toDate
                                    ? "is-invalid"
                                    : ""
                            }`}
                        />

                        {errors.toDate && (
                            <div className="text-danger small mt-1">
                                {errors.toDate}
                            </div>
                        )}

                    </div>

                    {/* =====================================
                        5) TOTAL SALARY
                    ===================================== */}

                    <div className="col-md-4 mb-3">

                        <label className="form-label">
                            5) Total Salary
                            <span className="text-danger"> *</span>
                        </label>

                        <input
                            type="number"
                            name="totalSalary"
                            min="0"
                            className={`form-control ${
                                errors.totalSalary
                                    ? "is-invalid"
                                    : ""
                            }`}
                            value={formData.totalSalary}
                            onChange={handleChange}
                        />

                        {errors.totalSalary && (
                            <div className="invalid-feedback">
                                {errors.totalSalary}
                            </div>
                        )}

                    </div>

                    {/* =====================================
                        6) HRA
                    ===================================== */}

                    <div className="col-md-4 mb-3">

                        <label className="form-label">
                            6) Total HRA
                            <span className="text-danger"> *</span>
                        </label>

                        <input
                            type="number"
                            name="hra"
                            min="0"
                            className={`form-control ${
                                errors.hra
                                    ? "is-invalid"
                                    : ""
                            }`}
                            value={formData.hra}
                            onChange={handleChange}
                        />

                        {errors.hra && (
                            <div className="invalid-feedback">
                                {errors.hra}
                            </div>
                        )}

                    </div>

                    {/* =====================================
                        7) PERQUISITES
                    ===================================== */}

                    <div className="col-md-4 mb-3">

                        <label className="form-label">
                            7) Value of Perquisites
                            <span className="text-danger"> *</span>
                        </label>

                        <input
                            type="number"
                            name="perquisites"
                            min="0"
                            className={`form-control ${
                                errors.perquisites
                                    ? "is-invalid"
                                    : ""
                            }`}
                            value={formData.perquisites}
                            onChange={handleChange}
                        />

                        {errors.perquisites && (
                            <div className="invalid-feedback">
                                {errors.perquisites}
                            </div>
                        )}

                    </div>

                    {/* =====================================
                        8) TOTAL
                    ===================================== */}

                    <div className="col-md-4 mb-3">

                        <label className="form-label">
                            8) Total [5+6+7]
                            <span className="text-danger"> *</span>
                        </label>

                        <input
                            type="number"
                            name="total"
                            className={`form-control ${
                                errors.total
                                    ? "is-invalid"
                                    : ""
                            }`}
                            value={formData.total}
                            readOnly
                        />

                        {errors.total && (
                            <div className="invalid-feedback">
                                {errors.total}
                            </div>
                        )}

                    </div>

                    {/* =====================================
                        9) INSURANCE
                    ===================================== */}

                    <div className="col-md-4 mb-3">

                        <label className="form-label">
                            9) Insurance / PF / 80C
                            <span className="text-danger"> *</span>
                        </label>

                        <input
                            type="number"
                            name="insurance"
                            min="0"
                            className={`form-control ${
                                errors.insurance
                                    ? "is-invalid"
                                    : ""
                            }`}
                            value={formData.insurance}
                            onChange={handleChange}
                        />

                        {errors.insurance && (
                            <div className="invalid-feedback">
                                {errors.insurance}
                            </div>
                        )}

                    </div>

                    {/* =====================================
                        10) TDS
                    ===================================== */}

                    <div className="col-md-4 mb-3">

                        <label className="form-label">
                            10) Total TDS Deducted
                            <span className="text-danger"> *</span>
                        </label>

                        <input
                            type="number"
                            name="tds"
                            min="0"
                            className={`form-control ${
                                errors.tds
                                    ? "is-invalid"
                                    : ""
                            }`}
                            value={formData.tds}
                            onChange={handleChange}
                        />

                        {errors.tds && (
                            <div className="invalid-feedback">
                                {errors.tds}
                            </div>
                        )}

                    </div>

                    {/* =====================================
                        REMARKS
                    ===================================== */}

                    <div className="col-md-4 mb-3">

                        <label className="form-label">
                            Remarks
                        </label>

                        <input
                            type="text"
                            name="remarks"
                            className="form-control"
                            value={formData.remarks}
                            onChange={handleChange}
                        />

                    </div>

                </div>

                {/* =========================================
                    SAVE BUTTON
                ========================================= */}

                {isEditable && (

                    <div className="text-center mt-3">

                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={handleSave}
                            disabled={
                                !eligible ||
                                saving
                            }
                        >

                            {saving ? (
                                <>
                                    <span
                                        className="spinner-border spinner-border-sm me-2"
                                        role="status"
                                        aria-hidden="true"
                                    ></span>

                                    Saving...
                                </>
                            ) : (
                                "Save"
                            )}

                        </button>

                    </div>
                )}

            </div>
        </>
    );
};

export default Form12BTab;