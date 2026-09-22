import useOrganogramFormHandler from "./useOrganogramFormHandler";
import SDLReactSelect from "../../../components/SDLReactSelect";
//import Select from "react-select";

const OrganogramTab = ({ organogramId, onOrganogramSaved }) => {
  //const isEditMode = !!organogramId;

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
    isEditMode,
    canSendForAuth,
  } = useOrganogramFormHandler(organogramId, onOrganogramSaved);

  return (
    <div>
      
      <div className="row">
        <div className="col-auto">
          <div className="mb-3">
            <label className="form-label">
              Fin Entity<span className="text-danger ms-1">*</span>
            </label>
             

            <SDLReactSelect
              classNamePrefix="react-select w-auto"
              className="js-example-basic-single select2"
              value={formData.FIN_ENTITY_ID}
              options={finEntityOptions}
              onChange={(value) => handleFieldChange("FIN_ENTITY_ID", value)}
              hasError={!!errors.FIN_ENTITY_ID}
              isLoading={loadingMasters}
              isDisabled={loadingMasters}
            />
            {errors.FIN_ENTITY_ID && (
              <div className="invalid-feedback d-block">
                {errors.FIN_ENTITY_ID}
              </div>
            )}
          </div>
        </div>

        <div className="col-auto">
          <div className="mb-3">
            <label className="form-label">
              Company<span className="text-danger ms-1">*</span>
            </label>
            <SDLReactSelect
             classNamePrefix="react-select w-auto"
              className="js-example-basic-single select2"
              value={formData.COMPANY_ID}
              options={companyOptions}
              onChange={(value) => handleFieldChange("COMPANY_ID", value)}
              hasError={!!errors.COMPANY_ID}
              isLoading={loadingMasters}
              isDisabled={loadingMasters}
            />
            {errors.COMPANY_ID && (
              <div className="invalid-feedback d-block">
                {errors.COMPANY_ID}
              </div>
            )}
          </div>
        </div>

        <div className="col-auto">
          <div className="mb-3">
            <label className="form-label">
              Department<span className="text-danger ms-1">*</span>
            </label>
            <SDLReactSelect
             classNamePrefix="react-select w-auto"
              className="js-example-basic-single select2"
              value={formData.DEPARTMENT_ID}
              options={departmentOptions}
              onChange={(value) => handleFieldChange("DEPARTMENT_ID", value)}
              hasError={!!errors.DEPARTMENT_ID}
              isLoading={loadingMasters}
              isDisabled={loadingMasters}
            />
            {errors.DEPARTMENT_ID && (
              <div className="invalid-feedback d-block">
                {errors.DEPARTMENT_ID}
              </div>
            )}
          </div>
        </div>

        <div className="col-auto">
          <div className="mb-3">
            <label className="form-label">Designation</label>
            <SDLReactSelect
             classNamePrefix="react-select w-auto"
              className="js-example-basic-single select2"
              value={formData.DESIGNATION_ID}
              options={designationOptions}
              onChange={(value) => handleFieldChange("DESIGNATION_ID", value)}
              hasError={!!errors.DESIGNATION_ID}
              isLoading={loadingDesignations}
              isDisabled={!formData.DEPARTMENT_ID || loadingDesignations}
            />
            {errors.DESIGNATION_ID && (
              <div className="invalid-feedback d-block">
                {errors.DESIGNATION_ID}
              </div>
            )}
          </div>
        </div>
    

      {/* ROW 2 - JD Label, Division, Employee Level, Organogram Level */}
    
        <div className="col-auto">
          <div className="mb-3">
            <label className="form-label">
              Organogram Level<span className="text-danger ms-1">*</span>
            </label>
            <SDLReactSelect
             classNamePrefix="react-select w-auto"
              className="js-example-basic-single select2"
              value={formData.ORG_LEVEL_ID}
              options={orgLevelOptions}
              onChange={(value) => handleFieldChange("ORG_LEVEL_ID", value)}
              hasError={!!errors.ORG_LEVEL_ID}
              isLoading={loadingMasters}
              isDisabled={loadingMasters}
              width="180px"
            />
            {errors.ORG_LEVEL_ID && (
              <div className="invalid-feedback d-block">
                {errors.ORG_LEVEL_ID}
              </div>
            )}
          </div>
        </div>

        <div className="col-auto">
          <div className="mb-3">
            <label className="form-label">JD Label</label>
            <SDLReactSelect
             classNamePrefix="react-select w-auto"
              className="js-example-basic-single select2"
              value={formData.JD_LABEL_ID}
              options={jdLabelOptions}
              onChange={(value) => handleFieldChange("JD_LABEL_ID", value)}
              hasError={!!errors.JD_LABEL_ID}
              isLoading={loadingJdLabels}
              isDisabled={!formData.DESIGNATION_ID || loadingJdLabels}
            />
            {errors.JD_LABEL_ID && (
              <div className="invalid-feedback d-block">
                {errors.JD_LABEL_ID}
              </div>
            )}
          </div>
        </div>

        <div className="col-auto">
          <div className="mb-3">
            <label className="form-label">
              Division<span className="text-danger ms-1">*</span>
            </label>
            <SDLReactSelect
            classNamePrefix="react-select w-auto"
              className="js-example-basic-single select2"
              value={formData.DIVISION_ID}
              options={divisionOptions}
              onChange={(value) => handleFieldChange("DIVISION_ID", value)}
              hasError={!!errors.DIVISION_ID}
              isLoading={loadingMasters}
              isDisabled={loadingMasters}
            />
            {errors.DIVISION_ID && (
              <div className="invalid-feedback d-block">
                {errors.DIVISION_ID}
              </div>
            )}
          </div>
        </div>

        <div className="col-auto">
          <div className="mb-3">
            <label className="form-label">
              Employee Level<span className="text-danger ms-1">*</span>
            </label>
            <SDLReactSelect
            classNamePrefix="react-select w-auto"
              className="js-example-basic-single select2"
              value={formData.EMP_LEVEL_ID}
              options={empLevelOptions}
              onChange={(value) => handleFieldChange("EMP_LEVEL_ID", value)}
              hasError={!!errors.EMP_LEVEL_ID}
              isLoading={loadingMasters}
              isDisabled={loadingMasters}
            />
            {errors.EMP_LEVEL_ID && (
              <div className="invalid-feedback d-block">
                {errors.EMP_LEVEL_ID}
              </div>
            )}
          </div>
        </div>
     

      {/* ROW 3 - Position Count, Position Occupied */}
     
        <div className="col-auto">
          <div className="mb-3">
            <label className="form-label">Position Count</label>
            <input
              type="number"
              className={`form-control ${errors.POSITION_COUNT ? "is-invalid" : ""}`}
              style={{ width: "180px" }}
              value={formData.POSITION_COUNT}
              onChange={(e) => {
                const val = e.target.value;
                if (val === "" || (/^\d+$/.test(val) && val.length <= 3)) {
                  handleFieldChange("POSITION_COUNT", val);
                }
              }}
              maxLength={3}
              inputMode="numeric"
            />
            {errors.POSITION_COUNT && (
              <div className="invalid-feedback d-block">
                {errors.POSITION_COUNT}
              </div>
            )}
          </div>
        </div>

        <div className="col-auto">
          <div className="mb-3">
            <label className="form-label">Position Occupied</label>
            <input
              type="number"
              className={`form-control ${errors.POSITION_OCCUPIED ? "is-invalid" : ""}`}
              style={{ width: "180px" }}
              value={formData.POSITION_OCCUPIED}
              onChange={(e) => {
                const val = e.target.value;
                if (val === "" || (/^\d+$/.test(val) && val.length <= 3)) {
                  handleFieldChange("POSITION_OCCUPIED", val);
                }
              }}
              maxLength={3}
              inputMode="numeric"
            />
            {errors.POSITION_OCCUPIED && (
              <div className="invalid-feedback d-block">
                {errors.POSITION_OCCUPIED}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="d-flex justify-content-end gap-2 mt-3">
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => handleSave(false)}
          disabled={saving}
        >
          {saving
            ? isEditMode
              ? "Updating..."
              : "Saving..."
            : isEditMode
              ? "Update"
              : "Save"}
        </button>

        {canSendForAuth && (
          <button
            type="button"
            className="btn btn-success"
            onClick={() => handleSave(true)}
            disabled={saving}
          >
            {saving
              ? isEditMode
                ? "Updating..."
                : "Sending..."
              : isEditMode
                ? "Update & Send for Auth"
                : "Save & Send for Auth"}
          </button>
        )}

        <button
          type="button"
          className="btn btn-secondary"
          onClick={handleCancel}
          disabled={saving}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default OrganogramTab;
