import { useEffect, useMemo, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";

import { getDeptActivitiesDataResponse } from "../../../../store/hrms/hrmsDeptActivitySlice";
import { getDepartmentMaster } from "../../services/departmentActivityService";

import BreadcrumbNav from "../../components/breadcrumb-nav/BreadcrumbNav";
import { getPortalFromPath } from "../../../../config/portalConfig";

import SDLSearch from "../../../../components/datatable/SDLSearch";
import SDLDataTable from "../../../../components/datatable/SDLDataTable";
import { normalizeRecords, getDisplayValue } from "../../../../utils/formatUtils";
import { departmentActivityColumns } from "../../portalutils/departmentActivityColumns";
import { useDepartmentActivityHandler } from "../../portalutils/useDepartmentActivityHandler";

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

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return listData;

    const query = searchQuery.trim().toLowerCase();
    return listData.filter(
      (item) =>
        item.DEPT_DESC.toLowerCase().includes(query) ||
        item.ACT_DESC.toLowerCase().includes(query) ||
        String(item.ACT_TYPE).toLowerCase().includes(query),
    );
  }, [searchQuery, listData]);

  const resetForm = useCallback(() => {
    setIsEditing(false);
    setSelectedActivity("");
    setForm({ ID: "", DEPT_ID: "", ACT_TYPE: "", DISP_SEQ: "", ACT_DESC: "" });
    setErrors({});
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
  });

  const columns = useMemo(
    () => departmentActivityColumns({ handleDeleteActivity, deletingId }),
    [handleDeleteActivity, deletingId],
  );

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

                <div className="d-flex align-items-center gap-2">
                  <select
                    className="form-select"
                    value={selectedActivity}
                    onChange={(e) => handleSelectActivity(e.target.value)}
                    style={{ minWidth: "200px" }}
                    disabled={loading}
                  >
                    <option value="">Select Department Activity</option>
                    {listData.map((item) => (
                      <option key={item.ID} value={item.ID}>
                        {item.ACT_DESC}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="btn btn-outline-secondary d-flex align-items-center gap-2"
                    onClick={() => {
                      setShowAll((prev) => {
                        const next = !prev;
                        if (next) {
                          resetForm();
                        }
                        return next;
                      });
                    }}
                    style={{ minWidth: "120px" }}
                  >
                    <i className={`fas ${showAll ? "fa-edit" : "fa-table"}`} />
                    {showAll ? "Form" : "Table"}
                  </button>
                </div>
              </div>

              {!showAll ? (
                <>
                  <div className="row">
                    <div className="col-lg-4 col-md-6">
                      <div className="mb-3">
                        <label className="form-label">
                          Department Master
                          <span className="text-danger ms-1">*</span>
                        </label>
                        <select
                          className={`form-select ${errors.DEPT_ID ? "is-invalid" : ""}`}
                          value={form.DEPT_ID}
                          onChange={(e) => handleFieldChange("DEPT_ID", e.target.value)}
                          disabled={loading}
                        >
                          <option value="">Select Department</option>
                          {deptOptions.map((option) => (
                            <option key={option.id} value={option.id}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        {errors.DEPT_ID && <div className="invalid-feedback">{errors.DEPT_ID}</div>}
                      </div>
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
                    <button type="button" className="btn btn-primary me-2" onClick={handleSave} disabled={isSubmitting}
                    >
                      {isSubmitting ? "Processing..." : isEditing ? "Update" : "Save"}
                    </button>      
                    <button type="button" className="btn btn-secondary" onClick={resetForm}>
                      Cancel
                    </button>
                    
                  </div>
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