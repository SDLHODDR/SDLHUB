import { useEffect, useMemo, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import BreadcrumbNav from "../../components/breadcrumb-nav/BreadcrumbNav";
import { getPortalFromPath } from "../../../../config/portalConfig";
import SDLSearch from "../../../../components/datatable/SDLSearch";
import SDLDataTable from "../../../../components/datatable/SDLDataTable";
import { getCapabilitiesDataResponse } from "../../../../store/hrms/hrmsCapabilitiesSlice";
import { normalizeRecords, getDisplayValue } from "../../../../utils/formatUtils";
import { capabilitiesColumns } from "../../portalutils/capabilitiesColumns";
import { useCapabilitiesHandler } from "../../portalutils/useCapabilitiesHandler";
import SDLActivitySelector from "../../components/SDLActivitySelector";

const Capabilities = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const portal = getPortalFromPath(location.pathname);
  const portalHome = `/${portal.key}/dashboard`;

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

  const list = useMemo(() => {
    return normalizeRecords(capabilitiesData).map((item, index) => ({
      CAPA_ID: item.CAPA_ID ?? item.ID ?? item.id ?? index,
      CAPA_CODE_DISPLAY: getDisplayValue(item, ["CAPA_CODE", "code", "CODE"], ""),
      CAPA_DESC_DISPLAY: getDisplayValue(item, ["CAPA_DESC", "description", "DESCR"], ""),
    }));
  }, [capabilitiesData]);

  const capabilityOptions = useMemo(() => {
    const uniqueCodes = [...new Set(list.map((item) => item.CAPA_CODE_DISPLAY))]
      .filter(Boolean)
      .sort();

    return uniqueCodes.map((code) => ({ id: String(code), label: String(code) }));
  }, [list]);

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return list;

    const query = searchQuery.trim().toLowerCase();
    return list.filter(
      (item) =>
        item.CAPA_CODE_DISPLAY.toLowerCase().includes(query) ||
        item.CAPA_DESC_DISPLAY.toLowerCase().includes(query),
    );
  }, [searchQuery, list]);

  const resetForm = useCallback(() => {
    setIsEditing(false);
    setSelectedCapability("");
    setFormData({ CAPA_ID: "", CAPA_CODE: "", CAPA_DESC: "" });
    setErrors({});
  }, []);

  const {
    handleFieldChange,
    handleSave,
    handleEdit,
    handleSelectCapability,
  } = useCapabilitiesHandler({
    formData,
    setFormData,
    setErrors,
    setIsSubmitting,
    dispatch,
    getCapabilitiesDataResponse,
    setShowAll,
    setSelectedCapability,
    setIsEditing,
    resetForm,
    list,
  });

  const handleToggleView = useCallback(() => {
    if (showAll) {
      resetForm();
      setShowAll(false);
    } else {
      setShowAll(true);
    }
  }, [showAll, resetForm]);

  const columns = useMemo(
    () => capabilitiesColumns({ handleEdit }),
    [handleEdit],
  );

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
                <SDLActivitySelector
                  items={capabilityOptions}
                  value={selectedCapability}
                  onChange={handleSelectCapability}
                  getOptionValue={(item) => item.id}
                  getOptionLabel={(item) => item.label}
                  placeholder="Select Capabilities"
                  loading={loading}
                  showAll={showAll}
                  onToggleView={handleToggleView}
                />
                {/* <div className="d-flex align-items-center gap-2">
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
                </div> */}
              </div>

              {!showAll ? (
                <>
                  {/* {isEditing && (
                    <div className="alert alert-warning">You are editing the selected capability.</div>
                  )} */}
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

                  <div className="text-end mb-3">
                    <button type="button" className="btn btn-primary me-2" onClick={handleSave} disabled={isSubmitting}>
                      {isSubmitting ? "Processing..." : isEditing ? "Update" : "Save"}
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={resetForm}>
                      Cancel
                    </button>
                  </div>
                </>
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