import { useState, useEffect, useRef, useMemo} from "react";
import {
  saveExemptions,
  getExemptionData,
  deleteExemptionData
} from "../../../../services/itReturnService";
import {
  notifySuccess,
  notifyError,
  confirmAction
} from "../../../../../../services/alertService";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

const ExemptionsTab = ({ onDataSaved, editable }) => {
  const initialFormState = {
    exemption_id: "",
    from: "",
    to: "",
    monthlyRent: "",
    annualRent: "",
    address: "",
    city: "Non Metro",
    landlordHasPan: "yes",
    landlordName: "",
    landlordAddress: "",
    landlordPan: "",
    panCopy: null,
    agreementCopy: null,
  };

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [exemptionList, setExemptionList] = useState([]);
  const [loading, setLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const isEditable = Boolean(editable);

 // PREVENT DUPLICATE API CALLS
  const hasFetched = useRef(false);

  const filteredData = useMemo(() => {
    if (!searchQuery) return exemptionList;

    return exemptionList.filter((item) =>
      [
        item.from,
        item.to,
        item.monthlyRent,
        item.annualRent,
        item.city,
        item.landlordName,
        item.landlordPan,
      ]
        .join(" ")
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, exemptionList]);

  const actionBodyTemplate = (rowData) => (
  <div className="d-flex gap-2">
    <button
      className="btn btn-sm btn-outline-primary"
      onClick={() => handleEdit(rowData)}
    >
      Edit
    </button>

    <button
      className="btn btn-sm btn-outline-danger"
      onClick={() => handleDelete(rowData)}
    >
      Delete
    </button>
  </div>
);

const serialBodyTemplate = (_, options) => options.rowIndex + 1;

   /* =========================================
     FETCH EXEMPTION LIST
  ========================================= */

  const fetchExemptionData = async () => {
    try {
      setLoading(true);

      const res = await getExemptionData();

      if (res?.status && Array.isArray(res.data)) {
        setExemptionList(res.data);
      } else {
        setExemptionList([]);
      }
    } catch (error) {
      console.error(error);
      setExemptionList([]);

      notifyError(
        "Failed to load exemption data"
      );

    } finally {
      setLoading(false);
    }
  };

   /* =========================================
     INITIAL LOAD
  ========================================= */

  useEffect(() => {

    // Prevent StrictMode duplicate execution
    if (hasFetched.current) return;

    hasFetched.current = true;

    fetchExemptionData();
  }, []);

  /* =========================================
     VALIDATION
  ========================================= */

  const validateForm = () => {
    let newErrors = {};

    if (!formData.from) {
      newErrors.from = "From date is required";
    }

    if (!formData.to) {
      newErrors.to = "To date is required";
    }

    if (
      formData.from &&
      formData.to &&
      new Date(formData.to) < new Date(formData.from)
    ) {
      newErrors.to = "To date cannot be earlier than From date";
    }

    if (!formData.monthlyRent) {
      newErrors.monthlyRent = "Monthly rent is required";
    }

    if (!formData.annualRent) {
      newErrors.annualRent = "Total rent paid is required";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }

    if (!formData.landlordName.trim()) {
      newErrors.landlordName = "Landlord name is required";
    }

    if (!formData.landlordAddress.trim()) {
      newErrors.landlordAddress = "Landlord address is required";
    }

    const isPanMandatory =
      formData.landlordHasPan === "yes" ||
      Number(formData.annualRent || 0) > 100000;

    if (isPanMandatory) {
      if (!formData.landlordPan.trim()) {
        newErrors.landlordPan = "Landlord PAN is required";
      } else if (
        !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i.test(formData.landlordPan)
      ) {
        newErrors.landlordPan = "Enter valid PAN number";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* =========================================
     HANDLE CHANGE
  ========================================= */

  const handleChange = (e) => {
    const { name, value, files, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "file" ? files?.[0] || null : value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  /* =========================================
     EDIT RECORD
  ========================================= */

  const handleEdit = (row) => {
    setFormData({
      exemption_id:
        row.exemption_id ||
        row.ID ||
        row.id ||
        "",

      from: row.from || "",
      to: row.to || "",
      monthlyRent: row.monthlyRent || "",
      annualRent: row.annualRent || "",
      address: row.address || "",
      city: row.city || "Non Metro",
      landlordHasPan: row.landlordHasPan || "yes",
      landlordName: row.landlordName || "",
      landlordAddress: row.landlordAddress || "",
      landlordPan: row.landlordPan || "",
      panCopy: null,
      agreementCopy: null,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /* =========================================
     RESET FORM
  ========================================= */

  const resetForm = () => {
    setFormData(initialFormState);
    setErrors({});
  };

  /* =========================================
     SAVE
  ========================================= */

  const handleSave = async () => {

  if (!validateForm()) {
    return;
  }

  try {

    const payload = new FormData();

    Object.keys(formData).forEach((key) => {

      if (formData[key] !== null) {

        payload.append(key, formData[key]);
      }
    });

    const res = await saveExemptions(payload);

    if (res?.status) {

      notifySuccess(
        res.message || "Exemption saved successfully"
      );

      resetForm();

      await fetchExemptionData();

      // SAFE CALLBACK
      onDataSaved?.();

    } else {

      notifyError(
        res?.message ||
        "Please fill all required fields"
      );
    }

  } catch (error) {

    console.error(error);

    notifyError(
      "Server error while saving exemption"
    );
  }
};

 /*
  const handleSave = async (onDataSaved) => {
    if (!validateForm()) {
      return;
    }

    try {
      const payload = new FormData();

      Object.keys(formData).forEach((key) => {
        if (formData[key] !== null) {
          payload.append(key, formData[key]);
        }
      });

      const res = await saveExemptions(payload);

      if (res?.status) {
        notifySuccess(
          res.message || "Exemption saved successfully"
        );

        resetForm();
        fetchExemptionData();

        // REFRESH LIST
        await fetchExemptionData();

        onDataSaved?.();

      } else {
        notifyWarning(
          res?.message || "Please fill all required fields"
        );
      }
    } catch (error) {
      console.error(error);
      notifyError("Server error while saving exemption");
    }
  }; */

  /* =========================================
     DELETE RECORD
  ========================================= */
  const handleDelete = async (row) => {
    const result = await confirmAction(
      "Are you sure you want to delete this exemption record?"
    );

    if (!result.isConfirmed) return;

    try {
      const response = await deleteExemptionData(row.exemption_id);

      if (response?.success) {
        notifySuccess(response.message || "Record deleted successfully");

	// REFRESH LIST
       await fetchExemptionData();
        resetForm();

         // IMPORTANT
        onDataSaved?.(); // safe call

      } else {
        notifyError(response?.message || "Unable to delete record");
      }
    } catch (error) {
      console.error(error);
      notifyError("Failed to delete record");
    }
  };


  return (
    <>
        {!editable && (
        <div className="alert alert-warning mb-3">
            IT Return editing is allowed only on configured dates.
        </div>
      )}
    <div>
      {/* =========================================
          FORM
      ========================================= */}

      <div className="alert alert-warning">
        If annual rent paid exceeds Rs 1,00,000,
        landlord PAN is mandatory else same is not considered for taxation.
      </div>

      <div className="row">
        {/* FROM */}
        <div className="col-md-4 mb-3">
          <label className="form-label">
            From <span className="text-danger">*</span>
          </label>

          <input
            type="date"
            name="from"
            value={formData.from}
            onChange={handleChange}
            className={`form-control ${errors.from ? "is-invalid" : ""
              }`}
          />

          {errors.from && (
            <div className="invalid-feedback">
              {errors.from}
            </div>
          )}
        </div>

        {/* TO */}
        <div className="col-md-4 mb-3">
          <label className="form-label">
            To <span className="text-danger">*</span>
          </label>

          <input
            type="date"
            name="to"
            value={formData.to}
            onChange={handleChange}
            className={`form-control ${errors.to ? "is-invalid" : ""
              }`}
          />

          {errors.to && (
            <div className="invalid-feedback">
              {errors.to}
            </div>
          )}
        </div>

        {/* MONTHLY RENT */}
        <div className="col-md-4 mb-3">
          <label className="form-label">
            Total Monthly Rent
            <span className="text-danger">*</span>
          </label>

          <input
            type="number"
            name="monthlyRent"
            value={formData.monthlyRent}
            onChange={handleChange}
            className={`form-control ${errors.monthlyRent ? "is-invalid" : ""
              }`}
          />
        </div>

        {/* TOTAL RENT */}
        <div className="col-md-4 mb-3">
          <label className="form-label">
            Total Rent Paid
            <span className="text-danger">*</span>
          </label>

          <input
            type="number"
            name="annualRent"
            value={formData.annualRent}
            onChange={handleChange}
            className={`form-control ${errors.annualRent ? "is-invalid" : ""
              }`}
          />
        </div>

        {/* ADDRESS */}
        <div className="col-md-4 mb-3">
          <label className="form-label">
            Address
            <span className="text-danger">*</span>
          </label>

          <textarea
            name="address"
            rows="2"
            value={formData.address}
            onChange={handleChange}
            className={`form-control ${errors.address ? "is-invalid" : ""
              }`}
          />
        </div>

        {/* CITY */}
        <div className="col-md-4 mb-3">
          <label className="form-label">
            City
          </label>

          <select
            name="city"
            value={formData.city}
            onChange={handleChange}
            className="form-control"
          >
            <option value="Non Metro">
              Non Metro
            </option>
            <option value="Metro">
              Metro
            </option>
          </select>
        </div>

        {/* DOES LANDLORD HAVE PAN */}
        <div className="col-md-4 mb-3">
          <label className="form-label">
            Does your landlord has PAN ?
          </label>

          <div className="mt-2">
            <div className="form-check form-check-inline">
              <input
                type="radio"
                name="landlordHasPan"
                value="yes"
                checked={formData.landlordHasPan === "yes"}
                onChange={handleChange}
                className="form-check-input"
              />
              <label className="form-check-label">
                Yes
              </label>
            </div>

            <div className="form-check form-check-inline">
              <input
                type="radio"
                name="landlordHasPan"
                value="no"
                checked={formData.landlordHasPan === "no"}
                onChange={handleChange}
                className="form-check-input"
              />
              <label className="form-check-label">
                No
              </label>
            </div>
          </div>
        </div>

        {/* LANDLORD NAME */}
        <div className="col-md-4 mb-3">
          <label className="form-label">
            Landlord Name
            <span className="text-danger">*</span>
          </label>

          <input
            type="text"
            name="landlordName"
            value={formData.landlordName}
            onChange={handleChange}
            className="form-control"
          />
        </div>

        {/* LANDLORD ADDRESS */}
        <div className="col-md-4 mb-3">
          <label className="form-label">
            Landlord Address
            <span className="text-danger">*</span>
          </label>

          <textarea
            name="landlordAddress"
            rows="2"
            value={formData.landlordAddress}
            onChange={handleChange}
            className="form-control"
          />
        </div>

        {/* LANDLORD PAN */}
        <div className="col-md-4 mb-3">
          <label className="form-label">
            Landlord PAN
          </label>

          <input
            type="text"
            name="landlordPan"
            value={formData.landlordPan}
            onChange={handleChange}
            className="form-control"
          />
        </div>

        {/* LANDLORD PAN CARD COPY */}
        <div className="col-md-4 mb-3">
          <label className="form-label">
            Landlord PAN Card Copy
          </label>

          <input
            type="file"
            name="panCopy"
            onChange={handleChange}
            className={`form-control ${errors.panCopy ? "is-invalid" : ""
              }`}
          />

          {errors.panCopy && (
            <div className="invalid-feedback">
              {errors.panCopy}
            </div>
          )}
        </div>

        {/* AGREEMENT COPY */}
        <div className="col-md-4 mb-3">
          <label className="form-label">
            Agreement Copy
          </label>

          <input
            type="file"
            name="agreementCopy"
            onChange={handleChange}
            className={`form-control ${errors.agreementCopy ? "is-invalid" : ""
              }`}
          />

          {errors.agreementCopy && (
            <div className="invalid-feedback">
              {errors.agreementCopy}
            </div>
          )}
        </div>
        {isEditable && (
          <div className="text-center mt-3">
            <button
              className="btn btn-primary me-2"
              onClick={handleSave}
            >
              {formData.exemption_id ? "Update" : "Save"}
            </button>

            <button
              className="btn btn-secondary"
              onClick={resetForm}
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* =========================================
          DATA TABLE
      ========================================= */}

      <div className="card mt-4">
        <div className="card-header fw-bold">
          Saved Exemption Records
        </div>

        <div className="card-body">

          <div className="row mb-3">
            <div className="col-lg-4 col-md-6 col-12">
              <div className="search-set">
                <div className="search-input position-relative">

                  <span className="btn-searchset">
                    <i className="ti ti-search"></i>
                  </span>

                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          <DataTable
            value={filteredData}
            loading={loading}
            paginator={filteredData.length > 10}
            rows={10}
            rowsPerPageOptions={
              filteredData.length > 10
                ? [10, 25, 50, 100]
                : []
            }
            stripedRows
            showGridlines
            responsiveLayout="scroll"
            scrollable
            paginatorDropdownAppendTo="self"
            tableStyle={{ minWidth: "1200px" }}
            emptyMessage="No exemption records found"
            className="p-datatable-sm"
          >
            <Column
              header="#"
              body={serialBodyTemplate}
              style={{ width: "60px" }}
            />

            <Column
              field="from"
              header="From"
              sortable
            />

            <Column
              field="to"
              header="To"
              sortable
            />

            <Column
              field="monthlyRent"
              header="Monthly Rent"
              sortable
            />

            <Column
              field="annualRent"
              header="Annual Rent"
              sortable
            />

            <Column
              field="city"
              header="City"
              sortable
            />

            <Column
              field="landlordName"
              header="Landlord"
              sortable
            />

            <Column
              field="landlordPan"
              header="PAN"
              sortable
            />

            {isEditable && (
              <Column
                header="Action"
                body={actionBodyTemplate}
                style={{ width: "150px" }}
              />
            )}
          </DataTable>
        </div>
      </div>
    </div>
  </>
  );
};

export default ExemptionsTab;