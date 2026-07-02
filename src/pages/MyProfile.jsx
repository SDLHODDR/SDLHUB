import { useContext, useState, useMemo, useEffect, useRef } from "react";
import { AuthContext } from "../auth/AuthProvider";
import { Link } from "react-router-dom";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

import { STOREIMAGES } from "../assets/assets";
import {
  getProfile,
  uploadProfileImage,
  saveFamilyMember,
  deleteFamilyMember,
} from "../services/profileService";
import {
  notifySuccess,
  notifyError,
  notifyWarning,
  confirmAction
} from "../services/alertService";

const MyProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const { user, setUser } = useContext(AuthContext);

  const [searchQuery, setSearchQuery] = useState("");
  const [rows, setRows] = useState(10);

  /* ================= FAMILY FLAGS ================= */
  // hide add/edit/delete buttons
  const canManageFamily = profile?.permissions?.can_manage_family || false;

  const [showFamilyForm, setShowFamilyForm] = useState(false);
  const [editingMember, setEditingMember] = useState(null);

  const [familyForm, setFamilyForm] = useState({
    id: "",
    name: "",
    relation: "",
    dependent: "",
    dob: "",
    occupation: "",
    aadhaar: "",
  });

  /* ================= LOAD PROFILE ================= */

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await getProfile();

        if (res?.status) {
          const emp = res.employee || {};

          setProfile({
            ...res,
            employee: {
              ...emp,
              profile_image:
                typeof emp.PROFILE_IMAGE === "string"
                  ? emp.PROFILE_IMAGE
                  : emp.PROFILE_IMAGE?.image || null,
            },
          });
        }
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    /* ================= INITIAL LOAD ================= */
    loadProfile();

    /* ================= AUTO REFRESH FLAG ================= */
    const interval = setInterval(() => {
      loadProfile();
    }, 30000); // every 30 seconds

    /* ================= CLEANUP ================= */
    return () => clearInterval(interval);
  }, []);

  /* ================= HELPERS ================= */

  const formatDOB = (dob) => {
    if (!dob) return "";

    const [day, mon, year] = dob.split("-");
    const monthIndex = new Date(`${mon} 1, 2000`).getMonth();
    const date = new Date(year, monthIndex, day);

    const weekday = date.toLocaleDateString("en-IN", { weekday: "long" });
    const month = date.toLocaleDateString("en-IN", { month: "long" });

    const getOrdinal = (d) => {
      if (d > 3 && d < 21) return "th";
      switch (d % 10) {
        case 1:
          return "st";
        case 2:
          return "nd";
        case 3:
          return "rd";
        default:
          return "th";
      }
    };

    return `${weekday}, ${day}${getOrdinal(Number(day))} ${month} ${year}`;
  };

  const getMaritalStatus = (m) => (Number(m) === 1 ? "Married" : "Single");
  const getGender = (g) => (Number(g) === 1 ? "Male" : "Female");

  const getFullName = (emp) =>
    `${emp?.FNAME || ""} ${emp?.MNAME || ""} ${emp?.LNAME || ""}`
      .replace(/\s+/g, " ")
      .trim();

  /* ================= SAFE DATA ================= */
  const emp = profile?.employee || {};
  const spouse = profile?.spouse || {};
  const children = profile?.children || [];
  const mother = profile?.mother || {};
  const father = profile?.father || {};

  /* ================= MEMO HOOKS (ALWAYS RUN) ================= */

  const familyData = useMemo(() => {
    let list = [];

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

    // spouse
    pushMember(spouse, "Spouse");

    // mother
    pushMember(mother, "Mother");

    // father
    pushMember(father, "Father");

    // children
    children.forEach((child) => {
      pushMember(child, "Child");
    });

    return list;
  }, [spouse, mother, father, children]);

  const filteredFamilyData = useMemo(() => {
    return familyData.filter((item) => {
      const q = searchQuery.toLowerCase();

      const matchesSearch =
        !searchQuery ||
        item.name?.toLowerCase().includes(q) ||
        item.relation?.toLowerCase().includes(q) ||
        String(item.age || "").includes(q) ||
        item.dob?.toLowerCase().includes(q);

      return matchesSearch;
    });
  }, [familyData, searchQuery]);

  /* ================= FAMILY ACTIONS ================= */
  const handleAddFamily = () => {
    if (!canManageFamily) {
      notifyWarning("Family details update window is currently closed");
      return;
    }

    setEditingMember(null);
    setFamilyForm({
      id: "",
      name: "",
      relation: "Wife",
      dependent: "Dependant",
      dob: "",
      occupation: "",
      aadhaar: "",
    });
    setShowFamilyForm(true);
  };

  const handleEditFamily = (row) => {
    if (!canManageFamily) {
      notifyWarning("Family details update window is currently closed");
      return;
    }

    console.log("EDIT ROW:", row);
    let formattedDOB = "";

    if (row.dob) {
      const parsedDate = new Date(row.dob);

      if (!isNaN(parsedDate)) {
        const year = parsedDate.getFullYear();
        const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
        const day = String(parsedDate.getDate()).padStart(2, "0");

        formattedDOB = `${year}-${month}-${day}`;
      }
    }

    setEditingMember(row);
    setFamilyForm({
      id: row.id,
      name: row.name || "",
      relation: row.relation || "",
      dependent: row.dependent || "Dependant",
      dob: formattedDOB,
      occupation: row.occupation || "",
      aadhaar: row.aadhaar || "",
    });
    setShowFamilyForm(true);
  };

  const handleDeleteFamily = async (row) => {
    if (!canManageFamily) {
      notifyWarning("Family details update window is currently closed");
      return;
    }

    const result = await confirmAction(
      "Delete Family Member",
      `Are you sure you want to delete ${row.name}?`
    );

    console.log(result);

    if (!result.isConfirmed) {
      console.log("Cancelled");
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

        /* ================= REMOVE MEMBER ================= */

        if (["Wife", "Husband"].includes(row.relation)) {
          updatedSpouse = {};
        } else if (row.relation === "Mother") {
          updatedMother = {};
        } else if (row.relation === "Father") {
          updatedFather = {};
        } else {
          updatedChildren = children.filter(
            (item) => String(item.ID) !== String(row.id),
          );
        }

        /* ================= UPDATE PROFILE ================= */

        setProfile((prev) => ({
          ...prev,
          spouse: updatedSpouse,
          mother: updatedMother,
          father: updatedFather,
          children: updatedChildren,
        }));

        notifySuccess("Family member deleted successfully");
      } else {
        notifyError(res?.message || "Delete failed");
      }
    } catch (error) {
      console.error(error);
      notifyError("Something went wrong while deleting");
    }
  };

  const handleFamilyInputChange = (e) => {
    const { name, value } = e.target;

    setFamilyForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* ================= CALCULATE AGE ================= */
  const calculateAge = (dob) => {
    if (!dob) return "";

    const birthDate = new Date(dob);

    if (isNaN(birthDate)) return "";

    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();

    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  const handleSaveFamily = async () => {
    if (!canManageFamily) {
      notifyWarning("Family details update window is currently closed");
      return;
    }

    if (!familyForm.name || !familyForm.relation) {
      notifyError("Name and Relation are required.");
      return;
    }

    /* ================= AADHAAR VALIDATION ================= */

    const aadhaar = familyForm.aadhaar?.trim();
    if (aadhaar) {
      // only digits allowed
      if (!/^\d+$/.test(aadhaar)) {
        notifyError("Aadhaar number must contain only digits");
        return;
      }

      // must be 12 digits
      if (aadhaar.length !== 12) {
        notifyError("Aadhaar number must be 12 digits");
        return;
      }

      // should not start with 0 or 1
      if (/^[01]/.test(aadhaar)) {
        notifyError("Invalid Aadhaar number");
        return;
      }
    }

    /* ================= DUPLICATE VALIDATION ================= */

    const isDuplicate = familyData.some((member) => {
      // ignore current row while editing
      if (editingMember && String(member.id) === String(familyForm.id)) {
        return false;
      }

      return (
        member.name?.trim().toLowerCase() ===
          familyForm.name?.trim().toLowerCase() &&
        member.relation?.trim().toLowerCase() ===
          familyForm.relation?.trim().toLowerCase()
      );
    });

    if (isDuplicate) {
      notifyError(`Family member already exists with same Name and Relation`);
      return;
    }

    /* ================= DOB formatting ================= */

    let formattedDOB = familyForm.dob;

    if (familyForm.dob) {
      const date = new Date(familyForm.dob);

      if (!isNaN(date)) {
        const day = String(date.getDate()).padStart(2, "0");
        const month = date.toLocaleString("en-IN", {
          month: "short",
        });
        const year = date.getFullYear();

        formattedDOB = `${day}-${month}-${year}`;
      }
    }

    const payload = {
      id: editingMember ? familyForm.id : null,
      name: familyForm.name,
      relation: familyForm.relation,
      dependent: familyForm.dependent || "Dependant",
      dob: formattedDOB,
      occupation: familyForm.occupation,
      aadhaar: familyForm.aadhaar,
    };

    //console.log("SAVE PAYLOAD:", payload);

    try {
      const res = await saveFamilyMember(payload);

      //console.log("SAVE RESPONSE:", res);

      if (res?.status) {
        let updatedChildren = [...children];
        let updatedSpouse = { ...spouse };
        let updatedMother = { ...mother };
        let updatedFather = { ...father };

        const updatedMemberData = {
          ID: familyForm.id || Date.now(),
          FM_NAME: familyForm.name,
          FM_RELATION: familyForm.relation,
          FM_DEP: familyForm.dependent || "Dependant",
          DOB: formattedDOB,
          OCCUPATION: familyForm.occupation,
          AADHAAR: familyForm.aadhaar,
          AGE: calculateAge(familyForm.dob),
        };

        /* ================= UPDATE ================= */
        if (editingMember) {
          if (String(spouse?.ID) === String(familyForm.id)) {
            updatedSpouse = {
              ...updatedSpouse,
              ...updatedMemberData,
            };
          } else if (String(mother?.ID) === String(familyForm.id)) {
            updatedMother = {
              ...updatedMother,
              ...updatedMemberData,
            };
          } else if (String(father?.ID) === String(familyForm.id)) {
            updatedFather = {
              ...updatedFather,
              ...updatedMemberData,
            };
          } else {
            updatedChildren = updatedChildren.map((item) =>
              String(item.ID) === String(familyForm.id)
                ? {
                    ...item,
                    ...updatedMemberData,
                  }
                : item,
            );
          }
        } else {
          /* ================= INSERT ================= */
          if (["Wife", "Husband"].includes(familyForm.relation)) {
            updatedSpouse = updatedMemberData;
          } else if (familyForm.relation === "Mother") {
            updatedMother = updatedMemberData;
          } else if (familyForm.relation === "Father") {
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

        notifySuccess(
          editingMember
            ? "Family member updated successfully"
            : "Family member added successfully",
        );
      } else {
        notifyError(res?.message || "Failed to save family member");
      }
    } catch (error) {
      console.error(error);
      notifyError("Something went wrong while saving");
    }
  };
  /* ================= image upload ================= */

  const fileInputRef = useRef(null);

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  /*const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("profile_image", file);

        const res = await uploadProfileImage(formData);

        if (res?.status) {
            setProfile(prev => ({
                ...prev,
                employee: {
                    ...prev.employee,
                    profile_image: res.image // must be FULL URL from backend
                }
            }));

             // HEADER / GLOBAL USER
            setUser(prev => ({
                ...prev,
                profile_image: res.image
            }));
        }
    };*/

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("profile_image", file);

    const res = await uploadProfileImage(formData);

    if (res?.status) {
      const updatedImage = res.image;

      // PROFILE PAGE
      setProfile((prev) => ({
        ...prev,
        employee: {
          ...prev.employee,
          profile_image: updatedImage,
        },
      }));

      // HEADER / GLOBAL USER
      setUser((prev) => ({
        ...prev,
        profile_image: updatedImage,
      }));

      notifySuccess("Profile image updated successfully");
    }
  };

  const DEFAULT_PROFILE_IMAGE = STOREIMAGES.PROFILE.AVATAR_1;
  const [imgSrc, setImgSrc] = useState(DEFAULT_PROFILE_IMAGE);

  useEffect(() => {
    if (emp?.profile_image && typeof emp.profile_image === "string") {
      setImgSrc(emp.profile_image);
    } else {
      setImgSrc(DEFAULT_PROFILE_IMAGE);
    }
  }, [emp?.profile_image]);

  /* ================= image upload ends ================= */

  /* ================= UI CONFIG ================= */

  const handleChange = (value) => {
    setSearchQuery(value.trim().toLowerCase());
  };

  /* ================= CONDITIONAL RENDER (AFTER HOOKS) ================= */

  if (loading) return <div>Loading Profile...</div>;
  if (!profile || !profile.employee) return <div>No profile data</div>;

  const actionBody = (rowData) => (
    <div className="d-flex align-items-center gap-3">
      <a
        href="#"
        title="Edit Family Member"
        className="text-primary"
        style={{ fontSize: "20px" }}
        onClick={(e) => {
          e.preventDefault();
          handleEditFamily(rowData);
        }}
      >
        <i className="ti ti-edit"></i>
      </a>

      <a
        href="#"
        title="Delete Family Member"
        className="text-danger"
        style={{ fontSize: "20px" }}
        onClick={(e) => {
          e.preventDefault();
          handleDeleteFamily(rowData);
        }}
      >
        <i className="ti ti-trash"></i>
      </a>
    </div>
  );

  /* ================= RENDER ================= */

  return (
    <>
      <div className="page-header">
        <div className="add-item d-flex">
          <div className="page-title">
            <h4>Profile</h4>
            <h6>Manage your profile</h6>
          </div>
        </div>

        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <a href="#">Home</a>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              Profile
            </li>
          </ol>
        </nav>
      </div>

      <div className="row">
        <div className="col-xl-4">
          <div style={{ minHeight: 402 }} className="card">
            <div className="card-header rounded-0 bg-primary d-flex align-items-center">
              {/* Profile Image with Pencil Icon */}
              <div
                style={{
                  position: "relative",
                  width: "80px",
                  height: "80px",
                }}
                className="me-3"
              >
                <span className="avatar avatar-xl avatar-rounded border border-white border-3">
                  <img
                    src={imgSrc}
                    alt="Profile"
                    onError={() => setImgSrc(DEFAULT_PROFILE_IMAGE)}
                  />
                </span>

                {/* Pencil Icon */}
                <a
                  href="#"
                  title="Change Image"
                  onClick={(e) => {
                    e.preventDefault();
                    handleImageClick();
                  }}
                  style={{
                    position: "absolute",
                    bottom: "12px",
                    right: "10px",
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    background: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                    textDecoration: "none",
                    fontSize: "16px",
                    color: "#0d6efd",
                    zIndex: 1,
                  }}
                >
                  <i className="ti ti-pencil"></i>
                </a>

                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  hidden
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </div>

              {/* User Info */}
              <div className="me-3">
                <h3 className="text-white mb-1">
                  {`${emp?.FNAME || ""} ${emp?.LNAME || ""}`.trim()}
                </h3>

                <span
                  className="badge bg-purple-transparent text-purple"
                  style={{ fontSize: "13px" }}
                >
                  {`${emp?.DEPT_NAME || ""} ${emp?.DESIG_NAME || ""}`.trim()}
                </span>
              </div>
            </div>
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between border-bottom pb-2 mb-2">
                <span className="d-inline-flex align-items-center">
                  <i className="ti ti-id me-2" />
                  Employee ID
                </span>
                <p className="text-dark">{`${emp?.EMP_CODE || ""}`.trim()}</p>
              </div>
              <div className="d-flex align-items-center justify-content-between border-bottom pb-2 mb-2">
                <span className="d-inline-flex align-items-center">
                  <i className="ti ti-calendar-check me-2" />
                  Date Of Join
                </span>
                <p className="text-dark">{emp.DOJ}</p>
              </div>
              <div className="d-flex align-items-center justify-content-between border-bottom pb-2 mb-2">
                <span className="d-inline-flex align-items-center">
                  <i className="ti ti-phone me-2" />
                  Mobile
                </span>
                <p className="text-dark">{emp.CELL}</p>
              </div>

              <div className="d-flex align-items-center justify-content-between border-bottom pb-2 mb-2">
                <span className="d-inline-flex align-items-center">
                  <i className="ti ti-mail me-2" />
                  Email (Off)
                </span>
                <p className="text-dark">{emp.COM_EMAIL}</p>
              </div>
              <div className="d-flex align-items-center justify-content-between border-bottom pb-2 mb-2">
                <span className="d-inline-flex align-items-center">
                  <i className="ti ti-mail me-2" />
                  Email (Per)
                </span>
                <p className="text-dark">{emp.PER_EMAIL}</p>
              </div>
              <div className="d-flex align-items-center justify-content-between border-bottom pb-2 mb-2">
                <span className="d-inline-flex align-items-center">
                  <i className="ti ti-calendar-check me-2" />
                  Birthday
                </span>
                <p className="text-dark">{formatDOB(emp.DOB)}</p>
              </div>
              <div className="d-flex align-items-center justify-content-between">
                <span className="d-inline-flex align-items-center">
                  <i className="ti ti-gender-bigender me-2" />
                  Gender
                </span>
                <p className="text-dark">{getGender(emp.GENDER)}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="col-xl-8">
          <div style={{ minHeight: 402 }} className="card">
            <div className="card-body">
              <ul className="nav nav-tabs nav-tabs-bottom border-bottom mb-3">
                <li className="nav-item">
                  <a
                    className="nav-link active"
                    href="#personalDetails"
                    data-bs-toggle="tab"
                  >
                    Personal Details
                  </a>
                </li>
                <li className="nav-item">
                  <a
                    className="nav-link"
                    href="#familyDetails"
                    data-bs-toggle="tab"
                  >
                    Family Details
                  </a>
                </li>
                <li className="nav-item">
                  <a
                    className="nav-link"
                    href="#officeDetails"
                    data-bs-toggle="tab"
                  >
                    Office Details
                  </a>
                </li>
                <li className="nav-item">
                  <a
                    className="nav-link"
                    href="#bankDetails"
                    data-bs-toggle="tab"
                  >
                    Bank & Other Details
                  </a>
                </li>
              </ul>

              <div className="tab-content">
                <div className="tab-pane show active" id="personalDetails">
                  <div className="table-responsive">
                    <table className="table table-nowrap table-sm mb-0">
                      <tbody>
                        <tr>
                          <td>
                            <strong>Full Name:</strong>
                          </td>
                          <td>{getFullName(emp)}</td>
                        </tr>

                        <tr>
                          <td>
                            <strong>Date Of Birth:</strong>
                          </td>
                          <td>{formatDOB(emp.DOB)}</td>
                        </tr>

                        <tr>
                          <td>
                            <strong>Location:</strong>
                          </td>
                          <td>{emp.CITY}</td>
                        </tr>

                        <tr>
                          <td>
                            <strong>Current Address:</strong>
                          </td>
                          <td className="text-wrap">
                            {emp.ADDRESS}, {emp.CITY} - {emp.PINCODE}
                          </td>
                        </tr>

                        <tr>
                          <td>
                            <strong>Permanant Address:</strong>
                          </td>
                          <td className="text-wrap">
                            {emp.PERMNT_ADDRESS}, {emp.PERMNT_CITY} -{" "}
                            {emp.PERMNT_PINCODE}
                          </td>
                        </tr>

                        <tr>
                          <td>
                            <strong>Marital Status:</strong>
                          </td>
                          <td>{getMaritalStatus(emp.M_STATUS)}</td>
                        </tr>

                        <tr>
                          <td>
                            <strong>Blood Group:</strong>
                          </td>
                          <td>{emp.BLOOD_GRP || "Not Given"}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="tab-pane" id="familyDetails">
                  <div className="d-flex justify-content-between align-items-center flex-wrap row-gap-3 mb-3">
                    <input
                      className="form-control"
                      style={{ width: "300px" }}
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {canManageFamily && (
                      <a
                        href="#"
                        title="Add Family Member"
                        className="text-primary"
                        style={{ fontSize: "26px" }}
                        onClick={(e) => {
                          e.preventDefault();
                          handleAddFamily();
                        }}
                      >
                        <i className="ti ti-plus-circle"></i>
                      </a>
                    )}
                  </div>

                  <div className="table-responsive">
                    <DataTable
                      value={filteredFamilyData}
                      dataKey="id"
                      paginator={filteredFamilyData.length > 10}
                      rows={rows}
                      rowsPerPageOptions={[10, 20, 50]}
                      onPage={(e) => setRows(e.rows)}
                      stripedRows
                      showGridlines
                      scrollable
                      responsiveLayout="scroll"
                      removableSort
                      paginatorDropdownAppendTo="self"
                      emptyMessage="No family members found"
                      className="p-datatable-sm"
                    >
                      <Column field="name" header="Name" sortable />

                      <Column field="relation" header="Relation" sortable />

                      <Column field="age" header="Age" sortable />

                      <Column field="dob" header="DOB" sortable />

                      <Column field="aadhaar" header="Aadhaar" sortable />

                      <Column field="dependent" header="Dependent" sortable />

                      {canManageFamily && (
                        <Column
                          header="Actions"
                          body={actionBody}
                          exportable={false}
                          style={{ width: "120px", textAlign: "center" }}
                        />
                      )}
                    </DataTable>
                  </div>
                </div>

                <div className="tab-pane" id="officeDetails">
                  <div className="table-responsive">
                    <table className="table table-nowrap mb-0 table-sm">
                      <tbody>
                        <tr>
                          <td>
                            <strong>Employee ID:</strong>
                          </td>
                          <td>{emp.EMP_CODE}</td>
                        </tr>

                        <tr>
                          <td>
                            <strong>Department:</strong>
                          </td>
                          <td>{emp.DEPT_NAME}</td>
                        </tr>

                        <tr>
                          <td>
                            <strong>Designation:</strong>
                          </td>
                          <td>{emp.DESIG_NAME}</td>
                        </tr>

                        <tr>
                          <td>
                            <strong>Reports To:</strong>
                          </td>
                          <td>{emp.REPORT_TO_NAME}</td>
                        </tr>

                        <tr>
                          <td>
                            <strong>Joining Date:</strong>
                          </td>
                          <td>{emp.DOJ}</td>
                        </tr>

                        <tr>
                          <td>
                            <strong>Confirmation Date:</strong>
                          </td>
                          <td>{emp.DATE_CONF}</td>
                        </tr>

                        <tr>
                          <td>
                            <strong>Shift:</strong>
                          </td>
                          <td>{emp.SHFT_LABEL}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="tab-pane" id="bankDetails">
                  <div className="table-responsive">
                    <table className="table table-nowrap mb-0 table-sm">
                      <tbody>
                        <tr>
                          <td>
                            <strong>Bank Name:</strong>
                          </td>
                          <td>{emp.BANK_NAME}</td>
                        </tr>

                        <tr>
                          <td>
                            <strong>Account Number:</strong>
                          </td>
                          <td>{emp.BANK_ACCT}</td>
                        </tr>

                        <tr>
                          <td>
                            <strong>IFSC:</strong>
                          </td>
                          <td>{emp.AC_IFSC_NO}</td>
                        </tr>

                        <tr>
                          <td>
                            <strong>Branch:</strong>
                          </td>
                          <td>{emp.AC_BRANCH_NAME}</td>
                        </tr>

                        <tr>
                          <td>
                            <strong>Pan Number:</strong>
                          </td>
                          <td>{emp.IT_NO}</td>
                        </tr>

                        <tr>
                          <td>
                            <strong>Aadhaar Number:</strong>
                          </td>
                          <td>{emp.AADHAR_NO}</td>
                        </tr>

                        <tr>
                          <td>
                            <strong>PF (UAN):</strong>
                          </td>
                          <td>{emp.UAN_NO}</td>
                        </tr>

                        <tr>
                          <td>
                            <strong>ESI Number:</strong>
                          </td>
                          <td>{emp.ESIC_NO || "NA"}</td>
                        </tr>

                        <tr>
                          <td>
                            <strong>Working Site:</strong>
                          </td>
                          <td>{emp.WORK_SITE}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= FAMILY MODAL ================= */}
      {showFamilyForm && (
        <div
          className="modal fade show"
          style={{
            display: "block",
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
          tabIndex="-1"
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              {/* Modal Header */}
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingMember ? "Edit Family Member" : "Add Family Member"}
                </h5>

                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowFamilyForm(false)}
                />
              </div>

              {/* Modal Body */}
              <div className="modal-body">
                <div className="row g-3">
                  {/* Name */}
                  <div className="col-md-6">
                    <label className="form-label">
                      Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="name"
                      value={familyForm.name}
                      onChange={handleFamilyInputChange}
                      placeholder="Enter Name"
                    />
                  </div>

                  {/* Relation Dropdown */}
                  <div className="col-md-6">
                    <label className="form-label">
                      Relation <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select"
                      name="relation"
                      value={familyForm.relation}
                      onChange={handleFamilyInputChange}
                    >
                      <option value="Wife">Wife</option>
                      <option value="Husband">Husband</option>
                      <option value="Mother">Mother</option>
                      <option value="Father">Father</option>
                      <option value="Son">Son</option>
                      <option value="Daughter">Daughter</option>
                    </select>
                  </div>

                  {/* Dependency */}
                  <div className="col-md-6">
                    <label className="form-label">
                      Dependent <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select"
                      name="dependent"
                      value={familyForm.dependent}
                      onChange={handleFamilyInputChange}
                    >
                      <option value="Dependant">Dependant</option>
                      <option value="Non-Dependant">Non-Dependant</option>
                      <option value="Deceased">Deceased</option>
                      <option value="Not-Applicable">Not-Applicable</option>
                    </select>
                  </div>

                  {/* DOB Datepicker */}
                  <div className="col-md-6">
                    <label className="form-label">Date of Birth</label>
                    <input
                      type="date"
                      className="form-control"
                      name="dob"
                      value={familyForm.dob}
                      onChange={handleFamilyInputChange}
                    />
                  </div>

                  {/* Occupation */}
                  <div className="col-md-6">
                    <label className="form-label">Occupation</label>
                    <input
                      type="text"
                      className="form-control"
                      name="occupation"
                      value={familyForm.occupation}
                      onChange={handleFamilyInputChange}
                      placeholder="Enter Occupation"
                    />
                  </div>

                  {/* Aadhar */}
                  <div className="col-md-6">
                    <label className="form-label">Aadhaar</label>
                    <input
                      type="text"
                      className="form-control"
                      name="aadhaar"
                      value={familyForm.aadhaar}
                      maxLength={12}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "");

                        setFamilyForm((prev) => ({
                          ...prev,
                          aadhaar: value,
                        }));
                      }}
                      placeholder="Enter 12 Digit Aadhaar Number"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowFamilyForm(false)}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSaveFamily}
                >
                  {editingMember ? "Update" : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MyProfile;
