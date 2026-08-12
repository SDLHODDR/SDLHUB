import useOrganogramFormHandler from "./useOrganogramFormHandler";

const OrganogramTab = ({ organogramId }) => {
  const {
    formData,
    errors,
    saving,
    loadingDetails,
    handleFieldChange,
    handleSave,
    handleCancel,
    finEntityOptions,
    companyOptions,
    departmentOptions,
    designationOptions,
    jdLabelOptions,
    divisionOptions,
    empLevelOptions,
    orgLevelOptions,
    loadingMasters,
    loadingDesignations,
    loadingJdLabels,
  } = useOrganogramFormHandler(organogramId);

  return (
    <div>
      {/* ROW 1 */}
      <div className="row">
        <div className="col-lg-4 col-md-6">
          <div className="mb-3">
            <label className="form-label">
              Fin Entity<span className="text-danger ms-1">*</span>
            </label>
            <select
              className={`form-select ${errors.FIN_ENTITY_ID ? "is-invalid" : ""}`}
              value={formData.FIN_ENTITY_ID}
              onChange={(e) => handleFieldChange("FIN_ENTITY_ID", e.target.value)}
              disabled={loadingMasters}
            >
              <option value="">Select Fin Entity</option>
              {finEntityOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            {errors.FIN_ENTITY_ID && <div className="invalid-feedback">{errors.FIN_ENTITY_ID}</div>}
          </div>
        </div>

        <div className="col-lg-4 col-md-6">
          <div className="mb-3">
            <label className="form-label">
              Company<span className="text-danger ms-1">*</span>
            </label>
            <select
              className={`form-select ${errors.COMPANY_ID ? "is-invalid" : ""}`}
              value={formData.COMPANY_ID}
              onChange={(e) => handleFieldChange("COMPANY_ID", e.target.value)}
              disabled={loadingMasters}
            >
              <option value="">Select Company</option>
              {companyOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            {errors.COMPANY_ID && <div className="invalid-feedback">{errors.COMPANY_ID}</div>}
          </div>
        </div>

        <div className="col-lg-4 col-md-6">
          <div className="mb-3">
            <label className="form-label">
              Department<span className="text-danger ms-1">*</span>
            </label>
            <select
              className={`form-select ${errors.DEPARTMENT_ID ? "is-invalid" : ""}`}
              value={formData.DEPARTMENT_ID}
              onChange={(e) => handleFieldChange("DEPARTMENT_ID", e.target.value)}
              disabled={loadingMasters}
            >
              <option value="">Select Department</option>
              {departmentOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            {errors.DEPARTMENT_ID && <div className="invalid-feedback">{errors.DEPARTMENT_ID}</div>}
          </div>
        </div>

        <div className="col-lg-4 col-md-6">
          <div className="mb-3">
            <label className="form-label">Designation</label>
            <select
              className="form-select"
              value={formData.DESIGNATION_ID}
              onChange={(e) => handleFieldChange("DESIGNATION_ID", e.target.value)}
              disabled={!formData.DEPARTMENT_ID || loadingDesignations}
            >
              <option value="">Select Designation</option>
              {designationOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="col-lg-4 col-md-6">
          <div className="mb-3">
            <label className="form-label">JD Label</label>
            <select
              className="form-select"
              value={formData.JD_LABEL_ID}
              onChange={(e) => handleFieldChange("JD_LABEL_ID", e.target.value)}
              disabled={!formData.DESIGNATION_ID || loadingJdLabels}
            >
              <option value="">Select JD Label</option>
              {jdLabelOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ROW 2 */}
      <div className="row">
        <div className="col-lg-4 col-md-6">
          <div className="mb-3">
            <label className="form-label">
              Division<span className="text-danger ms-1">*</span>
            </label>
            <select
              className={`form-select ${errors.DIVISION_ID ? "is-invalid" : ""}`}
              value={formData.DIVISION_ID}
              onChange={(e) => handleFieldChange("DIVISION_ID", e.target.value)}
              disabled={loadingMasters}
            >
              <option value="">Select Division</option>
              {divisionOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            {errors.DIVISION_ID && <div className="invalid-feedback">{errors.DIVISION_ID}</div>}
          </div>
        </div>

        <div className="col-lg-4 col-md-6">
          <div className="mb-3">
            <label className="form-label">
              Employee Level<span className="text-danger ms-1">*</span>
            </label>
            <select
              className={`form-select ${errors.EMP_LEVEL_ID ? "is-invalid" : ""}`}
              value={formData.EMP_LEVEL_ID}
              onChange={(e) => handleFieldChange("EMP_LEVEL_ID", e.target.value)}
              disabled={loadingMasters}
            >
              <option value="">Select Employee Level</option>
              {empLevelOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            {errors.EMP_LEVEL_ID && <div className="invalid-feedback">{errors.EMP_LEVEL_ID}</div>}
          </div>
        </div>

        <div className="col-lg-4 col-md-6">
          <div className="mb-3">
            <label className="form-label">
              Organogram Level<span className="text-danger ms-1">*</span>
            </label>
            <select
              className={`form-select ${errors.ORG_LEVEL_ID ? "is-invalid" : ""}`}
              value={formData.ORG_LEVEL_ID}
              onChange={(e) => handleFieldChange("ORG_LEVEL_ID", e.target.value)}
              disabled={loadingMasters}
            >
              <option value="">Select Organogram Level</option>
              {orgLevelOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            {errors.ORG_LEVEL_ID && <div className="invalid-feedback">{errors.ORG_LEVEL_ID}</div>}
          </div>
        </div>

        <div className="col-lg-4 col-md-6">
          <div className="mb-3">
            <label className="form-label">Position Count</label>
            <input
              type="text"
              className={`form-control ${errors.POSITION_COUNT ? "is-invalid" : ""}`}
              value={formData.POSITION_COUNT}
              onChange={(e) => handleFieldChange("POSITION_COUNT", e.target.value)}
            />
            {errors.POSITION_COUNT && <div className="invalid-feedback">{errors.POSITION_COUNT}</div>}
          </div>
        </div>

        <div className="col-lg-4 col-md-6">
          <div className="mb-3">
            <label className="form-label">Position Occupied</label>
            <input
              type="text"
              className={`form-control ${errors.POSITION_OCCUPIED ? "is-invalid" : ""}`}
              value={formData.POSITION_OCCUPIED}
              onChange={(e) => handleFieldChange("POSITION_OCCUPIED", e.target.value)}
            />
            {errors.POSITION_OCCUPIED && <div className="invalid-feedback">{errors.POSITION_OCCUPIED}</div>}
          </div>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="d-flex justify-content-end gap-2 mt-3">
        <button type="button" className="btn btn-secondary" onClick={handleCancel} disabled={saving}>
          Cancel
        </button>
        <button type="button" className="btn btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
};

export default OrganogramTab;