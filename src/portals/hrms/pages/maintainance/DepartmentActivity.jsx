import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";

import { getDeptActivitiesDataResponse } from "../../../../store/hrms/hrmsDeptActivitySlice";
import { getDepartmentMaster, createDepartmentMaster } from "../../services/departmentActivityService";

import BreadcrumbNav from "../../components/breadcrumb-nav/BreadcrumbNav";
import { getPortalFromPath } from "../../../../config/portalConfig";

import SDLSearch from "../../../../components/datatable/SDLSearch";
import SDLDataTable from "../../../../components/datatable/SDLDataTable";
import { normalizeRecords, getDisplayValue } from "../../../../utils/formatUtils";
import { departmentActivityColumns } from "../../portalutils/departmentActivityColumns";
import { useDepartmentActivityHandler } from "../../portalutils/useDepartmentActivityHandler";

// import SDLActivitySelector from "../../components/SDLActivitySelector";
import SDLDropdownSelect from "../../components/forms/SDLDropdownSelect";


const ACT_TYPES = { J: "Join", E: "Exit" };

const DepartmentActivity = () => {
  const dispatch = useDispatch();

  const location = useLocation();
  const portal = getPortalFromPath(location.pathname);
  const portalHome = `/${portal.key}/dashboard`;

  const deptActivityData = useSelector((state) => state.hrmsdeptactivitiesData?.data);

  const [loading, setLoading] = useState(false);
  const [listDeptMasterData, setListDeptMasterData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [showAll, setShowAll] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [form, setForm] = useState({
    ID: "",
    DEPT_ID: "",
    ACT_TYPE: "",
    DISP_SEQ: "",
    ACT_DESC: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    dispatch(getDeptActivitiesDataResponse());
  }, [dispatch]);

  const fetchDeptMasterData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getDepartmentMaster();
      setListDeptMasterData(normalizeRecords(response));
    } catch (error) {
      console.error("Error fetching Department Master Data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDeptMasterData();
  }, [fetchDeptMasterData]);

  const listData = useMemo(() => {
    try {
      return normalizeRecords(deptActivityData).map((item, index) => ({
        ID: item.ID ?? item.id ?? index,
        DEPT_ID: item.DEPT_ID ?? item.dept_id ?? item.DEPTID ?? item.deptId ?? "",
        DEPT_DESC: getDisplayValue(item, ["DEPT_DESC", "dept_desc", "DEPT_MASTER_DESC", "name", "label"], "-"),
        ACT_TYPE: getDisplayValue(item, ["ACT_TYPE", "act_type", "type"], "-"),
        ACT_TYPE_TEXT: getDisplayValue(item, ["ACT_TYPE_TEXT", "act_type", "type"], "-"),
        DISP_SEQ: item.DISP_SEQ ?? item.disp_seq ?? item.dispSeq ?? "",
        ACT_DESC: getDisplayValue(item, ["ACT_DESC", "act_desc", "activityDesc", "title", "name"], "-"),
        createdOn: item.created_on || item.createdOn || "-",
      }));
    } catch (error) {
      console.error(error);
      return [];
    }
  }, [deptActivityData]);

  const deptOptions = useMemo(() => {
    return normalizeRecords(listDeptMasterData).map((item, index) => {
      const id = getDisplayValue(item, ["DEPT_ID", "ID", "id", "dept_id", "DEPTID", "deptId"], index);
      const label = getDisplayValue(item, ["DEPT_DESC", "dept_desc", "DEPT_MASTER_DESC", "name", "label"], "-");
      return { id: String(id), label: String(label) };
    });
  }, [listDeptMasterData]);

  // (1) Top "Select Department Activity" — keyword-searchable, sourced
  // straight from listData (already-loaded API data), same pattern as
  // KRAActivity's top selector.
  const activityOptions = useMemo(
    () => listData.map((item) => ({ id: String(item.ID), label: item.ACT_DESC })),
    [listData],
  );

  // Table-mode search — driven only by the visible SDLSearch box.
  // Independent from the form-mode search below.
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return listData;

    const query = searchQuery.trim().toLowerCase();
    return listData.filter(
      (item) =>
        item.DEPT_DESC.toLowerCase().includes(query) ||
        item.ACT_DESC.toLowerCase().includes(query) ||
        String(item.ACT_TYPE).toLowerCase().includes(query) ||
        String(item.ACT_TYPE_TEXT).toLowerCase().includes(query),
    );
  }, [searchQuery, listData]);

  // (3)+(4) Form-mode search — driven by typing in the Department Master
  // dropdown. Two-step + one extra filter, not a text match against
  // ACT_DESC:
  //   1. Find which DEPARTMENT MASTER records match the typed text (by label).
  //   2. Collect their DEPT_IDs.
  //   3. Show DEPARTMENT ACTIVITIES whose DEPT_ID is in that set...
  //   4. ...AND (if a Type is currently selected in the form) whose
  //      ACT_TYPE also matches that selected type.
  const [masterSearchQuery, setMasterSearchQuery] = useState("");

  const matchedDeptIds = useMemo(() => {
    if (!masterSearchQuery.trim()) return null;
    const query = masterSearchQuery.trim().toLowerCase();
    return new Set(
      deptOptions
        .filter((option) => option.label.toLowerCase().includes(query))
        .map((option) => option.id),
    );
  }, [masterSearchQuery, deptOptions]);

  const formFilteredData = useMemo(() => {
    if (!matchedDeptIds) return [];
    if (matchedDeptIds.size === 0) return [];
    return listData.filter((item) => {
      const matchesDept = matchedDeptIds.has(String(item.DEPT_ID));
      const matchesType = form.ACT_TYPE ? item.ACT_TYPE === form.ACT_TYPE : true;
      return matchesDept && matchesType;
    });
  }, [matchedDeptIds, listData, form.ACT_TYPE]);

  const resetForm = useCallback(() => {
    setIsEditing(false);
    setSelectedActivity("");
    setForm({ ID: "", DEPT_ID: "", ACT_TYPE: "", DISP_SEQ: "", ACT_DESC: "" });
    setErrors({});
    setMasterSearchQuery(""); // clear the inline preview table too
  }, []);

  const {
    handleFieldChange,
    handleSave,
    handleEditActivity,
    handleSelectActivity,
    handleDeleteActivity,
  } = useDepartmentActivityHandler({
    form,
    setForm,
    setErrors,
    setIsSubmitting,
    setDeletingId,
    dispatch,
    getDeptActivitiesDataResponse,
    listData,
    setSelectedActivity,
    setIsEditing,
    setShowAll,
    resetForm,
    isEditing,
  });

  // (2) Department Master "add new" + live search wiring — same pattern as
  // KRAActivity's handleAddNewKRAMaster.
  const handleAddNewDeptMaster = useCallback(async (typedText) => {
    try {
      const response = await createDepartmentMaster({ DEPT_DESC: typedText });

      // Expected API shape: { status, message, data: { DEPT_ID } } — a
      // single flat object, matching createKRAMaster's shape. Adjust the
      // key names below if your actual endpoint differs.
      if (!response?.status) {
        throw new Error(response?.message || "Failed to create Department Master");
      }

      const newId = String(response.data?.DEPT_ID ?? "");
      if (!newId) {
        throw new Error("API did not return a DEPT_ID");
      }

      const newOption = { id: newId, label: typedText };
      setListDeptMasterData((prev) => [...prev, { DEPT_ID: newId, DEPT_DESC: typedText }]);
      return newOption;
    } catch (error) {
      // TEMPORARY fallback: only reached if the API call itself fails.
      // Lets the "add new" flow be exercised end-to-end while the backend
      // endpoint is still being finished. Remove this catch block once the
      // real API is confirmed stable.
      console.warn("createDepartmentMaster failed, adding locally only:", error);
      const tempId = `temp-${Date.now()}`;
      setListDeptMasterData((prev) => [...prev, { DEPT_ID: tempId, DEPT_DESC: typedText }]);
      return { id: tempId, label: typedText };
    }
  }, []);

  const masterSearchDebounceRef = useRef(null);

  const handleDeptMasterSearch = useCallback((text) => {
    if (masterSearchDebounceRef.current) clearTimeout(masterSearchDebounceRef.current);
    masterSearchDebounceRef.current = setTimeout(() => {
      setMasterSearchQuery(text ?? "");
      // Deliberately NOT touching `showAll` — stays in form mode, results
      // render as an inline table below the form.
    }, 250);
  }, []);

  useEffect(() => {
    return () => {
      if (masterSearchDebounceRef.current) clearTimeout(masterSearchDebounceRef.current);
    };
  }, []);

  const columns = useMemo(
    () => departmentActivityColumns({ handleEditActivity, handleDeleteActivity, deletingId }),
    [handleEditActivity, handleDeleteActivity, deletingId],
  );

  const handleToggleView = () => {
    if (isSubmitting) return;
    resetForm(); // always reset — clears fields, errors, and inline search — regardless of direction
    setShowAll((prev) => !prev);
  };

  return (
    <>
      <div className="page-header">
        <div className="add-item d-flex">
          <div className="page-title">
            <h4>Department Activity</h4>
          </div>
        </div>

        <BreadcrumbNav
          items={[
            { text: "Home", link: portalHome },
            { text: "Department Activity" },
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
                        placeholder="Search Department Activity..."
                        className="mb-0"
                        style={{ width: "100%" }}
                      />
                    </div>
                  )}
                </div>

                {/* (1) Keyword-searchable "Select Department Activity", same
                    pattern as KRAActivity's top selector — toggle button
                    kept as its own explicit sibling element. */}
                <div className="d-flex align-items-center gap-2">
                  <div style={{ minWidth: "240px" }}>
                    <SDLDropdownSelect
                      id="deptActivitySelect"
                      options={activityOptions}
                      value={selectedActivity}
                      onChange={(id) => handleSelectActivity(id)}
                      placeholder="Select Department Activity"
                      disabled={loading}
                      wrapperClassName=""
                    />
                  </div>
                  <button
                    type="button"
                    className="btn btn-outline-secondary d-flex align-items-center gap-2"
                    onClick={handleToggleView}
                    disabled={isSubmitting}
                    style={{ minWidth: "15px" }}
                  >
                    <i className={`fas ${showAll ? "fa-edit" : "fa-table"}`} />
                  </button>
                </div>
              </div>

              {!showAll ? (
                <>
                  <div className="row">
                    <div className="col-lg-4 col-md-6">
                      {/* (2) Department Master — searchable + creatable,
                          same pattern as Department Master in DepartmentActivity. */}
                      <SDLDropdownSelect
                        id="deptMaster"
                        label="Department Master"
                        required
                        options={deptOptions}
                        value={form.DEPT_ID}
                        onChange={(id) => handleFieldChange("DEPT_ID", id)}
                        invalid={!!errors.DEPT_ID}
                        errorMessage={errors.DEPT_ID}
                        disabled={loading}
                        allowAddNew
                        onAddNew={handleAddNewDeptMaster}
                        onFilterChange={handleDeptMasterSearch}
                        placeholder="Select Department"
                      />
                    </div>

                    <div className="col-lg-4 col-md-6">
                      <div className="mb-3">
                        <label className="form-label">
                          Type
                          <span className="text-danger ms-1">*</span>
                        </label>
                        <select
                          className={`form-select ${errors.ACT_TYPE ? "is-invalid" : ""}`}
                          value={form.ACT_TYPE}
                          onChange={(e) => handleFieldChange("ACT_TYPE", e.target.value)}
                        >
                          <option value="">Select Type</option>
                          {Object.entries(ACT_TYPES).map(([code, label]) => (
                            <option key={code} value={code}>
                              {label}
                            </option>
                          ))}
                        </select>
                        {errors.ACT_TYPE && <div className="invalid-feedback">{errors.ACT_TYPE}</div>}
                      </div>
                    </div>

                    <div className="col-lg-4 col-md-6">
                      <div className="mb-3">
                        <label className="form-label">
                          Sequence
                          <span className="text-danger ms-1">*</span>
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={100}
                          className={`form-control ${errors.DISP_SEQ ? "is-invalid" : ""}`}
                          value={form.DISP_SEQ}
                          onChange={(e) => handleFieldChange("DISP_SEQ", e.target.value)}
                        />
                        {errors.DISP_SEQ && <div className="invalid-feedback">{errors.DISP_SEQ}</div>}
                      </div>
                    </div>

                    <div className="col-lg-8">
                      <div className="mb-3">
                        <label className="form-label">
                          Department Activity
                          <span className="text-danger ms-1">*</span>
                        </label>
                        <input
                          type="text"
                          className={`form-control ${errors.ACT_DESC ? "is-invalid" : ""}`}
                          value={form.ACT_DESC}
                          maxLength={100}
                          onChange={(e) => handleFieldChange("ACT_DESC", e.target.value)}
                        />
                        {errors.ACT_DESC && <div className="invalid-feedback">{errors.ACT_DESC}</div>}
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
                    <button type="button" className="btn btn-secondary" onClick={resetForm}>
                      Cancel
                    </button>
                  </div>

                  {/* (5) Inline preview table — only while there's an
                      active Department Master search and we're still in
                      form mode. Disappears once the search is cleared or
                      the form is reset/submitted (see resetForm). Also
                      re-filters automatically whenever Type changes, since
                      formFilteredData depends on form.ACT_TYPE too. */}
                  {masterSearchQuery.trim() && (
                    <div className="table-responsive mt-2">
                      {formFilteredData.length === 0 ? (
                        <div className="p-3 text-center text-muted border rounded">
                          No matching Department Activities
                        </div>
                      ) : (
                        <SDLDataTable
                          data={formFilteredData}
                          columns={columns}
                          loading={false}
                          emptyMessage="No matching Department Activities"
                          className="holiday-calendar-grid"
                          removableSort
                          tableStyle={{ minWidth: "650px" }}
                        />
                      )}
                    </div>
                  )}
                </>
              ) : (
                <>
                  {listData.length === 0 ? (
                    <div className="p-4 text-center text-muted">No data found</div>
                  ) : (
                    <div className="table-responsive">
                      <SDLDataTable
                        data={filteredData}
                        columns={columns}
                        loading={false}
                        emptyMessage="No data found"
                        className="holiday-calendar-grid"
                        removableSort
                        tableStyle={{ minWidth: "650px" }}
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

export default DepartmentActivity;