import { useMemo, useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getKRAActivityDataResponse } from "../../../../store/hrms/hrmsKRAActivitySlice";
import BreadcrumbNav from "../../components/breadcrumb-nav/BreadcrumbNav";
import { useKRAActivityHandler } from "../../portalutils/useKRAActivityHandler";
import { normalizeRecords, getDisplayValue } from "../../../../utils/formatUtils";
import { getPortalFromPath } from "../../../../config/portalConfig";
import { kraActivityColumns } from "../../portalutils/kraActivityColumns";
import { getKRAMasterData } from "../../services/kraActivityService";
import SDLSearch from "../../../../components/datatable/SDLSearch";
import SDLDataTable from "../../../../components/datatable/SDLDataTable";

const KRAActivity = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const portal = getPortalFromPath(location.pathname);
  const portalHome = `/${portal.key}/dashboard`;

  const [loading, setLoading] = useState(false);
  const [listKRAMasterData, setListKRAMasterData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    ID: "",
    KRA_ID: "",
    KRA_DESC: "",
    ACTT_DESC: "",
  });

  const kraActivityData = useSelector((state) => state.hrmsKRAAcivityData?.data);

  useEffect(() => {
    dispatch(getKRAActivityDataResponse());
  }, [dispatch]);

  const fetchKRAMasterData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getKRAMasterData();
      setListKRAMasterData(normalizeRecords(response));
    } catch (error) {
      console.error("Error fetching KRA Master Data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKRAMasterData();
  }, [fetchKRAMasterData]);

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
      const label = getDisplayValue(
        item,
        ["KRA_DESC", "kra_desc", "KRA_MASTER_DESC", "name", "label", "ACTT_DESC"],
        "-",
      );
      return { id: String(id), label: String(label) };
    });
  }, [listKRAMasterData]);

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return listData;
    const query = searchQuery.trim().toLowerCase();
    return listData.filter(
      (item) =>
        item.KRA_DESC.toLowerCase().includes(query) ||
        item.ACTT_DESC.toLowerCase().includes(query),
    );
  }, [searchQuery, listData]);

  const resetForm = useCallback(() => {
    setIsEditing(false);
    setSelectedActivity("");
    setFormData({ ID: "", KRA_ID: "", KRA_DESC: "", ACTT_DESC: "" });
  }, []);

  const validateForm = useCallback(() => {
    const newErrors = {};
    if (!formData.KRA_ID || String(formData.KRA_ID).trim() === "") {
      newErrors.KRA_ID = "KRA Master is required";
    }
    if (!formData.ACTT_DESC || String(formData.ACTT_DESC).trim() === "") {
      newErrors.ACTT_DESC = "KRA Activity is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const {
    handleFieldChange,
    handleSave,
    handleSelectActivity,
    handleEditActivity,
    handleDeleteActivity,
  } = useKRAActivityHandler({
    formData,
    setFormData,
    setErrors,
    validateForm,
    setIsSubmitting,
    setDeletingId,
    dispatch,
    getKRAActivityDataResponse,
    listData,
    setSelectedActivity,
    setIsEditing,
    setShowAll,
    resetForm,
  });

  const columns = useMemo(
    () => kraActivityColumns({ handleEditActivity, handleDeleteActivity, deletingId }),
    [handleEditActivity, handleDeleteActivity, deletingId],
  );

  return (
    <>
      <div className="page-header">
        <div className="add-item d-flex">
          <div className="page-title"><h4>KRA Activity</h4></div>
        </div>
        <BreadcrumbNav
          items={[{ text: "Home", link: portalHome }, { text: "KRA Activity" }]}
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
                      <option key={item.ID} value={item.ID}>{item.ACTT_DESC}</option>
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
                          KRA Master<span className="text-danger ms-1">*</span>
                        </label>
                        <select
                          className={`form-select ${errors.KRA_ID ? "is-invalid" : ""}`}
                          value={formData.KRA_ID}
                          onChange={(e) => {
                            const selectedMaster = masterOptions.find((option) => option.id === e.target.value);
                            handleFieldChange("KRA_ID", e.target.value);
                            handleFieldChange("KRA_DESC", selectedMaster?.label || "");
                          }}
                          disabled={loading}
                        >
                          <option value="">Select KRA Master</option>
                          {masterOptions.map((option) => (
                            <option key={option.id} value={option.id}>{option.label}</option>
                          ))}
                        </select>
                        {errors.KRA_ID && <div className="invalid-feedback">{errors.KRA_ID}</div>}
                      </div>
                    </div>

                    <div className="col-lg-4 col-md-6">
                      <div className="mb-3">
                        <label className="form-label">
                          KRA Activity<span className="text-danger ms-1">*</span>
                        </label>
                        <input
                          type="text"
                          className={`form-control ${errors.ACTT_DESC ? "is-invalid" : ""}`}
                          value={formData.ACTT_DESC}
                          onChange={(e) => handleFieldChange("ACTT_DESC", e.target.value)}
                        />
                        {errors.ACTT_DESC && <div className="invalid-feedback">{errors.ACTT_DESC}</div>}
                      </div>
                    </div>
                  </div>

                  <div className="text-end mb-3">
                    <button type="button" className="btn btn-secondary me-2" onClick={resetForm}>Cancel</button>
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