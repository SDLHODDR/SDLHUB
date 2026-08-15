import { useEffect, useMemo, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";

import { getPolicyDataResponse } from "../../../../store/hrms/hrmsPolicySlice";
import { getCompanyMaster, getDepartmentMaster, getDivisionMaster } from "../../services/policyService";

import BreadcrumbNav from "../../components/breadcrumb-nav/BreadcrumbNav";
import { getPortalFromPath } from "../../../../config/portalConfig";
import SDLSearch from "../../../../components/datatable/SDLSearch";
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

// formatDate() isn't guaranteed to handle every raw shape the API can send
// (some records have "" for STARTDATE, others "DD-Mon-YYYY" strings). Wrap
// it so a bad date can never blow up the whole listData mapping again.
const safeFormatDate = (raw) => {
  if (!raw) return "-";
  try {
    return formatDate(raw) || raw;
  } catch (error) {
    console.warn("formatDate failed for value:", raw, error);
    return raw;
  }
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

  const [searchQuery, setSearchQuery] = useState("");
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

  // Lookup maps (id -> label) built from the already-fetched master lists,
  // used below to translate the policy record's raw codes/ids into
  // display text, since the Policy Get API only returns codes, not
  // descriptions.
  const companyLookup = useMemo(
    () => new Map(companyList.map((c) => [String(c.id), c.label])),
    [companyList],
  );
  const departmentLookup = useMemo(
    () => new Map(departmentList.map((d) => [String(d.id), d.label])),
    [departmentList],
  );
  const divisionLookup = useMemo(
    () => new Map(divisionList.map((d) => [String(d.id), d.label])),
    [divisionList],
  );

  const listData = useMemo(() => {
    try {
      return normalizeRecords(policyData).map((item, index) => {
        // API sends DEPT_ID / DIVISION_ID as comma-separated ID strings
        // (or a single ID, or ""), NOT arrays and NOT *_LIST fields.
        const deptIdList = String(item.DEPT_ID ?? "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        const divisionIdList = String(item.DIVISION_ID ?? "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);

        const compDesc = companyLookup.get(String(item.COMP_NAME ?? "")) || item.COMP_NAME || "-";
        const deptDesc = deptIdList.length
          ? deptIdList.map((id) => departmentLookup.get(id) || id).join(", ")
          : "-";
        const divsnDesc = divisionIdList.length
          ? divisionIdList.map((id) => divisionLookup.get(id) || id).join(", ")
          : "-";

        return {
          ID: item.POLI_ID ?? item.ID ?? item.id ?? index,
          COMP_NAME: item.COMP_NAME ?? "",
          COMP_DESC: compDesc,
          DEPT_DESC: deptDesc,
          DIVSN_DESC: divsnDesc,
          DEPT_ID_LIST: deptIdList,
          DIVISION_ID_LIST: divisionIdList,
          POLICY_NAME: getDisplayValue(item, ["POLICY_NAME"], "-"),
          POLICY_DESC: getDisplayValue(item, ["POLICY_DESC"], "-"),
          // API field is STARTDATE/ENDDATE (no underscore) — kept START_DATE/
          // END_DATE as fallbacks in case a different endpoint variant uses them.
          START_DATE_RAW: item.STARTDATE ?? item.START_DATE ?? "",
          END_DATE_RAW: item.ENDDATE ?? item.END_DATE ?? "",
          START_DATE_DISPLAY: safeFormatDate(item.STARTDATE ?? item.START_DATE),
          END_DATE_DISPLAY: safeFormatDate(item.ENDDATE ?? item.END_DATE),
          DOC_PATH: item.DOC_PATH ?? "",
          IS_MANDAT: item.IS_MANDAT ?? "N",
          STATUS: item.STATUS ?? "N",
        };
      });
    } catch (error) {
      console.error(error);
      return [];
    }
  }, [policyData, companyLookup, departmentLookup, divisionLookup]);

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return listData;
    const query = searchQuery.trim().toLowerCase();
    console.log("============ListData==========", listData);
    return listData.filter(
      (item) =>
        item.POLICY_NAME.toLowerCase().includes(query) ||
        item.POLICY_DESC.toLowerCase().includes(query) ||
        item.COMP_DESC.toLowerCase().includes(query) ||
        item.DEPT_DESC.toLowerCase().includes(query) ||
        item.DIVSN_DESC.toLowerCase().includes(query),
    );
  }, [searchQuery, listData]);

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
    resetForm(); // always reset — clears fields/errors regardless of direction
    setShowAll((prev) => !prev);
  }, [resetForm]);

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
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-3">
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  {showAll && (
                    <div className="d-flex align-items-center" style={{ minWidth: "260px" }}>
                      <SDLSearch
                        value={searchQuery}
                        onChange={setSearchQuery}
                        placeholder="Search policies..."
                        className="mb-0"
                        style={{ width: "100%" }}
                      />
                    </div>
                  )}
                </div>

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
                  {filteredData.length === 0 ? (
                    <div className="p-4 text-center text-muted">No policies found</div>
                  ) : (
                    <div className="table-responsive">
                      <SDLDataTable
                        data={filteredData}
                        columns={columns}
                        loading={loading}
                        emptyMessage="No policies found"
                        removableSort
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
