import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";

import { getDeptActivitiesDataResponse } from "../../../../store/hrms/hrmsDeptActivitySlice";
import {
  getDepartmentMaster,
  saveDeptActivity,
  deleteDeptActivity,
} from "../../services/departmentActivityService";
import { notifySuccess, notifyError, confirmAction } from "../../../../services/alertService";

import BreadcrumbNav from "../../components/breadcrumb-nav/BreadcrumbNav";
import { getPortalFromPath } from "../../../../config/portalConfig";

import SDLSearch from "../../../../components/datatable/SDLSearch";
import SDLDataTable from "../../../../components/datatable/SDLDataTable";

const ACT_TYPES = ["Join", "Exit"];

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

  // ===========================
  // Fetch Data
  // ===========================
  useEffect(() => {
    dispatch(getDeptActivitiesDataResponse());
  }, [dispatch]);

  const fetchDeptMasterData = async () => {
    try {
      setLoading(true);
      const response = await getDepartmentMaster();
      setListDeptMasterData(normalizeRecords(response));
    } catch (error) {
      console.error("Error fetching Department Master Data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeptMasterData();
  }, []);

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

      return {
        id: String(id),
        label: String(label),
      };
    });
  }, [listDeptMasterData]);

  /* ================= SEARCH FILTER ================= */
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

  const handleFieldChange = (name, value) => {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.DEPT_ID || String(form.DEPT_ID).trim() === "") {
      newErrors.DEPT_ID = "Department Master is required";
    }

    if (!form.ACT_TYPE || String(form.ACT_TYPE).trim() === "") {
      newErrors.ACT_TYPE = "Type is required";
    }

    if (!form.ACT_DESC || String(form.ACT_DESC).trim() === "") {
      newErrors.ACT_DESC = "Department Activity is required";
    }

    const seqRaw = String(form.DISP_SEQ).trim();
    if (!seqRaw) {
      newErrors.DISP_SEQ = "Sequence is required";
    } else if (!/^\d+$/.test(seqRaw)) {
      newErrors.DISP_SEQ = "Sequence must be a whole number";
    } else {
      const seqNum = Number(seqRaw);
      if (seqNum < 1 || seqNum > 100) {
        newErrors.DISP_SEQ = "Sequence must be between 1 and 100";
      }
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setIsEditing(false);
    setSelectedActivity("");
    setForm({
      ID: "",
      DEPT_ID: "",
      ACT_TYPE: "",
      DISP_SEQ: "",
      ACT_DESC: "",
    });
    setErrors({});
  };

  const handleSave = async (e) => {
    e.preventDefault();

    const isValid = validateForm();
    if (!isValid) return;

    setIsSubmitting(true);

    try {
      const payload = {
        ...form,
        DISP_SEQ: Number(form.DISP_SEQ),
      };

      const response = await saveDeptActivity(payload);

      if (response?.status) {
        notifySuccess(response?.message || "Department Activity saved successfully.");
        resetForm();
        dispatch(getDeptActivityDataResponse());
        setShowAll(true);
      } else {
        notifyError(response?.message || "Unable to save Department Activity");
      }
    } catch (err) {
      console.error("Save Error:", err);
      notifyError("Something went wrong while saving data.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectActivity = (value) => {
    setSelectedActivity(value);

    if (!value) {
      resetForm();
      return;
    }

    setShowAll(false);

    const activity = listData.find((item) => String(item.ID) === String(value));

    if (activity) {
      setIsEditing(true);
      setForm({
        ID: activity.ID,
        DEPT_ID: activity.DEPT_ID || "",
        ACT_TYPE: activity.ACT_TYPE || "",
        DISP_SEQ: activity.DISP_SEQ ?? "",
        ACT_DESC: activity.ACT_DESC,
      });
    }
  };

  const handleEditActivity = (activity) => {
    setSelectedActivity(activity.ID);
    setIsEditing(true);
    setShowAll(false);
    setForm({
      ID: activity.ID,
      DEPT_ID: activity.DEPT_ID || "",
      ACT_TYPE: activity.ACT_TYPE || "",
      DISP_SEQ: activity.DISP_SEQ ?? "",
      ACT_DESC: activity.ACT_DESC,
    });
  };

  const handleDeleteActivity = async (row) => {
    try {
      const result = await confirmAction("Are you sure you want to Delete?");
      if (!result?.isConfirmed) return;
      setDeletingId(row.ID);

      const payload = {
        ID: row.ID,
      };

      const response = await deleteDeptActivity(payload);

      if (response?.status) {
        notifySuccess(response?.message || "Record deleted successfully.");
      } else {
        notifyError(response?.message || "Unable to delete record.");
      }

      dispatch(getDeptActivityDataResponse());
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  const serialBody = (rowData, options) =>
    options.rowIndex + 1 + (options.props.first || 0);

  const columns = [
    {
      header: "#",
      body: serialBody,
      style: { width: "70px", textAlign: "center" },
    },
    {
      field: "DEPT_DESC",
      header: "Department",
      sortable: true,
      style: { width: "220px" },
    },
    {
      field: "ACT_TYPE",
      header: "Type",
      sortable: true,
      style: { width: "120px" },
    },
    {
      field: "DISP_SEQ",
      header: "Sequence",
      sortable: true,
      style: { width: "110px", textAlign: "center" },
    },
    {
      field: "ACT_DESC",
      header: "Department Activity",
      sortable: true,
      style: { minWidth: "220px" },
    },
    {
      header: "Action",
      body: (row) => (
        <div className="d-flex align-items-center justify-content-center gap-2">
          
          <button
            type="button"
            className="btn btn-sm btn-outline-danger d-flex align-items-center justify-content-center"
            aria-label="Delete Department Activity"
            onClick={() => handleDeleteActivity(row)}
            disabled={deletingId === row.ID}
          >
            {deletingId === row.ID ? (
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            ) : (
              <i className="ti ti-trash" />
            )}
          </button>
        </div>
      ),
      style: { width: "140px", textAlign: "center" },
    },
  ];

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
                    onClick={() => setShowAll((prev) => !prev)}
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
                        {errors.DEPT_ID && (
                          <div className="invalid-feedback">{errors.DEPT_ID}</div>
                        )}
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
                          {ACT_TYPES.map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                        {errors.ACT_TYPE && (
                          <div className="invalid-feedback">{errors.ACT_TYPE}</div>
                        )}
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
                        {errors.DISP_SEQ && (
                          <div className="invalid-feedback">{errors.DISP_SEQ}</div>
                        )}
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
                          onChange={(e) => handleFieldChange("ACT_DESC", e.target.value)}
                        />
                        {errors.ACT_DESC && (
                          <div className="invalid-feedback">{errors.ACT_DESC}</div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-end mb-3">
                    <button type="button" className="btn btn-secondary me-2" onClick={resetForm}>
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