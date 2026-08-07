import { useMemo, useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";

import { useDispatch, useSelector } from "react-redux";
// NOTE: hrmsDepartmentSlice may not exist in all installs. Use dynamic import to avoid module-not-found errors.
// TODO: create/verify departmentService with these methods (or adjust import paths)
import { getDepartmentMasterData, saveDepartment, deleteDepartment } from "../../services/departmentService";
import { notifySuccess, notifyError, confirmAction } from "../../../../services/alertService";

import BreadcrumbNav from "../../components/breadcrumb-nav/BreadcrumbNav";
import { getPortalFromPath } from "../../../../config/portalConfig";

import SDLSearch from "../../../../components/datatable/SDLSearch";
import SDLDataTable from "../../../../components/datatable/SDLDataTable";

const normalizeRecords = (payload) => {
  if (Array.isArray(payload)) return payload;

  if (payload && typeof payload === "object") {
    for (const key of ["data", "records", "result", "items", "list", "rows", "departments", "department"]) {
      if (Array.isArray(payload[key])) return payload[key];

      if (payload[key] && typeof payload[key] === "object") {
        for (const subKey of ["data", "records", "result", "items", "list", "rows", "departments", "department"]) {
          if (Array.isArray(payload[key][subKey])) return payload[key][subKey];
        }
      }
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

const Department = () => {
  const dispatch = useDispatch();

  const location = useLocation();
  const portal = getPortalFromPath(location.pathname);
  const portalHome = `/${portal.key}/dashboard`;

  const [loading, setLoading] = useState(false);
  const [listDepartmentMasterData, setListDepartmentMasterData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  // department data from redux (slice name may vary) - adjust selector if needed
  const departmentData = useSelector((state) => state.hrmsDepartmentData?.data);

  const [showAll, setShowAll] = useState(false);
  const [selectedDept, setSelectedDept] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const refreshDepartmentData = useCallback(async () => {
    try {
      const slicePath = "../../../../store/hrms/hrmsDepartmentSlice";
      const mod = await import(/* @vite-ignore */ slicePath);
      if (mod && mod.getDepartmentDataResponse) {
        dispatch(mod.getDepartmentDataResponse());
      }
    } catch {
      // slice not available - ignore
    }
  }, [dispatch]);

  useEffect(() => {
    // attempt to refresh via redux slice if present; safe no-op otherwise
    refreshDepartmentData();
  }, [refreshDepartmentData]);

  const fetchDepartmentMasterData = async () => {
    try {
      setLoading(true);
      const response = await getDepartmentMasterData();
      setListDepartmentMasterData(normalizeRecords(response));
    } catch (error) {
      console.error("Error fetching Department Master Data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDepartmentMasterData();
  }, []);

  const listData = useMemo(() => {
    try {
      const source = normalizeRecords(departmentData);
      const fallback = normalizeRecords(listDepartmentMasterData);
      const records = source.length ? source : fallback;

      return records.map((item, index) => ({
        ID: item.ID ?? item.id ?? index,
        DEPT_ID: item.DEPT_ID ?? item.dept_id ?? item.departmentId ?? item.deptId ?? "",
        DEPT_CODE: getDisplayValue(item, ["DEPT_CODE", "dept_code", "code", "shortCode", "code"], "-"),
        DEPT_NAME: getDisplayValue(item, ["DEPT_NAME", "dept_name", "name", "department_name", "label"], "-"),
        createdOn: item.created_on || item.createdOn || "-",
      }));
    } catch (error) {
      console.error(error);
      return [];
    }
  }, [departmentData, listDepartmentMasterData]);

  /* ================= SEARCH FILTER ================= */
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return listData;

    const query = searchQuery.trim().toLowerCase();

    return listData.filter((item) => item.DEPT_NAME.toLowerCase().includes(query) || item.DEPT_CODE.toLowerCase().includes(query));
  }, [searchQuery, listData]);

  const [formData, setFormData] = useState({
    ID: "",
    DEPT_ID: "",
    DEPT_CODE: "",
    DEPT_NAME: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const handleFieldChange = (name, value) => {
    setFormData((prev) => ({
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

    if (!formData.DEPT_CODE || String(formData.DEPT_CODE).trim() === "") {
      newErrors.DEPT_CODE = "Department Code is required";
    }

    if (!formData.DEPT_NAME || String(formData.DEPT_NAME).trim() === "") {
      newErrors.DEPT_NAME = "Department Name is required";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (e) => {
    e && e.preventDefault && e.preventDefault();

    const isValid = validateForm();
    if (!isValid) return;

    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
      };

      const response = await saveDepartment(payload);

      if (response?.status) {
        notifySuccess(response?.message || "Department saved successfully.");
        resetForm();
        // refresh list
        void refreshDepartmentData();
        setShowAll(true);
      } else {
        notifyError(response?.message || "Unable to save Department");
      }
    } catch (err) {
      console.error("Save Error:", err);
      notifyError("Something went wrong while saving data.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setSelectedDept("");
    setFormData({
      ID: "",
      DEPT_ID: "",
      DEPT_CODE: "",
      DEPT_NAME: "",
    });
  };

  const handleSelectDept = (value) => {
    setSelectedDept(value);

    if (!value) {
      resetForm();
      return;
    }

    setShowAll(false);

    const dept = listData.find((item) => String(item.ID) === String(value));

    if (dept) {
      setIsEditing(true);
      setFormData({
        ID: dept.ID,
        DEPT_ID: dept.DEPT_ID || "",
        DEPT_CODE: dept.DEPT_CODE,
        DEPT_NAME: dept.DEPT_NAME,
      });
    }
  };

  const handleEditDept = (dept) => {
    setSelectedDept(dept.ID);
    setIsEditing(true);
    setShowAll(false);
    setFormData({
      ID: dept.ID,
      DEPT_ID: dept.DEPT_ID || "",
      DEPT_CODE: dept.DEPT_CODE,
      DEPT_NAME: dept.DEPT_NAME,
    });
  };

  const handleDeleteDept = async (row) => {
    try {
      const result = await confirmAction("Are you sure you want to Delete?");
      if (!result?.isConfirmed) return;
      setDeletingId(row.ID);

      const payload = {
        ID: row.ID,
      };

      const response = await deleteDepartment(payload);

      if (response?.status) {
        notifySuccess(response?.message || "Record deleted successfully.");
      } else {
        notifyError(response?.message || "Unable to delete record.");
      }

      // refresh list
      void refreshDepartmentData();
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  const serialBody = (rowData, options) => options.rowIndex + 1 + (options.props.first || 0);

  const titleBody = (row) => <>{row.DEPT_NAME}</>;

  const columns = [
    {
      header: "#",
      body: serialBody,
      style: {
        width: "70px",
        textAlign: "center",
      },
    },
    {
      field: "DEPT_CODE",
      header: "Department Code",
      sortable: true,
      style: {
        width: "220px",
      },
    },
    {
      field: "DEPT_NAME",
      header: "Department Name",
      body: titleBody,
      sortable: true,
      style: {
        width: "260px",
      },
    },
    {
      header: "Action",
      body: (row) => (
        <div className="d-flex align-items-center justify-content-center gap-2">
          <button
            type="button"
            className="btn btn-sm btn-outline-primary d-flex align-items-center justify-content-center"
            onClick={() => handleEditDept(row)}
            aria-label="Edit Department"
          >
            <i className="ti ti-edit" />
          </button>
          <button
            type="button"
            className="btn btn-sm btn-outline-danger d-flex align-items-center justify-content-center"
            aria-label="Delete Department"
            onClick={() => handleDeleteDept(row)}
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
      style: {
        width: "140px",
        textAlign: "center",
      },
    },
  ];

  return (
    <>
      <div className="page-header">
        <div className="add-item d-flex">
          <div className="page-title">
            <h4>Department</h4>
          </div>
        </div>

        <BreadcrumbNav
          items={[
            {
              text: "Home",
              link: portalHome,
            },
            {
              text: "Department",
            },
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
                        placeholder="Search Department..."
                        className="mb-0"
                        style={{ width: "100%" }}
                      />
                    </div>
                  )}
                </div>

                <div className="d-flex align-items-center gap-2">
                  <select
                    className="form-select"
                    value={selectedDept}
                    onChange={(e) => handleSelectDept(e.target.value)}
                    style={{ minWidth: "200px" }}
                    disabled={loading}
                  >
                    <option value="">Select Department</option>
                    {listData.map((item) => (
                      <option key={item.ID} value={item.ID}>
                        {item.DEPT_NAME}
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
                          Department Code
                          <span className="text-danger ms-1">*</span>
                        </label>
                        <input
                          type="text"
                          className={`form-control ${errors.DEPT_CODE ? "is-invalid" : ""}`}
                          value={formData.DEPT_CODE}
                          onChange={(e) => handleFieldChange("DEPT_CODE", e.target.value)}
                        />
                        {errors.DEPT_CODE && <div className="invalid-feedback">{errors.DEPT_CODE}</div>}
                      </div>
                    </div>

                    <div className="col-lg-4 col-md-6">
                      <div className="mb-3">
                        <label className="form-label">
                          Department Name
                          <span className="text-danger ms-1">*</span>
                        </label>
                        <input
                          type="text"
                          className={`form-control ${errors.DEPT_NAME ? "is-invalid" : ""}`}
                          value={formData.DEPT_NAME}
                          onChange={(e) => handleFieldChange("DEPT_NAME", e.target.value)}
                        />
                        {errors.DEPT_NAME && <div className="invalid-feedback">{errors.DEPT_NAME}</div>}
                      </div>
                    </div>
                  </div>

                  <div className="text-end mb-3">
                    <button type="button" className="btn btn-secondary me-2" onClick={resetForm}>
                      Cancel
                    </button>
                    <button type="button" className="btn btn-primary" onClick={handleSave} disabled={isSubmitting}>
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
                        className="department-grid"
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

export default Department;
