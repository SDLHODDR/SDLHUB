import { useEffect, useMemo, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";

import { getPolicyDataResponse } from "../../../../store/hrms/hrmsPolicySlice";
import { getCompanyMaster, getDepartmentMaster, getDivisionMaster } from "../../services/policyService";

import BreadcrumbNav from "../../components/breadcrumb-nav/BreadcrumbNav";
import { getPortalFromPath } from "../../../../config/portalConfig";
import SDLSearch from "../../../../components/datatable/SDLSearch";
import SDLDataTable from "../../../../components/datatable/SDLDataTable";
import SDLTagSelect from "../../../../components/SDLTagSelect";
import SDLDropdownSelect from "../../components/forms/SDLDropdownSelect";
import { Calendar } from "primereact/calendar";
import SDLCalendar from "../../../../components/calendar/SDLCalendar";
//import Select from "react-select";
import SDLReactSelect from "../../../../components/SDLReactSelect";
import SDLReactMultiSelect from "../../../../components/SDLReactMultiSelect";
// import { MultiSelect } from 'primereact/multiselect'

import { normalizeRecords, getDisplayValue, formatDate } from "../../../../utils/formatUtils";
import { policyColumns } from "../../portalutils/policyColumns";
import { mapCompanyOptions, mapDepartmentOptions, mapDivisionOptions } from "../../portalutils/policyOptionsUtils";
import { usePolicyHandler } from "../../portalutils/usePolicyHandler";
//import "../../assets/css/sdldropselect.css";
import "../../assets/departmentDesignation.css"
import "../../../eportal/assets/css/sdlFormUiEnhancements.css"
import moment from "moment";

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

  const policyData = useSelector((state) => state.hrmspoliciesData?.data);
  const loading = useSelector((state) => state.hrmspoliciesData?.loading) || false;

  const [companyList, setCompanyList] = useState([]);
  const [departmentList, setDepartmentList] = useState([]);
  const [divisionList, setDivisionList] = useState([]);
  const [lookupsLoading, setLookupsLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  // Form mode by default, matching KRA / Department Activity pages. Table
  // view is reached via the toggle button.
  const [showAll, setShowAll] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState(emptyForm);
  const isPublished = isEditing && formData.STATUS === "A";

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

  const policyOptions = useMemo(
    () => listData.map((item) => ({ id: String(item.ID), label: item.POLICY_NAME })),
    [listData],
  );

  //------------------Use this if we wnat to just wipe out search typed keyword-----------
  // const handleSelectPolicy = useCallback((id) => {
  //   if (!id) {
  //     setSelectedPolicy("");
  //     return;
  //   }
  //   const policy = listData.find((item) => String(item.ID) === String(id));
  //   if (policy) handleEdit(policy);
  // }, [listData, handleEdit]);

  //------------------Use this if we wnat to just wipe out search typed keyword or entire form should be reset-----------
  const handleSelectPolicy = useCallback((id) => {
    if (!id) {
      resetForm();
      return;
    }
    const policy = listData.find((item) => String(item.ID) === String(id));
    if (policy) handleEdit(policy);
  }, [listData, handleEdit, resetForm]);

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

     const calendarMinDate =
        moment()
          .startOf("month")
          .toDate();
    
      const calendarMaxDate =
        moment()
          .add(1, "month")
          .endOf("month")
          .toDate();

  const companyOptions = useMemo(
    () =>
      companyList.map((item) => ({
        value: String(item.id),
        label: item.label,
		key: item.id,
      })),
    [companyList],
  );

  return (
    <>
      <div className="sdl-form-ui">
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
                    <div className="d-flex align-items-center" style={{ minWidth: "270px" }}>
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

                <div className="d-flex align-items-center gap-2">
                  <div style={{ minWidth: "270px" }}>
                    {/* <SDLDropdownSelect
                      id="policySelect"
                      options={policyOptions}
                      value={selectedPolicy}
                      onChange={handleSelectPolicy}
                      placeholder="Select Policy Name"
                      searchPlaceholder="Search policy names..."
                      disabled={loading || isSubmitting}
                      wrapperClassName=""
                    /> */}

                    <SDLReactSelect
                        value={selectedPolicy}
                        options={policyOptions.map((opt) => ({ value: opt.id, label: opt.label }))}
                        onChange={handleSelectPolicy}
                        isLoading={loading}
                        isDisabled={loading || isSubmitting}
                      />
                  </div>
                  <button
                    type="button"
                    className="btn btn-outline-secondary d-flex align-items-center gap-2"
                    onClick={handleToggleView}
                    disabled={isSubmitting}
                    style={{ minWidth: "15px" }}
                  >
                    <i className={`fas ${showAll ? "fa-plus" : "fa-table"}`} />
                  </button>
                </div>
              </div>

              {!showAll ? (
                <>
                  {isPublished && (
                    <div className="alert alert-info">
                      This policy is already published and shown for reference only.
                    </div>
                  )}

                  {/* Row 1: Company / Department / Division — separated into
                      its own row so the auto-growing chip boxes (Department,
                      Division) can never overlap the fields below them. */}
                  <div className="row">
                    <div className="col-lg-3">
                      <div className="mb-3">
                        <label className="form-label">
                          Company<span className="text-danger ms-1">*</span>
                        </label>
                        <SDLReactSelect
                          value={formData.COMP_NAME}
                          options={companyOptions}
                          onChange={(val) => handleFieldChange("COMP_NAME", val)}
                          hasError={!!errors.COMP_NAME}
                          isLoading={lookupsLoading}
                          isDisabled={lookupsLoading || isPublished}
                        />
                        {errors.COMP_NAME && (
                          <div className="invalid-feedback d-block">{errors.COMP_NAME}</div>
                        )}
                      </div>
                    </div>

                    <div className="col-lg-4">
                      <div className="mb-3">
                        <label className="form-label">Department</label>
                        <SDLReactMultiSelect
                          value={formData.DEPT_ID}
                          options={departmentList.map((d) => ({ value: String(d.id), label: d.label }))}
                          onChange={(newIds) =>
                            setFormData((prev) => ({ ...prev, DEPT_ID: newIds }))
                          }
                          placeholder="Select Department"
                          isLoading={lookupsLoading}
                          isDisabled={lookupsLoading || isPublished}
                        />
                      </div>
                    </div>

                    

                    <div className="col-lg-4">
                      <div className="mb-3">
                        <label className="form-label">Division</label>
                        <SDLReactMultiSelect
                          value={formData.DIVISION_ID}
                          options={divisionList.map((d) => ({ value: String(d.id), label: d.label }))}
                          onChange={(newIds) =>
                            setFormData((prev) => ({ ...prev, DIVISION_ID: newIds }))
                          }
                          placeholder="Select Division"
                          isLoading={lookupsLoading}
                          isDisabled={lookupsLoading || isPublished}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Row 2: everything else, always starts below Row 1
                      regardless of how many chips Department/Division grow to. */}
                  <div className="row">
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
                          disabled={isPublished}
                        />
                        {errors.POLICY_NAME && <div className="invalid-feedback">{errors.POLICY_NAME}</div>}
                      </div>
                    </div>

                   

                    <div className="col-md-3">
                      <div className="mb-3">
                        <label className="form-label">
                          Start Date<span className="text-danger ms-1">*</span>
                        </label>
                        <SDLCalendar
                          value={toCalendarDate(
                            formData.START_DATE,
                          )}
                          onChange={(date) =>
                            handleFieldChange( "START_DATE", date, )
                          }
                          minDate={ calendarMinDate }
                          maxDate={ calendarMaxDate }
                          allowAllDates={true}
                          disabled={isPublished}
                        />
                       
                        {errors.START_DATE && <div className="invalid-feedback d-block">{errors.START_DATE}</div>}
                      </div>
                    </div>

                   

                    <div className="col-md-3">
                      <div className="mb-3">
                        <label className="form-label">
                          End Date<span className="text-danger ms-1">*</span>
                        </label>
                         <SDLCalendar
                          value={toCalendarDate(
                            formData.END_DATE,
                          )}
                          onChange={(date) =>
                            handleFieldChange( "END_DATE", date, )
                          }
                          minDate={ calendarMinDate }
                          maxDate={ calendarMaxDate }
                          allowAllDates={true}
                          disabled={isPublished}
                        />
                        
                        {errors.END_DATE && <div className="invalid-feedback d-block">{errors.END_DATE}</div>}
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
                          disabled={isPublished}
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
                          maxLength={200}
                          disabled={isPublished}
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
                          disabled={isPublished}
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
                      disabled={isSubmitting || isPublished}
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
      </div>
    </>
  );
};

export default PolicyList;
