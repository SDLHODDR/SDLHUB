import { useEffect, useMemo, useState } from "react";
import Select from "react-select";

import BreadcrumbNav from "../../components/breadcrumb-nav/BreadcrumbNav";

import {
  getDivisionDocumentMappingInitialData,
  getDivisionDocumentMappingDesignations,
  getDivisionDocumentMappingData,
  saveDivisionDocumentMapping,
} from "../../services/divisionDocumentMappingService";

import { notifyError, notifySuccess } from "../../../../services/alertService";

import { getPortalFromPath } from "../../../../config/portalConfig";

import "../../assets/divisionDocumentMapping.css";

const DivisionDocumentMapping = () => {
  /* ==========================================================
     PORTAL
  ========================================================== */

  const portal = getPortalFromPath(location.pathname);

  const portalHome = `/${portal.key}/dashboard`;

  /* ==========================================================
     DROPDOWN DATA
  ========================================================== */

  const [companies, setCompanies] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);

  const [documents, setDocuments] = useState([]);
  const [orgLocations, setOrgLocations] = useState([]);

  /* ==========================================================
     SELECTED VALUES
  ========================================================== */

  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedDivision, setSelectedDivision] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState(null);

  /*
   * SINGLE DESIGNATION
   *
   * Previously:
   *
   * const [selectedDesignations, setSelectedDesignations] = useState([]);
   *
   * Now:
   */
  const [selectedDesignation, setSelectedDesignation] = useState(null);

  /* ==========================================================
     DOCUMENT MAPPING
  ========================================================== */

  const [documentMappings, setDocumentMappings] = useState({});

  /* ==========================================================
     LOADING
  ========================================================== */

  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingDesignations, setLoadingDesignations] = useState(false);
  const [loadingData, setLoadingData] = useState(false);

  /* ==========================================================
     SHOW DATA STATE
  ========================================================== */

  const [showData, setShowData] = useState(false);

  /* ==========================================================
     SAVE STATE
  ========================================================== */

  const [saving, setSaving] = useState(false);

  /* ==========================================================
     SELECT OPTIONS
  ========================================================== */

  const companyOptions = useMemo(
    () =>
      companies.map((item) => ({
        value: String(item.ID),
        label: item.DESCRIPTION,
      })),
    [companies],
  );

  const divisionOptions = useMemo(
    () =>
      divisions.map((item) => ({
        value: String(item.ID),
        label: item.DESCRIPTION,
      })),
    [divisions],
  );

  const departmentOptions = useMemo(
    () =>
      departments.map((item) => ({
        value: String(item.ID),
        label: item.DESCRIPTION,
      })),
    [departments],
  );

  const designationOptions = useMemo(
    () =>
      designations.map((item) => ({
        value: String(item.ID),
        label: item.DESCRIPTION,
      })),
    [designations],
  );

  const orgLocationOptions = useMemo(
    () =>
      orgLocations.map((item) => ({
        value: String(item.ID),
        label: item.DESCRIPTION,
      })),
    [orgLocations],
  );

  /* ==========================================================
     COMMON SELECT STYLES
  ========================================================== */

  const selectStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: "38px",
      height: "38px",
      borderColor: state.isFocused ? "#ff9800" : "#ced4da",
      boxShadow: state.isFocused
        ? "0 0 0 0.15rem rgba(255, 152, 0, 0.15)"
        : "none",
      fontSize: "13px",
      borderRadius: "4px",
    }),

    valueContainer: (base) => ({
      ...base,
      padding: "2px 8px",
    }),

    input: (base) => ({
      ...base,
      fontSize: "13px",
    }),

    singleValue: (base) => ({
      ...base,
      fontSize: "13px",
    }),

    placeholder: (base) => ({
      ...base,
      fontSize: "13px",
      color: "#6c757d",
    }),

    menu: (base) => ({
      ...base,
      zIndex: 9999,
      fontSize: "13px",
    }),

    option: (base, state) => ({
      ...base,
      fontSize: "13px",
      backgroundColor: state.isSelected
        ? "#ff9800"
        : state.isFocused
          ? "#fff3e0"
          : "#fff",
      color: state.isSelected ? "#fff" : "#212529",
    }),
  };

  /* ==========================================================
     LOAD INITIAL DATA
  ========================================================== */

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoadingInitial(true);

        const res = await getDivisionDocumentMappingInitialData();

        if (!res?.status) {
          notifyError(res?.message || "Unable to load dropdown data.");
          return;
        }

        setCompanies(
          Array.isArray(res?.data?.companies) ? res.data.companies : [],
        );

        setDivisions(
          Array.isArray(res?.data?.divisions) ? res.data.divisions : [],
        );

        setDepartments(
          Array.isArray(res?.data?.departments) ? res.data.departments : [],
        );
      } catch (error) {
        console.error("Division document mapping initial data error:", error);

        notifyError(error?.message || "Unable to load dropdown data.");
      } finally {
        setLoadingInitial(false);
      }
    };

    loadInitialData();
  }, []);

  /* ==========================================================
     LOAD DESIGNATIONS
  ========================================================== */

  useEffect(() => {
    const loadDesignations = async () => {
      setDesignations([]);
      setSelectedDesignation(null);

      setShowData(false);
      setDocuments([]);
      setDocumentMappings({});

      if (!selectedDivision?.value || !selectedDepartment?.value) {
        return;
      }

      try {
        setLoadingDesignations(true);

        const res = await getDivisionDocumentMappingDesignations({
          divisionId: selectedDivision.value,
          departmentId: selectedDepartment.value,
        });

        if (!res?.status) {
          notifyError(res?.message || "Unable to load designations.");
          return;
        }

        setDesignations(
          Array.isArray(res?.data?.designations) ? res.data.designations : [],
        );
      } catch (error) {
        console.error("Designation loading error:", error);

        notifyError(error?.message || "Unable to load designations.");
      } finally {
        setLoadingDesignations(false);
      }
    };

    loadDesignations();
  }, [selectedDivision?.value, selectedDepartment?.value]);

  /* ==========================================================
     COMPANY CHANGE
  ========================================================== */

  const handleCompanyChange = (value) => {
    setSelectedCompany(value);

    setShowData(false);
    setDocuments([]);
    setDocumentMappings({});
  };

  /* ==========================================================
     DIVISION CHANGE
  ========================================================== */

  const handleDivisionChange = (value) => {
    setSelectedDivision(value);

    setSelectedDepartment(null);
    setSelectedDesignation(null);

    setDesignations([]);

    setShowData(false);
    setDocuments([]);
    setDocumentMappings({});
  };

  /* ==========================================================
     DEPARTMENT CHANGE
  ========================================================== */

  const handleDepartmentChange = (value) => {
    setSelectedDepartment(value);

    setSelectedDesignation(null);

    setShowData(false);
    setDocuments([]);
    setDocumentMappings({});
  };

  /* ==========================================================
     DESIGNATION CHANGE
  ========================================================== */

  const handleDesignationChange = (value) => {
    setSelectedDesignation(value);

    setShowData(false);
    setDocuments([]);
    setDocumentMappings({});
  };

  /* ==========================================================
     SHOW DATA
  ========================================================== */

  const handleShowData = async () => {
    if (!selectedCompany?.value) {
      notifyError("Please select Company.");
      return;
    }

    if (!selectedDivision?.value) {
      notifyError("Please select Division.");
      return;
    }

    if (!selectedDepartment?.value) {
      notifyError("Please select Department.");
      return;
    }

    if (!selectedDesignation?.value) {
      notifyError("Please select Designation.");
      return;
    }

    try {
      setLoadingData(true);

      const res = await getDivisionDocumentMappingData({
        companyId: selectedCompany.value,
        divisionId: selectedDivision.value,
        departmentId: selectedDepartment.value,
        designationId: selectedDesignation.value,
      });

      if (!res?.status) {
        notifyError(res?.message || "Unable to load document data.");
        return;
      }

      const loadedDocuments = Array.isArray(res?.data?.documents)
        ? res.data.documents
        : [];

      const loadedOrgLocations = Array.isArray(res?.data?.orgLocations)
        ? res.data.orgLocations
        : [];

      setDocuments(loadedDocuments);
      setOrgLocations(loadedOrgLocations);

      /* ==================================================
         SET CURRENT MAPPINGS
      ================================================== */

      const mappings = {};

      loadedDocuments.forEach((doc) => {
        if (
          doc.ORG_LOC_ID !== null &&
          doc.ORG_LOC_ID !== undefined &&
          doc.ORG_LOC_ID !== ""
        ) {
          const location = loadedOrgLocations.find(
            (item) => String(item.ID) === String(doc.ORG_LOC_ID),
          );

          mappings[String(doc.ID)] = {
            value: String(doc.ORG_LOC_ID),
            label: location?.DESCRIPTION || "",
          };
        }
      });

      setDocumentMappings(mappings);

      setShowData(true);
    } catch (error) {
      console.error("Division document mapping data error:", error);

      notifyError(error?.message || "Unable to load document data.");
    } finally {
      setLoadingData(false);
    }
  };

  /* ==========================================================
     DOCUMENT LOCATION CHANGE
  ========================================================== */

  const handleLocationChange = (documentId, value) => {
    setDocumentMappings((prev) => ({
      ...prev,
      [String(documentId)]: value,
    }));
  };

  /* ==========================================================
     SAVE
  ========================================================== */

  const handleSave = async () => {
    /* ========================================================
       VALIDATION
    ======================================================== */

    if (!selectedCompany?.value) {
      notifyError("Please select Company.");
      return;
    }

    if (!selectedDivision?.value) {
      notifyError("Please select Division.");
      return;
    }

    if (!selectedDepartment?.value) {
      notifyError("Please select Department.");
      return;
    }

    if (!selectedDesignation?.value) {
      notifyError("Please select Designation.");
      return;
    }

    if (!documents.length) {
      notifyError("No document data available to save.");
      return;
    }

    /* ========================================================
       VALIDATE ALL DOCUMENT MAPPINGS
    ======================================================== */

    const missingDocument = documents.find(
      (document) => !documentMappings[String(document.ID)]?.value,
    );

    if (missingDocument) {
      notifyError(
        `Please select Organization Location for ${missingDocument.ID} - ${missingDocument.DESCRIPTION}.`,
      );

      return;
    }

    /* ========================================================
       PREVENT DOUBLE SUBMIT
    ======================================================== */

    if (saving) {
      return;
    }

    try {
      setSaving(true);

      /* ======================================================
         CONVERT REACT-SELECT VALUES

         Example:

         {
           "1": "35",
           "2": "35",
           "3": "36"
         }
      ====================================================== */

      const mappings = {};

      documents.forEach((document) => {
        const documentId = String(document.ID);

        const selectedLocation = documentMappings[documentId];

        if (selectedLocation?.value) {
          mappings[documentId] = String(selectedLocation.value);
        }
      });

      /* ======================================================
         API CALL
      ====================================================== */

      const res = await saveDivisionDocumentMapping({
        companyId: selectedCompany.value,
        divisionId: selectedDivision.value,
        departmentId: selectedDepartment.value,

        /*
         * SINGLE DESIGNATION
         */
        designationId: String(selectedDesignation.value),

        documentMappings: mappings,
      });

      /* ======================================================
         SUCCESS
      ====================================================== */

      if (res?.status) {
        notifySuccess(
          res.message || "Division document mapping saved successfully.",
        );

        /*
         * Reload from DB.
         */
        await handleShowData();
      } else {
        notifyError(
          res?.message || "Unable to save division document mapping.",
        );
      }
    } catch (error) {
      console.error("Save division document mapping error:", error);

      notifyError(
        error?.message || "Unable to save division document mapping.",
      );
    } finally {
      setSaving(false);
    }
  };

  /* ==========================================================
     CANCEL
  ========================================================== */

  const handleCancel = () => {
    setSelectedCompany(null);
    setSelectedDivision(null);
    setSelectedDepartment(null);
    setSelectedDesignation(null);

    setDesignations([]);
    setDocuments([]);
    setOrgLocations([]);

    setDocumentMappings({});

    setShowData(false);
  };

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <>
      {/* ======================================================
          PAGE HEADER
      ====================================================== */}

      <div className="page-header">
        <div className="page-title">
          <h4>Division Document Mapping</h4>
        </div>

        <BreadcrumbNav
          items={[
            {
              text: "Home",
              link: portalHome,
            },
            {
              text: "Division Document Mapping",
            },
          ]}
        />
      </div>

      {/* ======================================================
          MAIN CARD
      ====================================================== */}

      <div className="card ddm-card">
        <div className="card-body">
          {/* ==================================================
              FILTER SECTION
          ================================================== */}

          <div className="row g-3">
            {/* COMPANY */}

            <div className="col-lg-3 col-md-6">
              <label className="ddm-label">
                Company
                <span className="text-danger">*</span>
              </label>

              <Select
                value={selectedCompany}
                options={companyOptions}
                onChange={handleCompanyChange}
                placeholder="Please Select"
                isClearable
                isLoading={loadingInitial}
                styles={selectStyles}
                isDisabled={loadingInitial}
              />
            </div>

            {/* DIVISION */}

            <div className="col-lg-3 col-md-6">
              <label className="ddm-label">
                Division
                <span className="text-danger">*</span>
              </label>

              <Select
                value={selectedDivision}
                options={divisionOptions}
                onChange={handleDivisionChange}
                placeholder="Please Select"
                isClearable
                isLoading={loadingInitial}
                styles={selectStyles}
                isDisabled={loadingInitial}
              />
            </div>

            {/* DEPARTMENT */}

            <div className="col-lg-3 col-md-6">
              <label className="ddm-label">
                Department
                <span className="text-danger">*</span>
              </label>

              <Select
                value={selectedDepartment}
                options={departmentOptions}
                onChange={handleDepartmentChange}
                placeholder="Please Select"
                isClearable
                isLoading={loadingInitial}
                styles={selectStyles}
                isDisabled={loadingInitial || !selectedDivision}
              />
            </div>

            {/* DESIGNATION */}

            <div className="col-lg-3 col-md-6">
              <label className="ddm-label">
                Designation
                <span className="text-danger">*</span>
              </label>

              <Select
                value={selectedDesignation}
                options={designationOptions}
                onChange={(value) => {
                  setSelectedDesignation(value);

                  setShowData(false);
                  setDocuments([]);
                  setDocumentMappings({});
                }}
                placeholder={
                  loadingDesignations ? "Loading..." : "Please Select"
                }
                isLoading={loadingDesignations}
                isDisabled={
                  loadingDesignations ||
                  !selectedDivision ||
                  !selectedDepartment
                }
                isClearable
                styles={selectStyles}
              />
            </div>
          </div>

          {/* ==================================================
              SHOW DATA
          ================================================== */}

          <div className="text-center mt-3 mb-3">
            <button
              type="button"
              className="btn btn-sm btn-primary ddm-show-btn"
              onClick={handleShowData}
              disabled={loadingData || loadingInitial || loadingDesignations}
            >
              {loadingData ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-1"
                    role="status"
                  />
                  Loading...
                </>
              ) : (
                "Show Data"
              )}
            </button>
          </div>

          {/* ==================================================
              DOCUMENT DATA
          ================================================== */}

          {showData && (
            <>
              <div className="ddm-document-section">
                {documents.length === 0 ? (
                  <div className="text-center text-muted py-4">
                    No document types found.
                  </div>
                ) : (
                  documents.map((document) => {
                    const documentId = String(document.ID);

                    return (
                      <div
                        className="row align-items-center ddm-document-row"
                        key={documentId}
                      >
                        {/* DOCUMENT */}

                        <div className="col-lg-4 col-md-5">
                          <label className="ddm-document-label">
                            {document.ID} - {document.DESCRIPTION}
                          </label>
                        </div>

                        {/* ORGANIZATION LOCATION */}

                        <div className="col-lg-8 col-md-7">
                          <Select
                            value={documentMappings[documentId] || null}
                            options={orgLocationOptions}
                            onChange={(value) =>
                              handleLocationChange(documentId, value)
                            }
                            placeholder="Please Select"
                            isClearable
                            styles={selectStyles}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* ==================================================
                  ACTIONS
              ================================================== */}

              <div className="text-center ddm-actions">
                <button
                  type="button"
                  className="btn btn-primary me-2"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-1"
                        role="status"
                      />
                      Saving...
                    </>
                  ) : (
                    "Save"
                  )}
                </button>

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default DivisionDocumentMapping;
