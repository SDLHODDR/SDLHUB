import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import BreadcrumbNav from "../../components/breadcrumb-nav/BreadcrumbNav";
import { getPortalFromPath } from "../../../../config/portalConfig";
import SDLSearch from "../../../../components/datatable/SDLSearch";
import SDLDataTable from "../../../../components/datatable/SDLDataTable";
import { notifySuccess, notifyError, notifyWarning, confirmAction } from "../../../../services/alertService";
import { saveCapabilities } from "../../services/capablitiesService";
import { getCapabilitiesDataResponse } from "../../../../store/hrms/hrmsCapabilitiesSlice";

const normalizeRecords = (payload) => {
  if (Array.isArray(payload)) return payload;

  if (payload && typeof payload === "object") {
    for (const key of ["data", "records", "result", "items", "list", "rows"]) {
      if (Array.isArray(payload[key])) return payload[key];
    }
  }

  return [];
};

const getDisplayValue = (item, keys, fallback = "-") => {
  if (!item || typeof item !== "object") return fallback;

  for (const key of keys) {
    const value = item[key];
    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }

  return fallback;
};

const Capabilities = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const portal = getPortalFromPath(location.pathname);
  const portalHome = `/${portal.key}/dashboard`;

  // Redux-backed list (replaces local fetchCapabilities/useState list)
  const capabilitiesData = useSelector((state) => state.hrmscapabilitiesData?.data);
  const loading = useSelector((state) => state.hrmscapabilitiesData?.loading) || false;

  const [searchQuery, setSearchQuery] = useState("");
  const [showAll, setShowAll] = useState(true);
  const [selectedCapability, setSelectedCapability] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    CAPA_ID: "",
    CAPA_CODE: "",
    CAPA_DESC: "",
  });

  useEffect(() => {
    dispatch(getCapabilitiesDataResponse());
  }, [dispatch]);

  const list = useMemo(() => normalizeRecords(capabilitiesData), [capabilitiesData]);

  //console.log("=========List==========", list);
  //console.log("=========capabilitiesData==========", capabilitiesData);

  const capabilityOptions = useMemo(() => {
    const uniqueCodes = [...new Set(list.map((item) => getDisplayValue(item, ["CAPA_CODE", "code", "CODE"], "")))]
      .filter(Boolean)
      .sort();

    return uniqueCodes.map((code) => ({
      id: String(code),
      label: String(code),
    }));
  }, [list]);

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return list;

    const query = searchQuery.trim().toLowerCase();

    return list.filter((item) => {
      const code = String(getDisplayValue(item, ["CAPA_CODE", "code", "CODE"], "")).toLowerCase();
      const desc = String(getDisplayValue(item, ["CAPA_DESC", "description", "DESCR"], "")).toLowerCase();
      return code.includes(query) || desc.includes(query);
    });
  }, [searchQuery, list]);

  const handleFieldChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.CAPA_CODE || String(formData.CAPA_CODE).trim() === "") {
      newErrors.CAPA_CODE = "Capabilities code is required";
    }

    if (!formData.CAPA_DESC || String(formData.CAPA_DESC).trim() === "") {
      newErrors.CAPA_DESC = "Description is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setIsEditing(false);
    setSelectedCapability("");
    setFormData({ CAPA_ID: "", CAPA_CODE: "", CAPA_DESC: "" });
    setErrors({});
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      //notifyWarning("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        ID: formData.CAPA_ID,
        CAPA_ID: formData.CAPA_ID,
        CAPA_CODE: formData.CAPA_CODE,
        CAPA_DESC: formData.CAPA_DESC,
      };

      const response = await saveCapabilities(payload);

      if (response?.status) {
        notifySuccess(response?.message || "Capabilities saved successfully.");
        resetForm();
        dispatch(getCapabilitiesDataResponse());
        setShowAll(true);
      } else {
        notifyError(response?.message || "Unable to save capabilities.");
      }
    } catch (error) {
      console.error("Save error:", error);
      notifyError("Something went wrong while saving capabilities.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectCapability = (value) => {
    setSelectedCapability(value);

    if (!value) {
      resetForm();
      return;
    }

    setShowAll(false);

    const selected = list.find(
      (item) => String(getDisplayValue(item, ["CAPA_CODE", "code", "CODE"], "")) === String(value),
    );
    if (selected) {
      setIsEditing(true);
      setFormData({
        CAPA_ID: selected.CAPA_ID ?? selected.ID ?? selected.id ?? "",
        CAPA_CODE: selected.CAPA_CODE || selected.code || "",
        CAPA_DESC: selected.CAPA_DESC || selected.description || selected.DESCR || "",
      });
    }
  };

  const handleToggleView = () => {
    if (showAll) {
      // Currently on table view, about to switch into form view.
      // Always open the form in Add/Create mode by default.
      resetForm();
      setShowAll(false);
    } else {
      // Currently on form view, switch back to table view.
      setShowAll(true);
    }
  };

  const handleEdit = (row) => {
    setSelectedCapability(String(row.CAPA_ID ?? row.ID ?? row.id));
    setIsEditing(true);
    setShowAll(false);
    setFormData({
      CAPA_ID: row.CAPA_ID ?? row.ID ?? row.id ?? "",
      CAPA_CODE: row.CAPA_CODE || row.code || "",
      CAPA_DESC: row.CAPA_DESC || row.description || row.DESCR || "",
    });
  };

  const columns = [
    { header: "#", body: (row, meta) => meta.rowIndex + 1 },
    { header: "Skill", body: (row) => getDisplayValue(row, ["CAPA_CODE", "code", "CODE"], "") },
    { header: "Description", body: (row) => getDisplayValue(row, ["CAPA_DESC", "description", "DESCR"], "") },
    {
      header: "Action",
      body: (row) => (
        <div className="d-flex gap-2">
          <button className="btn btn-sm btn-outline-primary" onClick={() => handleEdit(row)}>
            <i className="ti ti-edit" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="page-header">
        <div className="add-item d-flex">
          <div className="page-title">
            <h4>Capabilities</h4>
          </div>
        </div>

        <BreadcrumbNav
          items={[
            { text: "Home", link: portalHome },
            { text: "Capabilities" },
          ]}
        />
      </div>

      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-3">
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  {showAll && (
                    <div className="d-flex align-items-center" style={{ minWidth: "260px" }}>
                      <SDLSearch
                        value={searchQuery}
                        onChange={setSearchQuery}
                        placeholder="Search capabilities..."
                        className="mb-0"
                        style={{ width: "100%" }}
                      />
                    </div>
                  )}
                </div>

                <div className="d-flex align-items-center gap-2">
                  <select
                    className="form-select"
                    value={selectedCapability}
                    onChange={(e) => handleSelectCapability(e.target.value)}
                    style={{ minWidth: "240px" }}
                    disabled={loading}
                  >
                    <option value="">Select Capabilities</option>
                    {capabilityOptions.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.label}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    className="btn btn-outline-secondary d-flex align-items-center gap-2"
                    onClick={handleToggleView}
                    style={{ minWidth: "120px" }}
                  >
                    <i className={`fas ${showAll ? "fa-edit" : "fa-table"}`} />
                    {showAll ? "Form" : "Table"}
                  </button>
                </div>
              </div>

              {!showAll ? (
                <form onSubmit={handleSave}>
                  {isEditing && <div className="alert alert-warning">You are editing the selected capability.</div>}
                  <div className="row mb-3">
                    <div className="col-lg-4">
                      <label className="form-label">Capabilities Code</label>
                      {isEditing ? (
                        <select
                          className={`form-select ${errors.CAPA_CODE ? "is-invalid" : ""}`}
                          value={formData.CAPA_CODE}
                          onChange={(e) => handleFieldChange("CAPA_CODE", e.target.value)}
                        >
                          <option value="">Please Select</option>
                          {capabilityOptions.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          className={`form-control ${errors.CAPA_CODE ? "is-invalid" : ""}`}
                          value={formData.CAPA_CODE}
                          onChange={(e) => handleFieldChange("CAPA_CODE", e.target.value)}
                          placeholder="Enter new capability code"
                          maxLength="100"
                        />
                      )}
                      {errors.CAPA_CODE && <div className="invalid-feedback">{errors.CAPA_CODE}</div>}
                    </div>

                    <div className="col-lg-6">
                      <label className="form-label">Description</label>
                      <input
                        type="text"
                        className={`form-control ${errors.CAPA_DESC ? "is-invalid" : ""}`}
                        value={formData.CAPA_DESC}
                        onChange={(e) => handleFieldChange("CAPA_DESC", e.target.value)}
                        maxLength="500"
                      />
                      {errors.CAPA_DESC && <div className="invalid-feedback">{errors.CAPA_DESC}</div>}
                    </div>
                  </div>

                 
                     {/* <button className="btn btn-secondary" type="button" onClick={resetForm}>
                      Cancel
                    </button>
                    <button className="btn btn-primary me-2" type="submit" disabled={isSubmitting}>
                      {isSubmitting ? <span className="spinner-border spinner-border-sm me-2" /> : null}
                      {isSubmitting ? "Processing..." : isEditing ? "Update" : "Save"}
                    </button> */}
                   
                  
                  <div className="text-end mb-3">
                    <button
                      type="button"
                      className="btn btn-secondary me-2"
                      onClick={resetForm}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleSave}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Processing..." : isEditing ? "Update" : "Save"}
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  {filteredData.length === 0 ? (
                    <div className="p-4 text-center text-muted">No records found</div>
                  ) : (
                    <div className="table-responsive">
                      <SDLDataTable data={filteredData} columns={columns} loading={loading} />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Capabilities;
