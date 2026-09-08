import { useMemo, useState } from "react";

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
  FAMILY_RELATIONS,
  FAMILY_DEPENDENT,
} from "../../../../constants/profileMessages";

/* =========================================================
   FAMILY DETAILS TAB
========================================================= */

const FamilyDetailsTab = ({ profile, setProfile }) => {
  /* =========================================================
     PERMISSION
  ========================================================= */

  const canManageFamily =
    profile?.permissions?.can_manage_family || false;

  /* =========================================================
     EXISTING FAMILY DATA
  ========================================================= */

  const spouse = profile?.spouse || {};
  const children = profile?.children || [];
  const mother = profile?.mother || {};
  const father = profile?.father || {};

  /* =========================================================
     STATE
  ========================================================= */

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

  const [familyErrors, setFamilyErrors] = useState({
    name: "",
    relation: "",
  });

  /* =========================================================
     PARSE DATE
  ========================================================= */

  const parseFormDate = (value) => {
    if (!value) return null;

    if (value instanceof Date) {
      return isNaN(value.getTime()) ? null : value;
    }

    const valueString = String(value)
      .trim()
      .substring(0, 11);

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
     ADD FAMILY MEMBER
  ========================================================= */

  const handleAddFamily = () => {
    if (!canManageFamily) {
      notifyWarning(PROFILE_MESSAGES.FAMILY_UPDATE_CLOSED);
      return;
    }

    setEditingMember(null);
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
    });

    setShowFamilyForm(true);
  };

  /* =========================================================
     EDIT FAMILY MEMBER
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
    });

    setShowFamilyForm(true);
  };

  /* =========================================================
     DELETE FAMILY MEMBER
  ========================================================= */

  const handleDeleteFamily = async (row) => {
    if (!canManageFamily) {
      notifyWarning(PROFILE_MESSAGES.FAMILY_UPDATE_CLOSED);
      return;
    }

    const result = await confirmAction(
      PROFILE_MESSAGES.DELETE_FAMILY_TITLE,
      PROFILE_MESSAGES.DELETE_FAMILY_MESSAGE(row.name)
    );

    if (!result?.isConfirmed) return;

    try {
      const res = await deleteFamilyMember({ id: row.id });

      if (res?.status) {
        let updatedChildren = [...children];
        let updatedSpouse = { ...spouse };
        let updatedMother = { ...mother };
        let updatedFather = { ...father };

        const targetRel = String(row.relation).toLowerCase();

        if (["wife", "husband", "spouse"].includes(targetRel)) {
          updatedSpouse = {};
        } else if (targetRel === "mother") {
          updatedMother = {};
        } else if (targetRel === "father") {
          updatedFather = {};
        } else {
          updatedChildren = children.filter(
            (item) => String(item.ID) !== String(row.id)
          );
        }

        setProfile((prev) => ({
          ...prev,
          spouse: updatedSpouse,
          mother: updatedMother,
          father: updatedFather,
          children: updatedChildren,
        }));

        notifySuccess(PROFILE_MESSAGES.FAMILY_DELETED);
      } else {
        notifyError(res?.message || PROFILE_MESSAGES.FAMILY_DELETE_FAILED);
      }
    } catch (error) {
      console.error("DELETE FAMILY ERROR:", error);
      notifyError(
        error?.response?.data?.message ||
          error?.message ||
          PROFILE_MESSAGES.FAMILY_DELETE_ERROR
      );
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
     CALCULATE AGE
  ========================================================= */

  const calculateAge = (dob) => {
    if (!dob) return "";
    const birthDate = parseFormDate(dob);
    if (!birthDate) return "";

    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return Math.max(age, 0);
  };

  /* =========================================================
     SAVE FAMILY MEMBER
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

    /* =========================================================
       RELATION DUPLICATE CHECK (ALLOWS MULTIPLE SONS / DAUGHTERS)
    ========================================================= */
    const selectedRelation = familyForm.relation.trim().toLowerCase();
    const currentEditingId = editingMember
      ? String(familyForm.id || editingMember.id || "")
      : null;

    // Filter out the member currently being updated
    const otherMembers = familyData.filter((member) => {
      if (!currentEditingId) return true;
      return String(member.id || "") !== currentEditingId;
    });

    // Check Wife / Husband exclusivity (cannot have duplicate spouse records)
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

    // Check Mother (single record only)
    if (selectedRelation === "mother") {
      const hasMother = otherMembers.some(
        (m) => (m.relation || "").trim().toLowerCase() === "mother"
      );
      if (hasMother) {
        notifyError("A Mother record already exists in your family details.");
        return;
      }
    }

    // Check Father (single record only)
    if (selectedRelation === "father") {
      const hasFather = otherMembers.some(
        (m) => (m.relation || "").trim().toLowerCase() === "father"
      );
      if (hasFather) {
        notifyError("A Father record already exists in your family details.");
        return;
      }
    }

    // Note: 'son' and 'daughter' bypass all duplicate checks above

    /* -------------------------------------------------------
       PAYLOAD
    ------------------------------------------------------- */
    const payload = {
      id: editingMember ? familyForm.id : null,
      name: familyForm.name.trim(),
      relation: familyForm.relation,
      dependent: familyForm.dependent || FAMILY_DEPENDENT.DEPENDANT,
      dob: familyForm.dob || "",
      occupation: familyForm.occupation?.trim() || "",
      aadhaar: familyForm.aadhaar?.trim() || "",
    };

    /* -------------------------------------------------------
       SAVE
    ------------------------------------------------------- */
    try {
      setFamilySaving(true);
      const res = await saveFamilyMember(payload);

      if (res?.status) {
        let updatedChildren = [...children];
        let updatedSpouse = { ...spouse };
        let updatedMother = { ...mother };
        let updatedFather = { ...father };

        const updatedMemberData = {
          ID: familyForm.id || res?.data?.id || null,
          FM_NAME: familyForm.name.trim(),
          FM_RELATION: familyForm.relation,
          FM_DEP: familyForm.dependent || FAMILY_DEPENDENT.DEPENDANT,
          DOB: familyForm.dob || "",
          OCCUPATION: familyForm.occupation?.trim() || "",
          AADHAAR: familyForm.aadhaar?.trim() || "",
          AGE: calculateAge(familyForm.dob),
        };

        const currentRel = familyForm.relation.trim().toLowerCase();

        /* EDIT EXISTING MEMBER */
        if (editingMember) {
          if (["wife", "husband"].includes(currentRel)) {
            updatedSpouse = { ...updatedSpouse, ...updatedMemberData };
          } else if (currentRel === "mother") {
            updatedMother = { ...updatedMother, ...updatedMemberData };
          } else if (currentRel === "father") {
            updatedFather = { ...updatedFather, ...updatedMemberData };
          } else {
            updatedChildren = updatedChildren.map((item) =>
              String(item.ID) === String(familyForm.id)
                ? { ...item, ...updatedMemberData }
                : item
            );
          }
        } else {
          /* ADD NEW MEMBER */
          if (["wife", "husband"].includes(currentRel)) {
            updatedSpouse = updatedMemberData;
          } else if (currentRel === "mother") {
            updatedMother = updatedMemberData;
          } else if (currentRel === "father") {
            updatedFather = updatedMemberData;
          } else {
            updatedChildren.push(updatedMemberData);
          }
        }

        setProfile((prev) => ({
          ...prev,
          spouse: updatedSpouse,
          mother: updatedMother,
          father: updatedFather,
          children: updatedChildren,
        }));

        setShowFamilyForm(false);
        setEditingMember(null);
        setFamilyErrors({
          name: "",
          relation: "",
        });

        notifySuccess(
          editingMember
            ? PROFILE_MESSAGES.FAMILY_UPDATED
            : PROFILE_MESSAGES.FAMILY_ADDED
        );
      } else {
        notifyError(res?.message || PROFILE_MESSAGES.FAMILY_SAVE_FAILED);
      }
    } catch (error) {
      console.error("SAVE FAMILY ERROR:", error);
      notifyError(
        error?.response?.data?.message ||
          error?.message ||
          PROFILE_MESSAGES.FAMILY_SAVE_ERROR
      );
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
    setFamilyErrors({
      name: "",
      relation: "",
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
                  {editingMember
                    ? "Edit Family Member"
                    : "Add Family Member"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Close"
                  onClick={handleCloseFamilyForm}
                  disabled={familySaving}
                ></button>
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
                </div>
              </div>

              {/* MODAL FOOTER */}
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-light"
                  onClick={handleCloseFamilyForm}
                  disabled={familySaving}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="btn btn-primary"
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
                      Saving...
                    </>
                  ) : editingMember ? (
                    "Update"
                  ) : (
                    "Save"
                  )}
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