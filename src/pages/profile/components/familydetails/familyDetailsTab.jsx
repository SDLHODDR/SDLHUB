import { useMemo, useState } from "react";

import SDLDataTable from "../../../../components/datatable/SDLDataTable";
import SDLSearch from "../../../../components/datatable/SDLSearch";

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
     PROFILE DATA
  ========================================================= */

  const canManageFamily =
    profile?.permissions?.can_manage_family || false;

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

  /*
   * Inline validation errors
   */
  const [familyErrors, setFamilyErrors] = useState({
    name: "",
    relation: "",
  });

  /* =========================================================
     FAMILY DATA
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
          occupation:
            member.OCCUPATION ||
            member.FM_OCCUPATION ||
            "",
          aadhaar: member.AADHAAR || "",
        });
      }
    };

    pushMember(spouse, "Spouse");
    pushMember(mother, "Mother");
    pushMember(father, "Father");

    children.forEach((child) => {
      pushMember(child, "Child");
    });

    return list;
  }, [spouse, mother, father, children]);

  /* =========================================================
     FILTERED FAMILY DATA
  ========================================================= */

  const filteredFamilyData = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    if (!q) {
      return familyData;
    }

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
      notifyWarning(
        PROFILE_MESSAGES.FAMILY_UPDATE_CLOSED
      );
      return;
    }

    setEditingMember(null);

    setFamilyForm({
      id: "",
      name: "",
      relation: FAMILY_RELATIONS.WIFE,
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
      notifyWarning(
        PROFILE_MESSAGES.FAMILY_UPDATE_CLOSED
      );
      return;
    }

    let formattedDOB = "";

    if (row.dob) {
      const parsedDate = new Date(row.dob);

      if (!isNaN(parsedDate.getTime())) {
        const year = parsedDate.getFullYear();
        const month = String(
          parsedDate.getMonth() + 1
        ).padStart(2, "0");
        const day = String(
          parsedDate.getDate()
        ).padStart(2, "0");

        formattedDOB = `${year}-${month}-${day}`;
      }
    }

    setEditingMember(row);

    setFamilyForm({
      id: row.id,
      name: row.name || "",
      relation: row.relation || "",
      dependent:
        row.dependent || FAMILY_DEPENDENT.DEPENDANT,
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
      notifyWarning(
        PROFILE_MESSAGES.FAMILY_UPDATE_CLOSED
      );
      return;
    }

    const result = await confirmAction(
      PROFILE_MESSAGES.DELETE_FAMILY_TITLE,
      PROFILE_MESSAGES.DELETE_FAMILY_MESSAGE(row.name)
    );

    if (!result?.isConfirmed) {
      return;
    }

    try {
      const res = await deleteFamilyMember({
        id: row.id,
      });

      if (res?.status) {
        let updatedChildren = [...children];
        let updatedSpouse = { ...spouse };
        let updatedMother = { ...mother };
        let updatedFather = { ...father };

        /* ---------------------------------------------
           SPOUSE
        --------------------------------------------- */

        if (
          [
            FAMILY_RELATIONS.WIFE,
            FAMILY_RELATIONS.HUSBAND,
          ].includes(row.relation)
        ) {
          updatedSpouse = {};
        }

        /* ---------------------------------------------
           MOTHER
        --------------------------------------------- */

        else if (
          row.relation === FAMILY_RELATIONS.MOTHER
        ) {
          updatedMother = {};
        }

        /* ---------------------------------------------
           FATHER
        --------------------------------------------- */

        else if (
          row.relation === FAMILY_RELATIONS.FATHER
        ) {
          updatedFather = {};
        }

        /* ---------------------------------------------
           CHILD
        --------------------------------------------- */

        else {
          updatedChildren = children.filter(
            (item) =>
              String(item.ID) !== String(row.id)
          );
        }

        setProfile((prev) => ({
          ...prev,
          spouse: updatedSpouse,
          mother: updatedMother,
          father: updatedFather,
          children: updatedChildren,
        }));

        notifySuccess(
          PROFILE_MESSAGES.FAMILY_DELETED
        );
      } else {
        notifyError(
          res?.message ||
            PROFILE_MESSAGES.FAMILY_DELETE_FAILED
        );
      }
    } catch (error) {
      console.error(
        "DELETE FAMILY ERROR:",
        error
      );

      notifyError(
        PROFILE_MESSAGES.FAMILY_DELETE_ERROR
      );
    }
  };

  /* =========================================================
     INPUT CHANGE
  ========================================================= */

  const handleFamilyInputChange = (e) => {
    const { name, value } = e.target;

    setFamilyForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    /*
     * Clear inline validation as soon as
     * the user fixes the field.
     */
    setFamilyErrors((prev) => {
      const updated = { ...prev };

      if (name === "name" && value.trim()) {
        updated.name = "";
      }

      if (name === "relation" && value) {
        updated.relation = "";
      }

      return updated;
    });
  };

  /* =========================================================
     CALCULATE AGE
  ========================================================= */

  const calculateAge = (dob) => {
    if (!dob) {
      return "";
    }

    const birthDate = new Date(dob);

    if (isNaN(birthDate.getTime())) {
      return "";
    }

    const today = new Date();

    let age =
      today.getFullYear() -
      birthDate.getFullYear();

    const monthDiff =
      today.getMonth() -
      birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 &&
        today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  /* =========================================================
     SAVE FAMILY MEMBER
  ========================================================= */

  const handleSaveFamily = async () => {
    if (!canManageFamily) {
      notifyWarning(
        PROFILE_MESSAGES.FAMILY_UPDATE_CLOSED
      );
      return;
    }

    /* =====================================================
       INLINE REQUIRED FIELD VALIDATION
    ===================================================== */

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

    /*
     * Stop here when required validation fails.
     */
    if (errors.name || errors.relation) {
      return;
    }

    /* =====================================================
       AADHAAR VALIDATION
    ===================================================== */

    const aadhaar = familyForm.aadhaar?.trim();

    if (aadhaar) {
      if (!/^\d+$/.test(aadhaar)) {
        notifyError(
          PROFILE_MESSAGES.AADHAAR_DIGITS_ONLY
        );
        return;
      }

      if (aadhaar.length !== 12) {
        notifyError(
          PROFILE_MESSAGES.AADHAAR_LENGTH
        );
        return;
      }

      if (/^[01]/.test(aadhaar)) {
        notifyError(
          PROFILE_MESSAGES.AADHAAR_INVALID
        );
        return;
      }
    }

    /* =====================================================
       DUPLICATE VALIDATION
    ===================================================== */

    const isDuplicate = familyData.some(
      (member) => {
        /*
         * Ignore the current record while editing.
         */
        if (
          editingMember &&
          String(member.id) ===
            String(familyForm.id)
        ) {
          return false;
        }

        return (
          member.name
            ?.trim()
            .toLowerCase() ===
            familyForm.name
              ?.trim()
              .toLowerCase() &&
          member.relation
            ?.trim()
            .toLowerCase() ===
            familyForm.relation
              ?.trim()
              .toLowerCase()
        );
      }
    );

    if (isDuplicate) {
      notifyError(
        PROFILE_MESSAGES.DUPLICATE_FAMILY
      );
      return;
    }

    /* =====================================================
       FORMAT DOB
    ===================================================== */

    let formattedDOB = familyForm.dob;

    if (familyForm.dob) {
      const date = new Date(familyForm.dob);

      if (!isNaN(date.getTime())) {
        const day = String(
          date.getDate()
        ).padStart(2, "0");

        const month = date.toLocaleString(
          "en-IN",
          {
            month: "short",
          }
        );

        const year = date.getFullYear();

        formattedDOB = `${day}-${month}-${year}`;
      }
    }

    /* =====================================================
       PAYLOAD
    ===================================================== */

    const payload = {
      id: editingMember
        ? familyForm.id
        : null,

      name: familyForm.name.trim(),

      relation: familyForm.relation,

      dependent:
        familyForm.dependent ||
        FAMILY_DEPENDENT.DEPENDANT,

      dob: formattedDOB,

      occupation:
        familyForm.occupation?.trim() || "",

      aadhaar: familyForm.aadhaar?.trim() || "",
    };

    /* =====================================================
       API SAVE
    ===================================================== */

    try {
      setFamilySaving(true);

      const res = await saveFamilyMember(
        payload
      );

      if (res?.status) {
        let updatedChildren = [...children];
        let updatedSpouse = { ...spouse };
        let updatedMother = { ...mother };
        let updatedFather = { ...father };

        /* ---------------------------------------------
           UPDATED MEMBER DATA
        --------------------------------------------- */

        const updatedMemberData = {
          ID:
            familyForm.id ||
            res?.data?.id ||
            Date.now(),

          FM_NAME: familyForm.name.trim(),

          FM_RELATION:
            familyForm.relation,

          FM_DEP:
            familyForm.dependent ||
            FAMILY_DEPENDENT.DEPENDANT,

          DOB: formattedDOB,

          OCCUPATION:
            familyForm.occupation?.trim() ||
            "",

          AADHAAR:
            familyForm.aadhaar?.trim() ||
            "",

          AGE: calculateAge(
            familyForm.dob
          ),
        };

        /* =================================================
           EDIT EXISTING MEMBER
        ================================================= */

        if (editingMember) {
          /* ---------------------------------------------
             SPOUSE
          --------------------------------------------- */

          if (
            String(spouse?.ID) ===
            String(familyForm.id)
          ) {
            updatedSpouse = {
              ...updatedSpouse,
              ...updatedMemberData,
            };
          }

          /* ---------------------------------------------
             MOTHER
          --------------------------------------------- */

          else if (
            String(mother?.ID) ===
            String(familyForm.id)
          ) {
            updatedMother = {
              ...updatedMother,
              ...updatedMemberData,
            };
          }

          /* ---------------------------------------------
             FATHER
          --------------------------------------------- */

          else if (
            String(father?.ID) ===
            String(familyForm.id)
          ) {
            updatedFather = {
              ...updatedFather,
              ...updatedMemberData,
            };
          }

          /* ---------------------------------------------
             CHILD
          --------------------------------------------- */

          else {
            updatedChildren =
              updatedChildren.map(
                (item) =>
                  String(item.ID) ===
                  String(familyForm.id)
                    ? {
                        ...item,
                        ...updatedMemberData,
                      }
                    : item
              );
          }
        }

        /* =================================================
           ADD NEW MEMBER
        ================================================= */

        else {
          /* ---------------------------------------------
             SPOUSE
          --------------------------------------------- */

          if (
            [
              FAMILY_RELATIONS.WIFE,
              FAMILY_RELATIONS.HUSBAND,
            ].includes(
              familyForm.relation
            )
          ) {
            updatedSpouse =
              updatedMemberData;
          }

          /* ---------------------------------------------
             MOTHER
          --------------------------------------------- */

          else if (
            familyForm.relation ===
            FAMILY_RELATIONS.MOTHER
          ) {
            updatedMother =
              updatedMemberData;
          }

          /* ---------------------------------------------
             FATHER
          --------------------------------------------- */

          else if (
            familyForm.relation ===
            FAMILY_RELATIONS.FATHER
          ) {
            updatedFather =
              updatedMemberData;
          }

          /* ---------------------------------------------
             CHILD
          --------------------------------------------- */

          else {
            updatedChildren.push(
              updatedMemberData
            );
          }
        }

        /* =================================================
           UPDATE PROFILE STATE
        ================================================= */

        setProfile((prev) => ({
          ...prev,
          spouse: updatedSpouse,
          mother: updatedMother,
          father: updatedFather,
          children: updatedChildren,
        }));

        /* =================================================
           CLOSE MODAL
        ================================================= */

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
        notifyError(
          res?.message ||
            PROFILE_MESSAGES.FAMILY_SAVE_FAILED
        );
      }
    } catch (error) {
      console.error(
        "SAVE FAMILY ERROR:",
        error
      );

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
     CLOSE MODAL
  ========================================================= */

  const handleCloseFamilyForm = () => {
    if (familySaving) {
      return;
    }

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
      {/* EDIT */}

      <button
        type="button"
        title={
          PROFILE_MESSAGES.EDIT_FAMILY_TITLE
        }
        className="btn btn-icon btn-sm btn-primary"
        onClick={() =>
          handleEditFamily(rowData)
        }
      >
        <i className="ti ti-edit"></i>
      </button>

      {/* DELETE */}

      <button
        type="button"
        title={
          PROFILE_MESSAGES.DELETE_FAMILY_TOOLTIP
        }
        className="btn btn-icon btn-sm btn-danger"
        onClick={() =>
          handleDeleteFamily(rowData)
        }
      >
        <i className="ti ti-trash"></i>
      </button>
    </div>
  );

  /* =========================================================
     TABLE COLUMNS
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
      {/* =====================================================
          FAMILY DETAILS
      ===================================================== */}

      <div className="tab-pane active">
        {/* HEADER */}

        <div className="d-flex justify-content-between align-items-center flex-wrap row-gap-3 mb-3">
          {/* SEARCH */}

          <SDLSearch
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search..."
            style={{
              width: "280px",
            }}
          />

          {/* ADD */}

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

        {/* TABLE */}

        <div className="table-responsive">
          <SDLDataTable
            data={filteredFamilyData}
            columns={familyColumns}
            loading={false}
            rows={10}
            rowsPerPageOptions={[
              10,
              20,
              50,
            ]}
            removableSort
            dataKey="id"
            emptyMessage="No family members found"
            tableStyle={{
              minWidth: "800px",
            }}
          />
        </div>
      </div>

      {/* =====================================================
          ADD / EDIT FAMILY MEMBER MODAL
      ===================================================== */}

      {showFamilyForm && (
        <div
          className="modal fade show"
          style={{
            display: "block",
            backgroundColor:
              "rgba(0,0,0,0.5)",
          }}
          tabIndex="-1"
          role="dialog"
          aria-modal="true"
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              {/* =================================================
                  MODAL HEADER
              ================================================= */}

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
                  onClick={
                    handleCloseFamilyForm
                  }
                  disabled={familySaving}
                ></button>
              </div>

              {/* =================================================
                  MODAL BODY
              ================================================= */}

              <div className="modal-body">
                <div className="row">
                  {/* =================================================
                      NAME
                  ================================================= */}

                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      Name{" "}
                      <span className="text-danger">
                        *
                      </span>
                    </label>

                    <input
                      type="text"
                      name="name"
                      value={
                        familyForm.name
                      }
                      onChange={
                        handleFamilyInputChange
                      }
                      placeholder="Enter Name"
                      className={`form-control ${
                        familyErrors.name
                          ? "is-invalid"
                          : ""
                      }`}
                    />

                    {familyErrors.name && (
                      <div className="invalid-feedback d-block">
                        {
                          familyErrors.name
                        }
                      </div>
                    )}
                  </div>

                  {/* =================================================
                      RELATION
                  ================================================= */}

                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      Relation{" "}
                      <span className="text-danger">
                        *
                      </span>
                    </label>

                    <select
                      name="relation"
                      value={
                        familyForm.relation
                      }
                      onChange={
                        handleFamilyInputChange
                      }
                      className={`form-select ${
                        familyErrors.relation
                          ? "is-invalid"
                          : ""
                      }`}
                    >
                      <option value="">
                        Select Relation
                      </option>

                      <option value="Wife">
                        Wife
                      </option>

                      <option value="Husband">
                        Husband
                      </option>

                      <option value="Mother">
                        Mother
                      </option>

                      <option value="Father">
                        Father
                      </option>

                      <option value="Son">
                        Son
                      </option>

                      <option value="Daughter">
                        Daughter
                      </option>
                    </select>

                    {familyErrors.relation && (
                      <div className="invalid-feedback d-block">
                        {
                          familyErrors.relation
                        }
                      </div>
                    )}
                  </div>

                  {/* =================================================
                      DEPENDENT
                  ================================================= */}

                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      Dependent
                    </label>

                    <select
                      name="dependent"
                      value={
                        familyForm.dependent
                      }
                      onChange={
                        handleFamilyInputChange
                      }
                      className="form-select"
                    >
                      <option value="Dependant">
                        Dependant
                      </option>

                      <option value="Non-Dependant">
                        Non-Dependant
                      </option>

                      <option value="Deceased">
                        Deceased
                      </option>

                      <option value="Not-Applicable">
                        Not-Applicable
                      </option>
                    </select>
                  </div>

                  {/* =================================================
                      DOB
                  ================================================= */}

                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      Date of Birth
                    </label>

                    <input
                      type="date"
                      name="dob"
                      value={
                        familyForm.dob
                      }
                      onChange={
                        handleFamilyInputChange
                      }
                      className="form-control"
                    />
                  </div>

                  {/* =================================================
                      OCCUPATION
                  ================================================= */}

                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      Occupation
                    </label>

                    <input
                      type="text"
                      name="occupation"
                      value={
                        familyForm.occupation
                      }
                      onChange={
                        handleFamilyInputChange
                      }
                      placeholder="Enter Occupation"
                      className="form-control"
                    />
                  </div>

                  {/* =================================================
                      AADHAAR
                  ================================================= */}

                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      Aadhaar
                    </label>

                    <input
                      type="text"
                      name="aadhaar"
                      value={
                        familyForm.aadhaar
                      }
                      onChange={(e) => {
                        const value =
                          e.target.value.replace(
                            /\D/g,
                            ""
                          );

                        setFamilyForm(
                          (prev) => ({
                            ...prev,
                            aadhaar:
                              value.slice(
                                0,
                                12
                              ),
                          })
                        );
                      }}
                      maxLength={12}
                      inputMode="numeric"
                      placeholder="Enter 12 Digit Aadhaar Number"
                      className="form-control"
                    />
                  </div>
                </div>
              </div>

              {/* =================================================
                  MODAL FOOTER
              ================================================= */}

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-light"
                  onClick={
                    handleCloseFamilyForm
                  }
                  disabled={familySaving}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={
                    handleSaveFamily
                  }
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
