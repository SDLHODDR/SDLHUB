import { useMemo, useState, useRef } from "react";

import SDLDataTable from "../../../../components/datatable/SDLDataTable";
import SDLSearch from "../../../../components/datatable/SDLSearch";
import SDLCalendar from "../../../../components/calendar/SDLCalendar";

import {
  saveFamilyMember,
  deleteFamilyMember,
} from "../../../../services/profile/profileService";

import {
  notifySuccess,
  notifyError,
  notifyWarning,
  confirmAction,
} from "../../../../services/alertService";

import {
  PROFILE_MESSAGES,
  FAMILY_DEPENDENT,
} from "../../../../constants/profileMessages";

/* =========================================================
   FAMILY DETAILS TAB
========================================================= */

const FamilyDetailsTab = ({ profile, setProfile }) => {
  /* =========================================================
     PERMISSION
  ========================================================= */

  const canManageFamily = profile?.permissions?.can_manage_family || false;

  /* =========================================================
     EXISTING FAMILY DATA
  ========================================================= */

  const spouse = profile?.spouse || {};
  const children = profile?.children || [];
  const mother = profile?.mother || {};
  const father = profile?.father || {};

  /* =========================================================
     STATE & REFS
  ========================================================= */

  const fileInputRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFamilyForm, setShowFamilyForm] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [familySaving, setFamilySaving] = useState(false);

  const [familyForm, setFamilyForm] = useState({
    id: "",
    name: "",
    relation: "",
    dependent: "",
    dob: "",
    occupation: "",
    aadhaar: "",
  });

  const [documentFile, setDocumentFile] = useState(null);

  const [familyErrors, setFamilyErrors] = useState({
    name: "",
    relation: "",
    document: "",
  });

  /* =========================================================
     PARSE DATE
  ========================================================= */

  const parseFormDate = (value) => {
    if (!value) return null;

    if (value instanceof Date) {
      return isNaN(value.getTime()) ? null : value;
    }

    const valueString = String(value).trim().substring(0, 11);

    /* YYYY-MM-DD */
    let match = valueString.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (match) {
      const year = Number(match[1]);
      const month = Number(match[2]) - 1;
      const day = Number(match[3]);
      const date = new Date(year, month, day);

      if (
        date.getFullYear() === year &&
        date.getMonth() === month &&
        date.getDate() === day
      ) {
        return date;
      }
      return null;
    }

    /* DD/MM/YYYY */
    match = valueString.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (match) {
      const day = Number(match[1]);
      const month = Number(match[2]) - 1;
      const year = Number(match[3]);
      const date = new Date(year, month, day);

      if (
        date.getFullYear() === year &&
        date.getMonth() === month &&
        date.getDate() === day
      ) {
        return date;
      }
      return null;
    }

    /* DD-MM-YYYY */
    match = valueString.match(/^(\d{2})-(\d{2})-(\d{4})$/);
    if (match) {
      const day = Number(match[1]);
      const month = Number(match[2]) - 1;
      const year = Number(match[3]);
      const date = new Date(year, month, day);

      if (
        date.getFullYear() === year &&
        date.getMonth() === month &&
        date.getDate() === day
      ) {
        return date;
      }
      return null;
    }

    /* DD-Mon-YYYY */
    match = valueString.match(/^(\d{2})-([A-Za-z]{3})-(\d{4})$/i);
    if (match) {
      const day = Number(match[1]);
      const monthMap = {
        JAN: 0,
        FEB: 1,
        MAR: 2,
        APR: 3,
        MAY: 4,
        JUN: 5,
        JUL: 6,
        AUG: 7,
        SEP: 8,
        OCT: 9,
        NOV: 10,
        DEC: 11,
      };

      const month = monthMap[match[2].toUpperCase()];
      const year = Number(match[3]);

      if (month === undefined) return null;

      const date = new Date(year, month, day);
      if (
        date.getFullYear() === year &&
        date.getMonth() === month &&
        date.getDate() === day
      ) {
        return date;
      }
      return null;
    }

    return null;
  };

  /* =========================================================
     FORMAT DATE FOR FORM (YYYY-MM-DD)
  ========================================================= */

  const formatDateForForm = (date) => {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
      return "";
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  /* =========================================================
     FORMAT DATE FOR DISPLAY (DD-Mon-YYYY)
  ========================================================= */

  const formatDisplayDate = (value) => {
    if (!value) return "";
    const date = parseFormDate(value);
    if (!date) return value;

    const day = String(date.getDate()).padStart(2, "0");
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
  };

  /* =========================================================
     FAMILY DATA FOR DATATABLE
  ========================================================= */

  const familyData = useMemo(() => {
    const list = [];

    const pushMember = (member, defaultRelation = "") => {
      if (member?.FM_NAME) {
        list.push({
          id: member.ID,
          name: member.FM_NAME,
          relation: member.FM_RELATION || defaultRelation,
          age: member.AGE || "",
          dob: member.DOB || "",
          dependent: member.FM_DEP || "",
          occupation: member.OCCUPATION || member.FM_OCCUPATION || "",
          aadhaar: member.AADHAAR || "",
        });
      }
    };

    pushMember(spouse, "Spouse");
    pushMember(mother, "Mother");
    pushMember(father, "Father");

    children.forEach((child) => {
      pushMember(child, child.FM_RELATION || "Child");
    });

    return list;
  }, [spouse, mother, father, children]);

  /* =========================================================
     SEARCH
  ========================================================= */

  const filteredFamilyData = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return familyData;

    return familyData.filter((item) => {
      return (
        item.name?.toLowerCase().includes(q) ||
        item.relation?.toLowerCase().includes(q) ||
        String(item.age || "").includes(q) ||
        item.dob?.toLowerCase().includes(q) ||
        item.dependent?.toLowerCase().includes(q) ||
        item.occupation?.toLowerCase().includes(q) ||
        item.aadhaar?.includes(q)
      );
    });
  }, [familyData, searchQuery]);

  /* =========================================================
     ADD FAMILY MEMBER MODAL OPEN
  ========================================================= */

  const handleAddFamily = () => {
    if (!canManageFamily) {
      notifyWarning(PROFILE_MESSAGES.FAMILY_UPDATE_CLOSED);
      return;
    }

    setEditingMember(null);
    setDocumentFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";

    setFamilyForm({
      id: "",
      name: "",
      relation: "Wife",
      dependent: FAMILY_DEPENDENT.DEPENDANT,
      dob: "",
      occupation: "",
      aadhaar: "",
    });

    setFamilyErrors({
      name: "",
      relation: "",
      document: "",
    });

    setShowFamilyForm(true);
  };

  /* =========================================================
     EDIT FAMILY MEMBER MODAL OPEN
  ========================================================= */

  const handleEditFamily = (row) => {
    if (!canManageFamily) {
      notifyWarning(PROFILE_MESSAGES.FAMILY_UPDATE_CLOSED);
      return;
    }

    const parsedDate = parseFormDate(row.dob);
    const formattedDOB = parsedDate ? formatDateForForm(parsedDate) : "";

    setEditingMember({
      ...row,
      id: row.id,
    });
    setDocumentFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";

    setFamilyForm({
      id: row.id,
      name: row.name || "",
      relation: row.relation || "",
      dependent: row.dependent || FAMILY_DEPENDENT.DEPENDANT,
      dob: formattedDOB,
      occupation: row.occupation || "",
      aadhaar: row.aadhaar || "",
    });

    setFamilyErrors({
      name: "",
      relation: "",
      document: "",
    });

    setShowFamilyForm(true);
  };

  /* =========================================================
     DELETE FAMILY MEMBER (REQUEST ACTION: 'D')
  ========================================================= */

  const handleDeleteFamily = async (row) => {
    if (!canManageFamily) {
      notifyWarning(PROFILE_MESSAGES.FAMILY_UPDATE_CLOSED);
      return;
    }

    const result = await confirmAction(
      PROFILE_MESSAGES.DELETE_FAMILY_TITLE,
      `Are you sure you want to request removal of ${row.name}? This will be sent for authorization.`
    );

    if (!result?.isConfirmed) return;

    try {
      const res = await saveFamilyMember({
        action: "D",
        id: row.id,
      });

      if (res?.status) {
        notifySuccess(
          res?.message ||
            "Family member removal request submitted for authorization."
        );
      } else {
        notifyWarning(
          res?.message ||
            "A request is already pending for this family member."
        );
      }
    } catch (error) {
      console.error("DELETE FAMILY ERROR:", error);

      const responseData = error?.response?.data;
      const errorMsg =
        responseData?.message ||
        error?.message ||
        PROFILE_MESSAGES.FAMILY_DELETE_ERROR;

      if (error?.response?.status === 409) {
        const pendingDetails = responseData?.data?.pending_data;
        const reqAction = responseData?.data?.req_action || "D";
        notifyWarning(
          renderPendingDetailsHtml(errorMsg, pendingDetails, reqAction)
        );
      } else {
        notifyError(errorMsg);
      }
    }
  };

  /* =========================================================
     DOB CHANGE
  ========================================================= */

  const handleDobChange = (date) => {
    if (!date) {
      setFamilyForm((prev) => ({
        ...prev,
        dob: "",
      }));
      return;
    }

    const formattedDate = formatDateForForm(date);
    setFamilyForm((prev) => ({
      ...prev,
      dob: formattedDate,
    }));
  };

  const dobValue = parseFormDate(familyForm.dob);

  /* =========================================================
     INPUT CHANGE
  ========================================================= */

  const handleFamilyInputChange = (e) => {
    const { name, value } = e.target;

    setFamilyForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setFamilyErrors((prev) => {
      const updated = { ...prev };
      if (name === "name" && value.trim()) updated.name = "";
      if (name === "relation" && value) updated.relation = "";
      return updated;
    });
  };

  /* =========================================================
     DOCUMENT FILE CHANGE HANDLER
  ========================================================= */

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      setDocumentFile(null);
      return;
    }

    // Allowed extensions: pdf, jpg, jpeg, png
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      setFamilyErrors((prev) => ({
        ...prev,
        document: "Only PDF, JPG, or PNG files are permitted.",
      }));
      setDocumentFile(null);
      e.target.value = "";
      return;
    }

    // Size limit: 2MB
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      setFamilyErrors((prev) => ({
        ...prev,
        document: "Document file size must be less than 2MB.",
      }));
      setDocumentFile(null);
      e.target.value = "";
      return;
    }

    setFamilyErrors((prev) => ({ ...prev, document: "" }));
    setDocumentFile(file);
  };

  /* =========================================================
     SAVE FAMILY MEMBER (REQUEST ACTION: 'A' or 'E')
  ========================================================= */

  const handleSaveFamily = async () => {
    if (!canManageFamily) {
      notifyWarning(PROFILE_MESSAGES.FAMILY_UPDATE_CLOSED);
      return;
    }

    /* -------------------------------------------------------
       BASIC VALIDATION
    ------------------------------------------------------- */
    const errors = {
      name: "",
      relation: "",
      document: "",
    };

    if (!familyForm.name?.trim()) {
      errors.name = "Name is required.";
    }

    if (!familyForm.relation) {
      errors.relation = "Relation is required.";
    }

    setFamilyErrors(errors);
    if (errors.name || errors.relation) return;

    /* -------------------------------------------------------
       AADHAAR VALIDATION
    ------------------------------------------------------- */
    const aadhaar = familyForm.aadhaar?.trim();

    if (aadhaar) {
      if (!/^\d+$/.test(aadhaar)) {
        notifyError(PROFILE_MESSAGES.AADHAAR_DIGITS_ONLY);
        return;
      }
      if (aadhaar.length !== 12) {
        notifyError(PROFILE_MESSAGES.AADHAAR_LENGTH);
        return;
      }
      if (/^[01]/.test(aadhaar)) {
        notifyError(PROFILE_MESSAGES.AADHAAR_INVALID);
        return;
      }
    }

    /* -------------------------------------------------------
       RELATION DUPLICATE CHECK
    ------------------------------------------------------- */
    const selectedRelation = familyForm.relation.trim().toLowerCase();
    const currentEditingId = editingMember
      ? String(familyForm.id || editingMember.id || "")
      : null;

    const otherMembers = familyData.filter((member) => {
      if (!currentEditingId) return true;
      return String(member.id || "") !== currentEditingId;
    });

    if (selectedRelation === "wife" || selectedRelation === "husband") {
      const hasSpouse = otherMembers.some((m) => {
        const r = (m.relation || "").trim().toLowerCase();
        return r === "wife" || r === "husband" || r === "spouse";
      });

      if (hasSpouse) {
        notifyError(
          "A spouse record (Wife/Husband) already exists in your family details."
        );
        return;
      }
    }

    if (selectedRelation === "mother") {
      const hasMother = otherMembers.some(
        (m) => (m.relation || "").trim().toLowerCase() === "mother"
      );
      if (hasMother) {
        notifyError("A Mother record already exists in your family details.");
        return;
      }
    }

    if (selectedRelation === "father") {
      const hasFather = otherMembers.some(
        (m) => (m.relation || "").trim().toLowerCase() === "father"
      );
      if (hasFather) {
        notifyError("A Father record already exists in your family details.");
        return;
      }
    }

    /* -------------------------------------------------------
       DUPLICATE MEMBER CHECK (NAME + RELATION)
    ------------------------------------------------------- */
    const trimmedName = familyForm.name.trim().toLowerCase();

    const isDuplicate = otherMembers.some((m) => {
      const existingName = (m.name || "").trim().toLowerCase();
      const existingRelation = (m.relation || "").trim().toLowerCase();
      return (
        existingName === trimmedName && existingRelation === selectedRelation
      );
    });

    if (isDuplicate) {
      notifyWarning(
        `A family member record with the name "${familyForm.name.trim()}" and relation "${familyForm.relation}" already exists.`
      );
      return;
    }

    /* -------------------------------------------------------
       BUILD PAYLOAD (FormData supports both text and files)
    ------------------------------------------------------- */
    const isEdit = Boolean(editingMember && familyForm.id);

    const formData = new FormData();
    formData.append("action", isEdit ? "E" : "A");
    if (isEdit) {
      formData.append("id", familyForm.id);
    }
    formData.append("name", familyForm.name.trim());
    formData.append("relation", familyForm.relation);
    formData.append("dependent", familyForm.dependent || FAMILY_DEPENDENT.DEPENDANT);
    formData.append("dob", familyForm.dob || "");
    formData.append("occupation", familyForm.occupation?.trim() || "");
    formData.append("aadhaar", familyForm.aadhaar?.trim() || "");

    if (documentFile) {
      formData.append("document", documentFile);
    }

    /* -------------------------------------------------------
       SUBMIT FOR AUTHORIZATION
    ------------------------------------------------------- */
    try {
      setFamilySaving(true);
      const res = await saveFamilyMember(formData);

      if (res?.status) {
        setShowFamilyForm(false);
        setEditingMember(null);
        setDocumentFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        setFamilyErrors({
          name: "",
          relation: "",
          document: "",
        });

        notifySuccess(
          res?.message ||
            (isEdit
              ? "Family member update request submitted for authorization."
              : "Family member addition request submitted for authorization.")
        );
      } else {
        notifyWarning(res?.message || PROFILE_MESSAGES.FAMILY_SAVE_FAILED);
      }
    } catch (error) {
      console.error("SAVE FAMILY ERROR:", error);

      const responseData = error?.response?.data;
      const errorMsg =
        responseData?.message ||
        error?.message ||
        PROFILE_MESSAGES.FAMILY_SAVE_ERROR;

      if (error?.response?.status === 409) {
        const pendingDetails = responseData?.data?.pending_data;
        const reqAction = responseData?.data?.req_action || (isEdit ? "E" : "A");
        notifyWarning(
          renderPendingDetailsHtml(errorMsg, pendingDetails, reqAction)
        );
      } else {
        notifyError(errorMsg);
      }
    } finally {
      setFamilySaving(false);
    }
  };

  /* =========================================================
     CLOSE FORM
  ========================================================= */

  const handleCloseFamilyForm = () => {
    if (familySaving) return;

    setShowFamilyForm(false);
    setEditingMember(null);
    setDocumentFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setFamilyErrors({
      name: "",
      relation: "",
      document: "",
    });
  };

  /* =========================================================
     ACTION COLUMN
  ========================================================= */

  const actionBody = (rowData) => (
    <div className="d-flex align-items-center gap-2">
      <button
        type="button"
        title={PROFILE_MESSAGES.EDIT_FAMILY_TITLE}
        className="btn btn-icon btn-sm btn-primary"
        onClick={() => handleEditFamily(rowData)}
      >
        <i className="ti ti-edit"></i>
      </button>

      <button
        type="button"
        title={PROFILE_MESSAGES.DELETE_FAMILY_TOOLTIP}
        className="btn btn-icon btn-sm btn-danger"
        onClick={() => handleDeleteFamily(rowData)}
      >
        <i className="ti ti-trash"></i>
      </button>
    </div>
  );

  /* =========================================================
     DATATABLE COLUMNS
  ========================================================= */

  const familyColumns = [
    {
      field: "name",
      header: "Name",
      sortable: true,
    },
    {
      field: "relation",
      header: "Relation",
      sortable: true,
    },
    {
      field: "age",
      header: "Age",
      sortable: true,
    },
    {
      field: "dob",
      header: "DOB",
      sortable: true,
      body: (rowData) => formatDisplayDate(rowData.dob),
    },
    {
      field: "aadhaar",
      header: "Aadhaar",
      sortable: true,
    },
    {
      field: "dependent",
      header: "Dependent",
      sortable: true,
    },
    ...(canManageFamily
      ? [
          {
            header: "Actions",
            body: actionBody,
            exportable: false,
            style: {
              width: "120px",
              textAlign: "center",
            },
          },
        ]
      : []),
  ];

  /* =========================================================
    Render Pending Details in Popup (Clean Card Format)
  ========================================================== */
  const renderPendingDetailsHtml = (message, pendingData, reqAction = "E") => {
    if (!pendingData || Object.keys(pendingData).length === 0) {
      return `<div style="font-size: 0.95rem; color: #4b5563; line-height: 1.5;">${message}</div>`;
    }

    let cardTitle = "Pending Update Details";
    if (reqAction === "D") {
      cardTitle = "Pending Removal Details";
    } else if (reqAction === "A") {
      cardTitle = "Pending Addition Details";
    }

    const fields = [
      { label: "Name", value: pendingData.name },
      { label: "Relation", value: pendingData.relation },
      { label: "Date of Birth", value: pendingData.dob },
      { label: "Dependent", value: pendingData.dependent },
      { label: "Occupation", value: pendingData.occupation },
    ];

    const detailRows = fields
      .filter((f) => Boolean(f.value))
      .map(
        (f) => `
        <tr style="border-bottom: 1px solid #edf2f7;">
          <td style="padding: 7px 12px; font-weight: 500; color: #64748b; width: 38%;">${f.label}</td>
          <td style="padding: 7px 12px; font-weight: 600; color: #1e293b;">${f.value}</td>
        </tr>`
      )
      .join("");

    if (!detailRows) {
      return `<div style="font-size: 0.95rem; color: #4b5563; line-height: 1.5;">${message}</div>`;
    }

    return `
      <div style="text-align: left; font-size: 0.9rem;">
        <p style="color: #475569; margin-bottom: 14px; text-align: center; line-height: 1.5;">
          ${message}
        </p>

        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
          <div style="background: #f1f5f9; padding: 8px 12px; font-size: 0.78rem; font-weight: 700; text-transform: uppercase; color: #475569; letter-spacing: 0.04em; border-bottom: 1px solid #e2e8f0;">
            ${cardTitle}
          </div>
          <table style="width: 100%; border-collapse: collapse; font-size: 0.84rem;">
            <tbody>
              ${detailRows}
            </tbody>
          </table>
        </div>
      </div>
    `;
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <>
      <div className="tab-pane active">
        {/* SEARCH + ADD */}
        <div className="d-flex justify-content-between align-items-center flex-wrap row-gap-3 mb-3">
          <SDLSearch
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search..."
            style={{ width: "280px" }}
          />

          {canManageFamily && (
            <button
              type="button"
              title="Add Family Member"
              className="btn btn-primary btn-sm d-flex align-items-center gap-1"
              onClick={handleAddFamily}
            >
              <i className="ti ti-plus"></i>
              <span>Add Family Member</span>
            </button>
          )}
        </div>

        {/* FAMILY TABLE */}
        <div className="table-responsive">
          <SDLDataTable
            data={filteredFamilyData}
            columns={familyColumns}
            loading={false}
            rows={10}
            rowsPerPageOptions={[10, 20, 50]}
            removableSort
            dataKey="id"
            emptyMessage="No family members found"
            tableStyle={{ minWidth: "800px" }}
          />
        </div>
      </div>

      {/* ADD / EDIT MODAL */}
      {showFamilyForm && (
        <div
          className="modal fade show"
          style={{
            display: "block",
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
          tabIndex="-1"
          role="dialog"
          aria-modal="true"
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              {/* MODAL HEADER */}
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingMember ? "Edit Family Member" : "Add Family Member"}
                </h5>
                <button
                  type="button"
                  className="close"
                  aria-label="Close"
                  onClick={handleCloseFamilyForm}
                  disabled={familySaving}
                >
                  <span aria-hidden="true"> ×</span>
                </button>
              </div>

              {/* MODAL BODY */}
              <div className="modal-body">
                <div className="row">
                  {/* NAME */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={familyForm.name}
                      onChange={handleFamilyInputChange}
                      placeholder="Enter Name"
                      className={`form-control ${
                        familyErrors.name ? "is-invalid" : ""
                      }`}
                    />
                    {familyErrors.name && (
                      <div className="invalid-feedback d-block">
                        {familyErrors.name}
                      </div>
                    )}
                  </div>

                  {/* RELATION */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      Relation <span className="text-danger">*</span>
                    </label>
                    <select
                      name="relation"
                      value={familyForm.relation}
                      onChange={handleFamilyInputChange}
                      className={`form-select ${
                        familyErrors.relation ? "is-invalid" : ""
                      }`}
                    >
                      <option value="">Select Relation</option>
                      <option value="Wife">Wife</option>
                      <option value="Husband">Husband</option>
                      <option value="Mother">Mother</option>
                      <option value="Father">Father</option>
                      <option value="Son">Son</option>
                      <option value="Daughter">Daughter</option>
                    </select>
                    {familyErrors.relation && (
                      <div className="invalid-feedback d-block">
                        {familyErrors.relation}
                      </div>
                    )}
                  </div>

                  {/* DEPENDENT */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Dependent</label>
                    <select
                      name="dependent"
                      value={familyForm.dependent}
                      onChange={handleFamilyInputChange}
                      className="form-select"
                    >
                      <option value="Dependant">Dependant</option>
                      <option value="Non-Dependant">Non-Dependant</option>
                      <option value="Deceased">Deceased</option>
                      <option value="Not-Applicable">Not-Applicable</option>
                    </select>
                  </div>

                  {/* DOB */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Date of Birth</label>
                    <SDLCalendar
                      value={dobValue}
                      onChange={handleDobChange}
                      inline={false}
                      allowAllDates={true}
                      disabled={familySaving}
                      maxDate={
                        new Date(
                          new Date().setHours(0, 0, 0, 0) - 24 * 60 * 60 * 1000
                        )
                      }
                    />
                  </div>

                  {/* OCCUPATION */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Occupation</label>
                    <input
                      type="text"
                      name="occupation"
                      value={familyForm.occupation}
                      onChange={handleFamilyInputChange}
                      placeholder="Enter Occupation"
                      className="form-control"
                    />
                  </div>

                  {/* AADHAAR */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Aadhaar</label>
                    <input
                      type="text"
                      name="aadhaar"
                      value={familyForm.aadhaar}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "");
                        setFamilyForm((prev) => ({
                          ...prev,
                          aadhaar: value.slice(0, 12),
                        }));
                      }}
                      maxLength={12}
                      inputMode="numeric"
                      placeholder="Enter 12 Digit Aadhaar Number"
                      className="form-control"
                    />
                  </div>

                  {/* DOCUMENT UPLOAD (Birth certificate, ID proof, etc.) */}
                  <div className="col-md-12 mb-3">
                    <label className="form-label d-flex justify-content-between">
                      <span>
                        Supporting Document{" "}
                        <small className="text-muted">
                          (e.g., Birth Certificate, Marriage Certificate, ID Proof)
                        </small>
                      </span>
                      <small className="text-muted">Max 2MB (PDF, JPG, PNG)</small>
                    </label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      name="document"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileChange}
                      className={`form-control ${
                        familyErrors.document ? "is-invalid" : ""
                      }`}
                    />
                    {familyErrors.document && (
                      <div className="invalid-feedback d-block">
                        {familyErrors.document}
                      </div>
                    )}
                    {documentFile && (
                      <div className="small text-success mt-1 d-flex align-items-center gap-1">
                        <i className="ti ti-check"></i>
                        <span>Selected file: {documentFile.name} ({(documentFile.size / 1024).toFixed(1)} KB)</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* MODAL FOOTER */}
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-primary me-2"
                  onClick={handleSaveFamily}
                  disabled={familySaving}
                >
                  {familySaving ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Submitting...
                    </>
                  ) : editingMember ? (
                    "Submit Update Request"
                  ) : (
                    "Submit Request"
                  )}
                </button>

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCloseFamilyForm}
                  disabled={familySaving}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FamilyDetailsTab;