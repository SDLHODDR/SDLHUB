import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { Dropdown } from "primereact/dropdown";
import { MultiSelect } from "primereact/multiselect";

import SDLDataTable from "../../../../components/datatable/SDLDataTable";
import SDLSearch from "../../../../components/datatable/SDLSearch";
import BreadcrumbNav from "../../components/breadcrumb-nav/BreadcrumbNav";

import {
  notifySuccess,
  notifyError,
  notifyWarning,
  confirmAction,
} from "../../../../services/alertService";

import {
  getEmployeeAccessEmployees,
  getEmployeeAccess,
  saveEmployeeAccess,
  disableEmployeeAccess,
} from "../../services/employeeAccessService";

import { getPortalFromPath } from "../../../../config/portalConfig";

import "../../assets/css/employeeAccess.css";

const EmployeeAccess = () => {
  /* ==========================================================
     PORTAL
  ========================================================== */

  const location = useLocation();

  const portal = getPortalFromPath(location.pathname);

  const portalHome = `/${portal.key}/dashboard`;

  /* ==========================================================
     STATE
  ========================================================== */

  const [employees, setEmployees] = useState([]);

  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const [profileOptions, setProfileOptions] = useState([]);

  const [selectedProfiles, setSelectedProfiles] = useState([]);

  const [employeeProfiles, setEmployeeProfiles] = useState([]);

  const [loadingEmployees, setLoadingEmployees] = useState(false);

  const [loadingAccess, setLoadingAccess] = useState(false);

  const [saving, setSaving] = useState(false);

  const [disablingId, setDisablingId] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");

  /* ==========================================================
     LOAD EMPLOYEES
  ========================================================== */

  useEffect(() => {
    const loadEmployees = async () => {
      try {
        setLoadingEmployees(true);

        const res = await getEmployeeAccessEmployees();

        if (res?.status) {
          setEmployees(Array.isArray(res.data) ? res.data : []);
        } else {
          notifyError(res?.message || "Unable to load employees.");
        }
      } catch (error) {
        console.error("Load employees error:", error);

        notifyError(error?.message || "Unable to load employees.");
      } finally {
        setLoadingEmployees(false);
      }
    };

    loadEmployees();
  }, []);

  /* ==========================================================
     LOAD EMPLOYEE ACCESS
  ========================================================== */

  const loadEmployeeAccess = async (employee) => {
    if (!employee) {
      setProfileOptions([]);
      setSelectedProfiles([]);
      setEmployeeProfiles([]);
      return;
    }

    try {
      setLoadingAccess(true);

      const res = await getEmployeeAccess(employee);

      if (res?.status) {
        const data = res.data || {};

        setProfileOptions(
          Array.isArray(data.availableProfiles) ? data.availableProfiles : [],
        );

        setEmployeeProfiles(
          Array.isArray(data.assignedProfiles) ? data.assignedProfiles : [],
        );

        /*
         * New profiles are selected by user,
         * therefore initially empty.
         */

        setSelectedProfiles([]);
      } else {
        notifyError(res?.message || "Unable to load employee access.");

        setProfileOptions([]);
        setSelectedProfiles([]);
        setEmployeeProfiles([]);
      }
    } catch (error) {
      console.error("Load employee access error:", error);

      notifyError(error?.message || "Unable to load employee access.");
    } finally {
      setLoadingAccess(false);
    }
  };

  /* ==========================================================
     EMPLOYEE CHANGE
  ========================================================== */

  const handleEmployeeChange = async (e) => {
    const employee = e.value;

    setSelectedEmployee(employee);

    await loadEmployeeAccess(employee);
  };

  /* ==========================================================
     PROFILE CHANGE
  ========================================================== */

  const handleProfileChange = (e) => {
    setSelectedProfiles(e.value || []);
  };

  /* ==========================================================
     SAVE
  ========================================================== */

  const handleSave = async () => {
    if (!selectedEmployee) {
      notifyWarning("Please select an employee.");
      return;
    }

    if (!selectedProfiles || selectedProfiles.length === 0) {
      notifyWarning("Please select at least one profile.");
      return;
    }

    const confirmed = await confirmAction(
      "Save Employee Access?",
      "Are you sure you want to assign the selected profiles to this employee?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setSaving(true);

      const payload = {
        employee: String(selectedEmployee),

        profileIds: selectedProfiles.map((profile) =>
          String(profile?.profileId ?? profile?.id ?? profile),
        ),
      };

      console.log("Saving employee access:", payload);

      const res = await saveEmployeeAccess(payload);

      if (res?.status) {
        notifySuccess(res?.message || "Employee access saved successfully.");

        /*
         * Reload employee data so:
         *
         * 1. newly assigned profiles disappear
         *    from MultiSelect
         *
         * 2. newly assigned profiles appear
         *    in DataTable
         */

        await loadEmployeeAccess(selectedEmployee);
      } else {
        notifyError(res?.message || "Unable to save employee access.");
      }
    } catch (error) {
      console.error("Save employee access error:", error);

      notifyError(error?.message || "Unable to save employee access.");
    } finally {
      setSaving(false);
    }
  };

  /* ==========================================================
     DISABLE
  ========================================================== */

  const handleDisable = async (row) => {
  const id = row?.id;

  if (!id) {
    notifyError("Invalid access record.");
    return;
  }

  const confirmed = await confirmAction(
    "Disable Profile Access?",
    `Are you sure you want to disable "${row.profile}" access?`,
  );

  if (!confirmed) {
    return;
  }

  try {
    setDisablingId(id);

    const res = await disableEmployeeAccess(id);

    if (res?.status) {
      notifySuccess(
        res?.message || "Profile access disabled successfully."
      );

      const refreshed = await getEmployeeAccess(selectedEmployee);

      console.log("AFTER DISABLE - getEmployeeAccess:", refreshed);

      if (refreshed?.status) {
        const data = refreshed.data || {};

        setProfileOptions(
          Array.isArray(data.availableProfiles)
            ? data.availableProfiles
            : []
        );

        setEmployeeProfiles(
          Array.isArray(data.assignedProfiles)
            ? data.assignedProfiles
            : []
        );

        setSelectedProfiles([]);
      }
    } else {
      notifyError(
        res?.message || "Unable to disable profile access."
      );
    }
  } catch (error) {
    console.error("Disable employee access error:", error);

    notifyError(
      error?.message || "Unable to disable profile access."
    );
  } finally {
    setDisablingId(null);
  }
};

  /* ==========================================================
     RESET
  ========================================================== */

  const handleReset = () => {
    setSelectedEmployee(null);
    setProfileOptions([]);
    setSelectedProfiles([]);
    setEmployeeProfiles([]);
  };

  /* ==========================================================
     EMPLOYEE OPTIONS
  ========================================================== */

  const employeeOptions = useMemo(() => {
    return employees.map((employee) => ({
      label: employee.label || `${employee.empCode} - ${employee.empName}`,

      value: employee.empCode || employee.id,
    }));
  }, [employees]);

  /* ==========================================================
     PROFILE LABEL
  ========================================================== */

  const profileOptionTemplate = (option) => {
    return (
      <div className="employee-profile-option">
        {option.label || option.profileDesc}
      </div>
    );
  };


  /* ==========================================================
   SEARCH FILTER
    ========================================================== */

    const filteredEmployeeProfiles = useMemo(() => {
    if (!searchQuery.trim()) {
        return employeeProfiles;
    }

    const query = searchQuery.trim().toLowerCase();

    return employeeProfiles.filter((item) => {
        return (
        String(item.employee ?? "").toLowerCase().includes(query) ||
        String(item.profile ?? "").toLowerCase().includes(query) ||
        String(item.effecFrom ?? "").toLowerCase().includes(query) ||
        String(item.effecTo ?? "").toLowerCase().includes(query)
        );
    });
    }, [searchQuery, employeeProfiles]);

  /* ==========================================================
     TABLE COLUMNS
  ========================================================== */

  const profileColumns = useMemo(
    () => [
      {
        field: "employee",
        header: "Employee",
      },

      {
        field: "profile",
        header: "Profile",
      },

      {
        field: "effecFrom",
        header: "Effec From",
      },

      {
        field: "effecTo",
        header: "Effec To",
      },

      {
        field: "action",
        header: "Action",

        body: (row) => {
          if (!row.active) {
            return <span className="text-muted">-</span>;
          }

          return (
            <button
            type="button"
            className="btn btn-icon btn-sm employee-disable-btn"
            onClick={() => handleDisable(row)}
            disabled={disablingId === row.id}
            title="Disable Profile Access"
            aria-label="Disable Profile Access"
            >
            {disablingId === row.id ? (
                <span
                className="spinner-border spinner-border-sm"
                role="status"
                aria-hidden="true"
                />
            ) : (
                <i className="ti ti-ban"></i>
            )}
            </button>
          );
        },
      },
    ],
    [disablingId],
  );

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <>
      {/* ======================================================
          PAGE HEADER
      ====================================================== */}

      <div className="page-header">
        <div className="add-item d-flex">
          <div className="page-title">
            <h4>Employee Access</h4>
          </div>
        </div>

        <BreadcrumbNav
          items={[
            {
              text: "Home",
              link: portalHome,
            },

            {
              text: "Employee Access",
            },
          ]}
        />
      </div>

      {/* ======================================================
          MAIN CARD
      ====================================================== */}

      <div className="card hrms-employee-access">
        <div className="card-body">
          {/* ==================================================
              FORM
          ================================================== */}

          <div className="row g-3">
            {/* ==================================================
                EMPLOYEE
            ================================================== */}

            <div className="col-md-4">
                <div className="form-group">
                    <label className="form-label">Employee</label>

                    <Dropdown
                    value={selectedEmployee}
                    options={employeeOptions}
                    onChange={handleEmployeeChange}
                    placeholder="Select Employee"
                    className="w-100"
                    filter
                    filterBy="label"
                    showClear
                    disabled={loadingEmployees || saving || loadingAccess}
                    emptyMessage="No employees found"
                    emptyFilterMessage="No employees found"
                    />
                </div>
            </div>


            {/* ==================================================
                PROFILE
            ================================================== */}

            <div className="col-md-8">
                <div className="form-group">
                    <label className="form-label">Profile</label>

                    <MultiSelect
                    value={selectedProfiles}
                    options={profileOptions}
                    onChange={handleProfileChange}
                    optionLabel="label"
                    optionValue="id"
                    itemTemplate={profileOptionTemplate}
                    placeholder={
                        selectedEmployee
                        ? "Select Profile(s)"
                        : "Select Employee First"
                    }
                    className="w-100 employee-profile-multiselect"
                    display="chip"
                    filter
                    filterBy="label"
                    showClear
                    disabled={!selectedEmployee || loadingAccess || saving}
                    emptyMessage="No profiles available"
                    emptyFilterMessage="No profiles found"
                    />
                </div>
            </div>
          </div>

          {/* ==================================================
              BUTTONS
          ================================================== */}

          <div className="employee-access-actions">
            <button
              type="button"
              className="btn btn-primary me-2"
              onClick={handleSave}
              disabled={
                saving ||
                loadingAccess ||
                !selectedEmployee ||
                selectedProfiles.length === 0
              }
            >
              {saving ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-1"
                    role="status"
                    aria-hidden="true"
                  />
                  Saving...
                </>
              ) : (
                <>                
                  Save
                </>
              )}
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleReset}
              disabled={saving || loadingAccess}
            >             
              Cancel
            </button>
          </div>

          {/* ======================================================
                TABLE
            ====================================================== */}

            <div className="employee-access-table">

                {/* ==================================================
                    TABLE SEARCH
                ================================================== */}

                <div className="row mb-3">
                    <div className="col-lg-4 col-md-6 col-12">
                    <SDLSearch
                        value={searchQuery}
                        onChange={setSearchQuery}
                        placeholder="Search Profile Access..."
                    />
                    </div>
                </div>

                {/* ==================================================
                    DATA TABLE
                ================================================== */}

                <SDLDataTable
                    data={filteredEmployeeProfiles}
                    columns={profileColumns}
                    loading={loadingAccess}
                    emptyMessage={
                    selectedEmployee
                        ? "No profile access found."
                        : "Select an employee to view profile access."
                    }
                    paginator
                    rows={10}
                    className="employee-access-grid"
                    removableSort
                />

            </div>
        </div>
      </div>
    </>
  );
};

export default EmployeeAccess;
