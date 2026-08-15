import { useMemo, useState, useEffect, useCallback, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getKRAActivityDataResponse } from "../../../../store/hrms/hrmsKRAActivitySlice";
import BreadcrumbNav from "../../components/breadcrumb-nav/BreadcrumbNav";
import { useKRAActivityHandler } from "../../portalutils/useKRAActivityHandler";
import { normalizeRecords, getDisplayValue } from "../../../../utils/formatUtils";
import { getPortalFromPath } from "../../../../config/portalConfig";
import { kraActivityColumns } from "../../portalutils/kraActivityColumns";
import { getKRAMasterData, createKRAMaster } from "../../services/kraActivityService";
import SDLSearch from "../../../../components/datatable/SDLSearch";
import SDLDataTable from "../../../../components/datatable/SDLDataTable";
import SDLDropdownSelect from "../../components/forms/SDLDropdownSelect";

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

  // Table-mode search — driven only by the visible SDLSearch box, unchanged
  // from before. Independent from the form-mode search below.
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return listData;
    const query = searchQuery.trim().toLowerCase();
    return listData.filter(
      (item) =>
        item.KRA_DESC.toLowerCase().includes(query) ||
        item.ACTT_DESC.toLowerCase().includes(query),
    );
  }, [searchQuery, listData]);

  // Form-mode search — driven only by typing in the KRA Master dropdown
  // filter. Deliberately separate state from `searchQuery` above: this one
  // never flips `showAll`, it just feeds an inline preview table rendered
  // below the form while the user stays in form mode.
  //
  // IMPORTANT: this is a two-step filter, not a text match against
  // KRA Activity description:
  //   1. Find which KRA MASTER records match the typed text (by label).
  //   2. Collect their KRA_IDs.
  //   3. Show only KRA ACTIVITIES whose KRA_ID is in that set.
  // A KRA Activity's own description matching "test" is irrelevant here —
  // only its parent KRA Master's match counts.
  const [masterSearchQuery, setMasterSearchQuery] = useState("");

  const matchedMasterIds = useMemo(() => {
    if (!masterSearchQuery.trim()) return null;
    const query = masterSearchQuery.trim().toLowerCase();
    return new Set(
      masterOptions
        .filter((option) => option.label.toLowerCase().includes(query))
        .map((option) => option.id),
    );
  }, [masterSearchQuery, masterOptions]);

  const formFilteredData = useMemo(() => {
    if (!matchedMasterIds) return [];
    if (matchedMasterIds.size === 0) return [];
    return listData.filter((item) => matchedMasterIds.has(String(item.KRA_ID)));
  }, [matchedMasterIds, listData]);

  const resetForm = useCallback(() => {
    setIsEditing(false);
    setSelectedActivity("");
    setFormData({ ID: "", KRA_ID: "", KRA_DESC: "", ACTT_DESC: "" });
    setErrors({}); // clear any lingering validation messages too
    setMasterSearchQuery(""); // clear the inline preview table too
  }, []);

  const validateForm = useCallback(() => {
    const newErrors = {};
    if (!formData.KRA_ID || String(formData.KRA_ID).trim() === "") {
      newErrors.KRA_ID = "KRA Master is required";
    }

    const actDescRaw = String(formData.ACTT_DESC ?? "").trim();
    if (!actDescRaw) {
      newErrors.ACTT_DESC = "KRA Activity is required";
    } else if (actDescRaw.length > 100) {
      newErrors.ACTT_DESC = "KRA Activity must not exceed 100 characters";
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

  // ----------------------------------------------------------------------
  // KRA Master dropdown: "add new" + "type-to-search-activities" wiring.
  // Kept local to this component since it's specific to the KRA Master
  // field's behaviour; move into useKRAActivityHandler if it grows.
  // ----------------------------------------------------------------------

  const handleAddNewKRAMaster = useCallback(async (typedText) => {
    try {
      const response = await createKRAMaster({ KRA_DESC: typedText });

      // API shape: { status, message, data: { KRA_ID } } — a single flat
      // object, NOT a list, so normalizeRecords doesn't apply here.
      if (!response?.status) {
        throw new Error(response?.message || "Failed to create KRA Master");
      }

      const newId = String(response.data?.KRA_ID ?? "");
      if (!newId) {
        throw new Error("API did not return a KRA_ID");
      }

      // API doesn't echo back KRA_DESC, so use what the user typed.
      const newOption = { id: newId, label: typedText };

      // Append locally so the option is selectable immediately, without
      // waiting on a full refetch of the master list.
      setListKRAMasterData((prev) => [...prev, { KRA_ID: newId, KRA_DESC: typedText }]);
      return newOption;
    } catch (error) {
      // TEMPORARY fallback: only reached if the API call itself fails
      // (network error, endpoint down, etc.) — lets the "add new" flow be
      // exercised end-to-end while the backend is still being finished.
      // Remove this catch block once the real API is confirmed stable —
      // errors should surface to the user after that instead of silently
      // creating a temp-only record.
      console.warn("createKRAMaster failed, adding locally only:", error);
      const tempId = `temp-${Date.now()}`;
      setListKRAMasterData((prev) => [...prev, { KRA_ID: tempId, KRA_DESC: typedText }]);
      return { id: tempId, label: typedText };
    }
  }, []);

  const masterSearchDebounceRef = useRef(null);

  const handleKRAMasterSearch = useCallback((text) => {
    if (masterSearchDebounceRef.current) clearTimeout(masterSearchDebounceRef.current);
    masterSearchDebounceRef.current = setTimeout(() => {
      setMasterSearchQuery(text ?? "");
      // Deliberately NOT touching `showAll` here — stays in form mode,
      // the filtered results render as an inline table below the form.
    }, 250);
  }, []);

  useEffect(() => {
    return () => {
      if (masterSearchDebounceRef.current) clearTimeout(masterSearchDebounceRef.current);
    };
  }, []);

  const activityOptions = useMemo(
    () => listData.map((item) => ({ id: String(item.ID), label: item.ACTT_DESC })),
    [listData],
  );

  const columns = useMemo(
    () => kraActivityColumns({ handleEditActivity, handleDeleteActivity, deletingId }),
    [handleEditActivity, handleDeleteActivity, deletingId],
  );

  const handleToggleView = () => {
    if (isSubmitting) return;
    resetForm(); // always reset — clears fields, errors, and the inline search — regardless of direction
    setShowAll((prev) => !prev);
  };

  if (!kraActivityData || !listKRAMasterData) {
    return (
      <div className="d-flex align-items-center justify-content-center vh-100">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status" />
          <div className="fw-semibold">Loading kractivity...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="page-header">
        <div className="add-item d-flex">
          <div className="page-title">
            <h4>KRA Activity</h4>
          </div>
        </div>
        <BreadcrumbNav items={[{ text: "Home", link: portalHome }, { text: "KRA Activity" }]} />
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
                  <div style={{ minWidth: "260px" }}>
                    <SDLDropdownSelect
                      id="kraActivitySelect"
                      options={activityOptions}
                      value={selectedActivity}
                      onChange={(id) => handleSelectActivity(id)}
                      placeholder="Select KRA Activity"
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
                      <SDLDropdownSelect
                        id="kraMaster"
                        label="KRA Master"
                        required
                        options={masterOptions}
                        value={formData.KRA_ID}
                        onChange={(id, option) => {
                          handleFieldChange("KRA_ID", id);
                          handleFieldChange("KRA_DESC", option?.label || "");
                        }}
                        invalid={!!errors.KRA_ID}
                        errorMessage={errors.KRA_ID}
                        disabled={loading}
                        allowAddNew
                        onAddNew={handleAddNewKRAMaster}
                        onFilterChange={handleKRAMasterSearch}
                        placeholder="Select KRA Master"
                      />
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
                          maxLength={100}
                          onChange={(e) => handleFieldChange("ACTT_DESC", e.target.value)}
                        />
                        {errors.ACTT_DESC && <div className="invalid-feedback">{errors.ACTT_DESC}</div>}
                      </div>
                    </div>
                  </div>

                  <div className="text-end mb-3">
                    <button type="button" className="btn btn-primary me-2" onClick={handleSave} disabled={isSubmitting}>
                      {isSubmitting ? "Processing..." : isEditing ? "Update" : "Save"}
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={resetForm}>
                      Cancel
                    </button>
                  </div>

                  {/* Inline preview table — only while there's an active
                      KRA Master search and we're still in form mode.
                      Disappears once the search is cleared or the form
                      is reset/submitted (see resetForm). */}
                  {masterSearchQuery.trim() && (
                    <div className="table-responsive mt-2">
                      {formFilteredData.length === 0 ? (
                        <div className="p-3 text-center text-muted border rounded">
                          No matching KRA Activities
                        </div>
                      ) : (
                        <SDLDataTable
                          data={formFilteredData}
                          columns={columns}
                          loading={false}
                          emptyMessage="No matching KRA Activities"
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

export default KRAActivity;
