import { useEffect, useMemo, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";

import { getPolicyDataResponse } from "../../../../store/hrms/hrmsPolicySlice";
import { getCompanyMaster, getDepartmentMaster, getDivisionMaster } from "../../services/policyService";

import BreadcrumbNav from "../../components/breadcrumb-nav/BreadcrumbNav";
import { getPortalFromPath } from "../../../../config/portalConfig";
import SDLDataTable from "../../../../components/datatable/SDLDataTable";

import { normalizeRecords, getDisplayValue, formatDate } from "../../../../utils/formatUtils";
import { policyColumns } from "../../portalutils/policyColumns";
import { mapCompanyOptions, mapDepartmentOptions, mapDivisionOptions } from "../../portalutils/policyOptionsUtils";
import { usePolicyHandler } from "../../portalutils/usePolicyHandler";

const emptyForm = {
  ID: "",
  COMP_NAME: "",
  DEPT_ID: [],
  DIVISION_ID: [],
  POLICY_NAME: "",
  START_DATE: "",
  END_DATE: "",
  POLICY_DESC: "",
  IS_MANDAT: false,
  DOC_PATH: "",
  doc: null,
  STATUS: "N",
};

const PolicyList = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const portal = getPortalFromPath(location.pathname);
  const portalHome = `/${portal.key}/dashboard`;

  const policyData = useSelector((state) => state.hrmspolicyData?.data);
  const loading = useSelector((state) => state.hrmspolicyData?.loading) || false;

  const [companyList, setCompanyList] = useState([]);
  const [departmentList, setDepartmentList] = useState([]);
  const [divisionList, setDivisionList] = useState([]);
  const [lookupsLoading, setLookupsLoading] = useState(false);

  const [showAll, setShowAll] = useState(true);
  const [selectedPolicy, setSelectedPolicy] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    dispatch(getPolicyDataResponse());
  }, [dispatch]);

  const loadLookups = useCallback(async () => {
    try {
      setLookupsLoading(true);
      const [companyRes, deptRes, divisionRes] = await Promise.all([
        getCompanyMaster(),
        getDepartmentMaster(),
        getDivisionMaster(),
      ]);
      setCompanyList(mapCompanyOptions(companyRes));
      setDepartmentList(mapDepartmentOptions(deptRes));
      setDivisionList(mapDivisionOptions(divisionRes));
    } catch (error) {
      console.error("Error fetching Policy lookups:", error);
    } finally {
      setLookupsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLookups();
  }, [loadLookups]);

  const listData = useMemo(() => {
    try {
      return normalizeRecords(policyData).map((item, index) => ({
        ID: item.POLI_ID ?? item.ID ?? item.id ?? index,
        COMP_NAME: item.COMP_NAME ?? "",
        COMP_DESC: getDisplayValue(item, ["COMP_DESC", "COMPANY_DESC"], "-"),
        DEPT_DESC: getDisplayValue(item, ["DEPT_DESC", "DEPT_NAMES"], "-"),
        DIVSN_DESC: getDisplayValue(item, ["DIVSN_DESC", "DIVISION_NAMES"], "-"),
        DEPT_ID_LIST: item.DEPT_ID_LIST ?? item.DEPT_IDS ?? [],
        DIVISION_ID_LIST: item.DIVISION_ID_LIST ?? item.DIVISION_IDS ?? [],
        POLICY_NAME: getDisplayValue(item, ["POLICY_NAME"], "-"),
        POLICY_DESC: getDisplayValue(item, ["POLICY_DESC"], "-"),
        START_DATE_RAW: item.START_DATE ?? "",
        END_DATE_RAW: item.END_DATE ?? "",
        START_DATE_DISPLAY: formatDate(item.START_DATE),
        END_DATE_DISPLAY: formatDate(item.END_DATE),
        DOC_PATH: item.DOC_PATH ?? "",
        IS_MANDAT: item.IS_MANDAT ?? "N",
        STATUS: item.STATUS ?? "N",
      }));
    } catch (error) {
      console.error(error);
      return [];
    }
  }, [policyData]);

  const resetForm = useCallback(() => {
    setIsEditing(false);
    setSelectedPolicy("");
    setFormData(emptyForm);
    setErrors({});
  }, []);

  const {
    handleFieldChange,
    handleMultiSelectChange,
    handleFileChange,
    handleSave,
    handlePublish,
    handleEdit,
  } = usePolicyHandler({
    formData,
    setFormData,
    setErrors,
    setIsSubmitting,
    dispatch,
    getPolicyDataResponse,
    setShowAll,
    setSelectedPolicy,
    setIsEditing,
    resetForm,
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
    () => policyColumns({ handleEdit }),
    [handleEdit],
  );

  return (
    <>
      <div className="page-header">
        <div className="add-item d-flex">
          <div className="page-title">
            <h4>Policy</h4>
          </div>
        </div>

        <BreadcrumbNav
          items={[
            { text: "Home", link: portalHome },
            { text: "Policy" },
          ]}
        />
      </div>

      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <div className="d-flex justify-content-end mb-3">
                <button
                  type="button"
                  className="btn btn-outline-secondary d-flex align-items-center gap-2"
                  onClick={handleToggleView}
                  style={{ minWidth: "120px" }}
                >
                  <i className={`fas ${showAll ? "fa-plus" : "fa-table"}`} />
                  {showAll ? "New Policy" : "Table"}
                </button>
              </div>

              {!showAll ? (
                <>
                  {isEditing && formData.STATUS === "A" && (
                    <div className="alert alert-info">
                      This policy is already published and shown for reference only.
                    </div>
                  )}

                  <div className="row">
                    <div className="col-lg-3">
                      <div className="mb-3">
                        <label className="form-label">
                          Company<span className="text-danger ms-1">*</span>
                        </label>
                        <select
                          className={`form-select ${errors.COMP_NAME ? "is-invalid" : ""}`}
                          value={formData.COMP_NAME}
                          onChange={(e) => handleFieldChange("COMP_NAME", e.target.value)}
                          disabled={lookupsLoading}
                        >
                          <option value="">Please Select</option>
                          {companyList.map((c) => (
                            <option key={c.id} value={c.id}>{c.label}</option>
                          ))}
                        </select>
                        {errors.COMP_NAME && <div className="invalid-feedback">{errors.COMP_NAME}</div>}
                      </div>
                    </div>

                    <div className="col-lg-3">
                      <div className="mb-3">
                        <label className="form-label">Department</label>
                        <select
                          className="form-select"
                          multiple
                          value={formData.DEPT_ID}
                          onChange={(e) => handleMultiSelectChange("DEPT_ID", e.target.selectedOptions)}
                          disabled={lookupsLoading}
                        >
                          {departmentList.map((d) => (
                            <option key={d.id} value={d.id}>{d.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="col-lg-6">
                      <div className="mb-3">
                        <label className="form-label">Division</label>
                        <select
                          className="form-select"
                          multiple
                          value={formData.DIVISION_ID}
                          onChange={(e) => handleMultiSelectChange("DIVISION_ID", e.target.selectedOptions)}
                          disabled={lookupsLoading}
                        >
                          {divisionList.map((d) => (
                            <option key={d.id} value={d.id}>{d.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="col-md-3">
                      <div className="mb-3">
                        <label className="form-label">
                          Policy Name<span className="text-danger ms-1">*</span>
                        </label>
                        <input
                          type="text"
                          className={`form-control ${errors.POLICY_NAME ? "is-invalid" : ""}`}
                          value={formData.POLICY_NAME}
                          onChange={(e) => handleFieldChange("POLICY_NAME", e.target.value)}
                          maxLength={30}
                        />
                        {errors.POLICY_NAME && <div className="invalid-feedback">{errors.POLICY_NAME}</div>}
                      </div>
                    </div>

                    <div className="col-md-3">
                      <div className="mb-3">
                        <label className="form-label">
                          Start Date<span className="text-danger ms-1">*</span>
                        </label>
                        <input
                          type="date"
                          className={`form-control ${errors.START_DATE ? "is-invalid" : ""}`}
                          value={formData.START_DATE}
                          onChange={(e) => handleFieldChange("START_DATE", e.target.value)}
                        />
                        {errors.START_DATE && <div className="invalid-feedback">{errors.START_DATE}</div>}
                      </div>
                    </div>

                    <div className="col-md-3">
                      <div className="mb-3">
                        <label className="form-label">
                          End Date<span className="text-danger ms-1">*</span>
                        </label>
                        <input
                          type="date"
                          className={`form-control ${errors.END_DATE ? "is-invalid" : ""}`}
                          value={formData.END_DATE}
                          onChange={(e) => handleFieldChange("END_DATE", e.target.value)}
                        />
                        {errors.END_DATE && <div className="invalid-feedback">{errors.END_DATE}</div>}
                      </div>
                    </div>

                    <div className="col-md-3">
                      <div className="mb-3">
                        <label className="form-label">
                          Upload Document{!formData.DOC_PATH && <span className="text-danger ms-1">*</span>}
                        </label>
                        <input
                          type="file"
                          className={`form-control ${errors.doc ? "is-invalid" : ""}`}
                          onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                        />
                        {errors.doc && <div className="invalid-feedback d-block">{errors.doc}</div>}
                        {formData.DOC_PATH && !formData.doc && (
                          <a href={formData.DOC_PATH} target="_blank" rel="noopener noreferrer" className="d-block mt-1">
                            Current document
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="col-md-12">
                      <div className="mb-3">
                        <label className="form-label">
                          Policy Description<span className="text-danger ms-1">*</span>
                        </label>
                        <textarea
                          className={`form-control ${errors.POLICY_DESC ? "is-invalid" : ""}`}
                          value={formData.POLICY_DESC}
                          onChange={(e) => handleFieldChange("POLICY_DESC", e.target.value)}
                          maxLength={300}
                        />
                        {errors.POLICY_DESC && <div className="invalid-feedback">{errors.POLICY_DESC}</div>}
                      </div>
                    </div>

                    <div className="col-md-12">
                      <div className="form-check mb-3">
                        <input
                          type="checkbox"
                          id="IS_MANDAT"
                          className="form-check-input"
                          checked={formData.IS_MANDAT}
                          onChange={(e) => handleFieldChange("IS_MANDAT", e.target.checked)}
                        />
                        <label className="form-check-label" htmlFor="IS_MANDAT">
                          Is Mandatory to View
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="text-end mb-3">
                    <button
                      type="button"
                      className="btn btn-primary me-2"
                      onClick={handleSave}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Processing..." : isEditing ? "Update" : "Save"}
                    </button>
                    {isEditing && formData.STATUS === "N" && (
                      <button
                        type="button"
                        className="btn btn-warning me-2"
                        onClick={() => handlePublish(formData)}
                      >
                        Publish
                      </button>
                    )}
                    <button type="button" className="btn btn-secondary" onClick={resetForm}>
                      Cancel
                    </button>
                    
                    
                  </div>
                </>
              ) : (
                <>
                  {listData.length === 0 ? (
                    <div className="p-4 text-center text-muted">No policies found</div>
                  ) : (
                    <div className="table-responsive">
                      <SDLDataTable
                        data={listData}
                        columns={columns}
                        loading={loading}
                        emptyMessage="No policies found"
                        tableStyle={{ minWidth: "900px" }}
                      />
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

export default PolicyList;