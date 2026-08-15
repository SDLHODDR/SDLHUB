import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import BreadcrumbNav from "../../components/breadcrumb-nav/BreadcrumbNav";
import { getPortalFromPath } from "../../../../config/portalConfig";
import SDLSearch from "../../../../components/datatable/SDLSearch";
import SDLDataTable from "../../../../components/datatable/SDLDataTable";
import SDLDropdownSelect from "../../components/forms/SDLDropdownSelect";
import { getCapabilitiesDataResponse } from "../../../../store/hrms/hrmsCapabilitiesSlice";
import { normalizeRecords, getDisplayValue } from "../../../../utils/formatUtils";
import { capabilitiesColumns } from "../../portalutils/capabilitiesColumns";
import { useCapabilitiesHandler } from "../../portalutils/useCapabilitiesHandler";

const Capabilities = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const portal = getPortalFromPath(location.pathname);
  const portalHome = `/${portal.key}/dashboard`;

  const capabilitiesData = useSelector((state) => state.hrmscapabilitiesData?.data);
  const loading = useSelector((state) => state.hrmscapabilitiesData?.loading) || false;

  const [searchQuery, setSearchQuery] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [selectedCapability, setSelectedCapability] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    CAPA_ID: "",
    CAPA_CODE: "",
    CAPA_DESC: "",
  });

  useEffect(() => {
    dispatch(getCapabilitiesDataResponse());
  }, [dispatch]);

  const list = useMemo(() => {
    return normalizeRecords(capabilitiesData).map((item, index) => ({
      CAPA_ID: item.CAPA_ID ?? item.ID ?? item.id ?? index,
      CAPA_CODE_DISPLAY: getDisplayValue(item, ["CAPA_CODE", "code", "CODE"], ""),
      CAPA_DESC_DISPLAY: getDisplayValue(item, ["CAPA_DESC", "description", "DESCR"], ""),
    }));
  }, [capabilitiesData]);

  // There's no separate "Capabilities Master" table — a capability's CODE
  // effectively IS the master, so the option list is just the distinct
  // codes already present in `list`. That also means "add new master if
  // not available" needs no backend round-trip here: a new code becomes
  // real the moment the whole Capability record is saved via handleSave.
  const capabilityOptions = useMemo(() => {
    const uniqueCodes = [...new Set(list.map((item) => item.CAPA_CODE_DISPLAY))]
      .filter(Boolean)
      .sort();

    return uniqueCodes.map((code) => ({ id: String(code), label: String(code) }));
  }, [list]);

  // Table-mode search — driven only by the visible SDLSearch box.
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return list;

    const query = searchQuery.trim().toLowerCase();
    return list.filter(
      (item) =>
        item.CAPA_CODE_DISPLAY.toLowerCase().includes(query) ||
        item.CAPA_DESC_DISPLAY.toLowerCase().includes(query),
    );
  }, [searchQuery, list]);

  // Form-mode search — driven by typing in the Capabilities Code dropdown.
  // Two-step, same pattern as KRA/Department Master:
  //   1. Find which CODES match the typed text.
  //   2. Show records whose CAPA_CODE_DISPLAY is in that set.
  // (No second dimension like Department Activity's Type here.)
  const [codeSearchQuery, setCodeSearchQuery] = useState("");

  const matchedCodes = useMemo(() => {
    if (!codeSearchQuery.trim()) return null;
    const query = codeSearchQuery.trim().toLowerCase();
    return new Set(
      capabilityOptions
        .filter((option) => option.label.toLowerCase().includes(query))
        .map((option) => option.id),
    );
  }, [codeSearchQuery, capabilityOptions]);

  const formFilteredData = useMemo(() => {
    if (!matchedCodes) return [];
    if (matchedCodes.size === 0) return [];
    return list.filter((item) => matchedCodes.has(item.CAPA_CODE_DISPLAY));
  }, [matchedCodes, list]);

  const resetForm = useCallback(() => {
    setIsEditing(false);
    setSelectedCapability("");
    setFormData({ CAPA_ID: "", CAPA_CODE: "", CAPA_DESC: "" });
    setErrors({});
    setCodeSearchQuery(""); // clear the inline preview table too
  }, []);

  const {
    handleFieldChange,
    handleSave,
    handleEdit,
    handleSelectCapability,
  } = useCapabilitiesHandler({
    formData,
    setFormData,
    setErrors,
    setIsSubmitting,
    dispatch,
    getCapabilitiesDataResponse,
    setShowAll,
    setSelectedCapability,
    setIsEditing,
    resetForm,
    list,
  });

  // "Add new" for Capabilities Code — no API call needed, since there's no
  // separate master table to insert into ahead of time. The typed code
  // just becomes the form's CAPA_CODE; it's persisted for real when the
  // Capability record itself is saved via handleSave.
  const handleAddNewCapabilityCode = useCallback(async (typedText) => {
    return { id: typedText, label: typedText };
  }, []);

  const codeSearchDebounceRef = useRef(null);

  const handleCapabilityCodeSearch = useCallback((text) => {
    if (codeSearchDebounceRef.current) clearTimeout(codeSearchDebounceRef.current);
    codeSearchDebounceRef.current = setTimeout(() => {
      setCodeSearchQuery(text ?? "");
      // Deliberately NOT touching `showAll` — stays in form mode, results
      // render as an inline table below the form.
    }, 250);
  }, []);

  useEffect(() => {
    return () => {
      if (codeSearchDebounceRef.current) clearTimeout(codeSearchDebounceRef.current);
    };
  }, []);

  const handleToggleView = useCallback(() => {
    if (showAll) {
      resetForm();
      setShowAll(false);
    } else {
      resetForm();
      setShowAll(true);
    }
  }, [showAll, resetForm]);

  const columns = useMemo(
    () => capabilitiesColumns({ handleEdit }),
    [handleEdit],
  );

  return (
    <>
      <div className="page-header">
        <div className="add-item d-flex">
          <div className="page-title">
            <h4>Capabilities</h4>
          </div>
        </div>

        <BreadcrumbNav
          items={[
            { text: "Home", link: portalHome },
            { text: "Capabilities" },
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
                        placeholder="Search capabilities..."
                        className="mb-0"
                        style={{ width: "100%" }}
                      />
                    </div>
                  )}
                </div>

                {/* Keyword-searchable "Select Capabilities", same pattern
                    as the top selectors in KRAActivity / DepartmentActivity
                    — toggle button kept as its own explicit sibling,
                    matching this file's original icon+label style. */}
                <div className="d-flex align-items-center gap-2">
                  <div style={{ minWidth: "260px" }}>
                    <SDLDropdownSelect
                      id="capabilitySelect"
                      options={capabilityOptions}
                      value={selectedCapability}
                      onChange={(id) => handleSelectCapability(id)}
                      placeholder="Select Capabilities"
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
                    {/* {showAll ? "Form" : "Table"} */}
                  </button>
                </div>
              </div>

              {!showAll ? (
                <>
                  <div className="row mb-3">
                    <div className="col-lg-4">
                      {/* Capabilities Code — searchable + creatable, same
                          pattern as KRA Master / Department Master. Always
                          searchable now regardless of isEditing: selecting
                          an existing code behaves like the old edit-mode
                          <select>, typing a new one behaves like the old
                          add-mode free-text <input>. */}
                      <SDLDropdownSelect
                        id="capaCode"
                        label="Capabilities Code"
                        options={capabilityOptions}
                        value={formData.CAPA_CODE}
                        onChange={(id) => handleFieldChange("CAPA_CODE", id)}
                        invalid={!!errors.CAPA_CODE}
                        errorMessage={errors.CAPA_CODE}
                        allowAddNew
                        onAddNew={handleAddNewCapabilityCode}
                        onFilterChange={handleCapabilityCodeSearch}
                        placeholder={isEditing ? "Please Select" : "Enter new capability code"}
                      />
                    </div>

                    <div className="col-lg-6">
                      <label className="form-label">Description</label>
                      <input
                        type="text"
                        className={`form-control ${errors.CAPA_DESC ? "is-invalid" : ""}`}
                        value={formData.CAPA_DESC}
                        onChange={(e) => handleFieldChange("CAPA_DESC", e.target.value)}
                        maxLength="500"
                      />
                      {errors.CAPA_DESC && <div className="invalid-feedback">{errors.CAPA_DESC}</div>}
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
                      Capabilities Code search and we're still in form
                      mode. Disappears once the search is cleared or the
                      form is reset/submitted (see resetForm). */}
                  {codeSearchQuery.trim() && (
                    <div className="table-responsive mt-2">
                      {formFilteredData.length === 0 ? (
                        <div className="p-3 text-center text-muted border rounded">
                          No matching capabilities
                        </div>
                      ) : (
                        <SDLDataTable
                          data={formFilteredData}
                          columns={columns}
                          loading={false}
                          emptyMessage="No matching capabilities"
                          removableSort
                        />
                      )}
                    </div>
                  )}
                </>
              ) : (
                <>
                  {filteredData.length === 0 ? (
                    <div className="p-4 text-center text-muted">No records found</div>
                  ) : (
                    <div className="table-responsive">
                      <SDLDataTable data={filteredData} columns={columns} loading={loading} />
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

export default Capabilities;
