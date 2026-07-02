import { useEffect, useState, useRef } from "react";
import { saveForm12B, getForm12B } from "../../../../services/itReturnService";
import {
    notifySuccess,
    notifyError,
    notifyWarning
} from "../../../../../../services/alertService";

export const Form12BTab = ({ editable }) => {
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

    const isEditable = Boolean(editable);

    // PREVENT DUPLICATE API CALLS
    const hasFetched = useRef(false);

    /* =========================================
       FETCH DATA if exists
    ========================================= */
    const fetchFormData = async () => {
        try {
            const res = await getForm12B();

            if (res.status) {
                setEligible(res.eligible);

                if (res.data?.ID) {
                    setFormData({
                        id: res.data.ID || "",

                        previousEmployerName: res.data.NAME_PREVEMP || "",
                        previousEmployerAddress: res.data.ADDRESS_PREVEMP || "",
                        tanNumber: res.data.TAN_PREVEMP || "",
                        panNumber: res.data.PAN_PREVEMP || "",

                        fromDate: res.data.FROM_PREVEMP || "",
                        toDate: res.data.TO_PREVEMP || "",

                        totalSalary: res.data.TOTAL_SALARY || "",
                        hra: res.data.HRA_CA_OTH_ALLOWANCE || "",
                        perquisites: res.data.PERQUISITE_AND_PF || "",
                        total: res.data.TOTAL_5_6_7 || "",
                        insurance: res.data.AMOUNT_DEDUCTED_LI_PF || "",
                        tds: res.data.TOTAL_TAX_DEDUCTED || "",
                        remarks: res.data.REMARKS || "",
                    });
                }
            }
        } catch (error) {
            console.error(error);
            notifyError("Failed to load Form 12B");
        }
    };

    useEffect(() => {

        // Prevent StrictMode duplicate API hit
        if (hasFetched.current) return;

        hasFetched.current = true;
        fetchFormData();
    }, []);

    /* =========================================
       VALIDATION
    ========================================= */

    const validateForm = () => {
        let newErrors = {};

        // Required fields
        if (!formData.previousEmployerName.trim()) {
            newErrors.previousEmployerName =
                "Previous Employer Name is required";
        }

        if (!formData.previousEmployerAddress.trim()) {
            newErrors.previousEmployerAddress =
                "Previous Employer Address is required";
        }

        if (!formData.tanNumber.trim()) {
            newErrors.tanNumber = "TAN Number is required";
        } else if (!/^[A-Z]{4}[0-9]{5}[A-Z]{1}$/i.test(formData.tanNumber)) {
            newErrors.tanNumber = "Enter valid TAN Number";
        }

        if (!formData.panNumber.trim()) {
            newErrors.panNumber = "PAN Number is required";
        } else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i.test(formData.panNumber)) {
            newErrors.panNumber = "Enter valid PAN Number";
        }

        if (!formData.fromDate) {
            newErrors.fromDate = "From Date is required";
        }

        if (!formData.toDate) {
            newErrors.toDate = "To Date is required";
        }

        if (
            formData.fromDate &&
            formData.toDate &&
            new Date(formData.toDate) < new Date(formData.fromDate)
        ) {
            newErrors.toDate = "To Date cannot be earlier than From Date";
        }

        // Numeric validations
        const numericFields = [
            "totalSalary",
            "hra",
            "perquisites",
            "total",
            "insurance",
            "tds",
        ];

        numericFields.forEach((field) => {
            if (!formData[field]) {
                newErrors[field] = "This field is required";
            } else if (isNaN(formData[field]) || Number(formData[field]) < 0) {
                newErrors[field] = "Enter valid positive number";
            }
        });

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    /* =========================================
       HANDLE CHANGE
    ========================================= */

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => {
            const updated = {
                ...prev,
                [name]: value,
            };

            // Auto calculate total = salary + hra + perquisites
            updated.total =
                (
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
       SAVE
    ========================================= */

    const handleSave = async () => {

        if (!eligible) {
            notifyWarning("You are not eligible for Form 12B");
            return;
        }

        if (!validateForm()) return;

        try {
            await saveForm12B(formData);
            notifySuccess("Form 12B saved successfully");
            await fetchFormData();
        } catch (error) {
            console.error(error);
            notifyError("Failed to save Form 12B");
        }
    };

    const fields = [
        ["previousEmployerName", "1A) Name of Previous Employer", "text"],
        ["previousEmployerAddress", "1B) Address of Previous Employer", "text"],
        ["tanNumber", "2) TAN Number of Previous Employer", "text"],
        ["panNumber", "3) PAN Number of Previous Employer", "text"],
        ["fromDate", "4A) FROM", "date"],
        ["toDate", "4B) TO", "date"],
        ["totalSalary", "5) Total Salary", "number"],
        ["hra", "6) Total HRA", "number"],
        ["perquisites", "7) Value of Perquisites", "number"],
        ["total", "8) Total [5+6+7]", "number"],
        ["insurance", "9) Insurance / PF / 80C", "number"],
        ["tds", "10) Total TDS Deducted", "number"],
        ["remarks", "Remarks", "text"],
    ];

    return (
        <> 
            {!editable && (
            <div className="alert alert-warning mb-3">
                IT Return editing is allowed only on configured dates.
            </div>
        )}
        <div>
            <h5 className="text-danger text-center mb-4">
                This form is only applicable for those who have joined POST
                beginning of the CURRENT FINANCIAL YEAR
            </h5>

            {!eligible && (
                <div className="alert alert-warning text-center">
                    You are not eligible to fill Form 12B
                </div>
            )}

            <input
            type="hidden"
            name="id"
            value={formData.id}
            />

            <div className="row">
                {fields.map(([name, label, type], index) => (
                    <div className="col-md-4 mb-3" key={index}>
                        <label className="form-label">
                            {label}
                            {name !== "remarks" && (
                                <span className="text-danger"> *</span>
                            )}
                        </label>

                        <input
                            type={type}
                            name={name}
                            className={`form-control ${errors[name] ? "is-invalid" : ""}`}
                            value={formData[name]}
                            onChange={handleChange}
                            readOnly={name === "total"}
                        />

                        {errors[name] && (
                            <div className="invalid-feedback">
                                {errors[name]}
                            </div>
                        )}
                    </div>
                ))}
            </div>
             {isEditable && (     
            <div className="text-center mt-3">
                <button
                    className="btn btn-primary"
                    onClick={handleSave}
                    disabled={!eligible}
                >
                    Save
                </button>
            </div>
             )}
        </div>
      </>
    );
};

export default Form12BTab;