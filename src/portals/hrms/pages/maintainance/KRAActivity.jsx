import { useMemo, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

import { useDispatch, useSelector } from "react-redux";
import { getKRAActivityDataResponse } from "../../../../store/hrms/hrmsKRAActivitySlice";
import { getKRAMasterData, saveKRAActivity, deleteKRAActivity } from "../../services/kraActivityService";
import { notifySuccess, notifyError, confirmAction } from "../../../../services/alertService";

import BreadcrumbNav from "../../components/breadcrumb-nav/BreadcrumbNav";
import { getPortalFromPath } from "../../../../config/portalConfig";

import SDLSearch from "../../../../components/datatable/SDLSearch";
import SDLDataTable from "../../../../components/datatable/SDLDataTable";

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

const KRAActivity = () => {
  const dispatch = useDispatch();
  
  const location = useLocation();
  const portal = getPortalFromPath(location.pathname);
  const portalHome = `/${portal.key}/dashboard`;
  //const kraLoading = useSelector((state) => state.hrmsKRAAcivityData.loading);
  const [loading, setLoading] = useState(false);
  const [listKRAMasterData, setListKRAMasterData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const kraActivityData = useSelector((state) => state.hrmsKRAAcivityData?.data);

  const [showAll, setShowAll] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    dispatch(getKRAActivityDataResponse());
  }, [dispatch]);

  const fetchKRAMasterData = async () => {
    try {
      setLoading(true);
      const response = await getKRAMasterData();
      setListKRAMasterData(normalizeRecords(response));
    } catch (error) {
      console.error("Error fetching KRA Master Data:", error);
    } finally {
      setLoading(false);
    }
  };

  // ===========================
  // Fetch Data
  // ===========================
  
  useEffect(() => {
    fetchKRAMasterData();
  }, []);

  const listData = useMemo(() => {
    try {
      return normalizeRecords(kraActivityData).map((item, index) => ({
        ID: item.ID ?? item.id ?? index,
        KRA_ID: item.KRA_ID ?? item.kra_id ?? item.KRAID ?? item.kraId ?? "",
        KRA_DESC: getDisplayValue(item, ["KRA_DESC", "kra_desc", "KRA_MASTER_DESC", "name", "label"], "-"),
        ACTT_DESC: getDisplayValue(item, ["ACTT_DESC", "activity_desc", "activityTitle", "title", "name"], "-"),
        createdOn: item.created_on || item.createdOn || "-",
      }));
    } catch (error) {
      console.error(error);
      return [];
    }
  }, [kraActivityData]);

  const masterOptions = useMemo(() => {
    return normalizeRecords(listKRAMasterData).map((item, index) => {
      const id = getDisplayValue(item, ["KRA_ID", "ID", "id", "kra_id", "KRAID", "kraId"], index);
      const label = getDisplayValue(item, ["KRA_DESC", "kra_desc", "KRA_MASTER_DESC", "name", "label", "ACTT_DESC"], "-");

      return {
        id: String(id),
        label: String(label),
      };
    });
  }, [listKRAMasterData]);

  /* ================= SEARCH FILTER ================= */
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return listData;

    const query = searchQuery.trim().toLowerCase();

    return listData.filter(
      (item) =>
        item.KRA_DESC.toLowerCase().includes(query) ||
        item.ACTT_DESC.toLowerCase().includes(query),
    );
  }, [searchQuery, listData]);

  const [formData, setFormData] = useState({
    ID: "",
    KRA_ID: "",
    KRA_DESC: "",
    ACTT_DESC: "",
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

    if (!formData.KRA_ID || String(formData.KRA_ID).trim() === "") {
      newErrors.KRA_ID = "KRA Master is required";
    }

    if (!formData.ACTT_DESC || String(formData.ACTT_DESC).trim() === "") {
      newErrors.ACTT_DESC = "KRA Activity is required";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();

    const isValid = validateForm();
    if (!isValid) return;

    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        // API may expect flags; keep minimal payload and let backend decide
      };

      const response = await saveKRAActivity(payload);

      if (response?.status) {
        notifySuccess(response?.message || "KRA Activity saved successfully.");
        resetForm();
        // refresh list
        dispatch(getKRAActivityDataResponse());
        // show table view after successful save/update
        setShowAll(true);
      } else {
        notifyError(response?.message || "Unable to save KRA Activity");
      }
    } catch (err) {
      console.error("Save Error:", err);
      notifyError("Something went wrong while saving data.");
    } finally {
      setIsSubmitting(false);
    }
  };

  //const currentActivity = listData.find((item) => item.ACTT_DESC === selectedActivity) || null;

  const resetForm = () => {
    setIsEditing(false);
    setSelectedActivity("");
    setFormData({
      ID: "",
      KRA_ID: "",
      KRA_DESC: "",
      ACTT_DESC: "",
    });
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
      setFormData({
        ID: activity.ID,
        KRA_ID: activity.KRA_ID || "",
        KRA_DESC: activity.KRA_DESC,
        ACTT_DESC: activity.ACTT_DESC,
      });
    }
  };

  const handleEditActivity = (activity) => {
    setSelectedActivity(activity.ID);
    setIsEditing(true);
    setShowAll(false);
    setFormData({
      ID: activity.ID,
      KRA_ID: activity.KRA_ID || "",
      KRA_DESC: activity.KRA_DESC,
      ACTT_DESC: activity.ACTT_DESC,
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

      const response = await deleteKRAActivity(payload);

      if (response?.status) {
        notifySuccess(response?.message || "Record deleted successfully.");
      } else {
        notifyError(response?.message || "Unable to delete record.");
      }

      // refresh list
      dispatch(getKRAActivityDataResponse());
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  const serialBody = (rowData, options) =>
    options.rowIndex + 1 + (options.props.first || 0);

  const titleBody = (row) => <>{row.ACTT_DESC}</>;

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
      field: "KRA_DESC",
      header: "KRA Master",
      sortable: true,
      style: {
        width: "260px",
      },
    },
    {
      field: "ACTT_DESC",
      header: "KRA Activity",
      body: titleBody,
      sortable: true,
      style: {
        width: "220px",
      },
    },
    {
      header: "Action",
      body: (row) => (
        <div className="d-flex align-items-center justify-content-center gap-2">
          <button
            type="button"
            className="btn btn-sm btn-outline-primary d-flex align-items-center justify-content-center"
            onClick={() => handleEditActivity(row)}
            aria-label="Edit KRA Activity"
          >
            <i className="ti ti-edit" />
          </button>
          <button
            type="button"
            className="btn btn-sm btn-outline-danger d-flex align-items-center justify-content-center"
            aria-label="Delete KRA Activity"
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
            <h4>KRA Activity</h4>
          </div>
        </div>

        <BreadcrumbNav
          items={[
            {
              text: "Home",
              link: portalHome,
            },
            {
              text: "KRA Activity",
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
                        placeholder="Search KRA..."
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
                    <option value="">Select KRA Activity</option>
                    {listData.map((item) => (
                      <option key={item.ID} value={item.ID}>
                        {item.ACTT_DESC}
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
                        KRA Master
                        <span className="text-danger ms-1">*</span>
                      </label>
                        <select
                          className={`form-select ${errors.KRA_ID ? "is-invalid" : ""}`}
                          value={formData.KRA_ID}
                          onChange={(e) => {
                            const selectedMaster = masterOptions.find(
                              (option) => option.id === e.target.value,
                            );

                            handleFieldChange("KRA_ID", e.target.value);
                            handleFieldChange("KRA_DESC", selectedMaster?.label || "");
                          }}
                          disabled={loading}
                        >
                          <option value="">Select KRA Master</option>
                          {masterOptions.map((option) => (
                            <option key={option.id} value={option.id}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        {errors.KRA_ID && (
                          <div className="invalid-feedback">{errors.KRA_ID}</div>
                        )}
                      </div>
                    </div>

                    <div className="col-lg-4 col-md-6">
                      <div className="mb-3">
                        <label className="form-label">
                        KRA Activity
                        <span className="text-danger ms-1">*</span>
                      </label>
                        <input
                          type="text"
                          className={`form-control ${errors.ACTT_DESC ? "is-invalid" : ""}`}
                          value={formData.ACTT_DESC}
                          onChange={(e) => handleFieldChange("ACTT_DESC", e.target.value)}
                        />
                        {errors.ACTT_DESC && (
                          <div className="invalid-feedback">{errors.ACTT_DESC}</div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-end mb-3">
                    <button
                      type="button"
                      className="btn btn-secondary me-2"
                      onClick={resetForm}
                    >
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
                    <div className="p-4 text-center text-muted">
                      No data found
                    </div>
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

export default KRAActivity;
