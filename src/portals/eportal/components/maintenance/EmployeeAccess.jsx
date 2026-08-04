import { useState, useEffect, useMemo, useRef } from "react";
import Select from "react-select";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";

import {
  getEmployeeAccessDropdowns,
  getEmployeeAccessData,
  saveEmployeeProfiles,
} from "../../services/employeeAccessService";

import {
  notifySuccess,
  notifyError,
  notifyWarning,
  confirmAction,
} from "../../../../services/alertService";

import BreadcrumbNav from "../breadcrumb-nav/BreadcrumbNav";

import { EMPLOYEE_ACCESS_MESSAGES } from "../../constants/employeeAccessConstants";

import { getPortalFromPath } from "../../../../config/portalConfig";

const EmployeeAccess = () => {
  const [companies, setCompanies] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedDivision, setSelectedDivision] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState(null);

  const [profiles, setProfiles] = useState([]);
  const [groups, setGroups] = useState([]);

  const [selectedGroups, setSelectedGroups] = useState({});
  const [selectedEmployees, setSelectedEmployees] = useState({}); //Tracks checked employee rows for editing/saving.
  const [collapsedGroups, setCollapsedGroups] = useState({});
  const [employeeFilter, setEmployeeFilter] = useState(null); //Tracks the employee selected in the filter dropdown before clicking Show Dat

  const [loadingDropdowns, setLoadingDropdowns] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [saving, setSaving] = useState(false);

  const [dataLoaded, setDataLoaded] = useState(false);

  /* ---------------- useRef GUARD ---------------- */
  const hasFetchedDropdowns = useRef(false);

    // Get current portal dynamically
  const portal = getPortalFromPath(location.pathname);
  const portalHome = `/${portal.key}/dashboard`;

  /* ---------------- LOAD DROPDOWNS ---------------- */

useEffect(() => {
  if (hasFetchedDropdowns.current) return;

  hasFetchedDropdowns.current = true;

  const loadDropdowns = async () => {
    setLoadingDropdowns(true);

    try {
      // Initial call only loads common dropdowns.
      // Employee list will be loaded after company selection.
      const res = await getEmployeeAccessDropdowns();

      if (res?.status) {
        const data = res.data || {};

        setCompanies(data.companies || []);
        setDivisions(data.divisions || []);
        setDepartments(data.departments || []);

        // Don't load all employees initially
        setEmployees([]);
      } else {
        notifyError(
          res?.message || EMPLOYEE_ACCESS_MESSAGES.DROPDOWN_LOAD_FAILED,
        );
      }
    } catch (error) {
      console.error("Dropdown load error:", error);

      notifyError(
        error?.message || EMPLOYEE_ACCESS_MESSAGES.DROPDOWN_LOAD_ERROR,
      );
    } finally {
      setLoadingDropdowns(false);
    }
  };

  loadDropdowns();
}, []);


/* ---------------- COMPANY CHANGE ---------------- */

const handleCompanyChange = async (selected) => {
  setSelectedCompany(selected);

  // Reset dependent dropdowns
  setSelectedDivision(null);
  setSelectedDepartment(null);
  setEmployeeFilter(null);

  // Reset employees
  setEmployees([]);

  // Reset displayed data
  setGroups([]);
  setProfiles([]);
  setSelectedGroups({});
  setSelectedEmployees({});
  setCollapsedGroups({});
  setDataLoaded(false);

  // No company selected
  if (!selected?.value) {
    return;
  }

  try {
    setLoadingDropdowns(true);

    const res = await getEmployeeAccessDropdowns({
      companyId: selected.value,
      divisionId: "",
      departmentId: "",
    });

    if (res?.status) {
      const data = res.data || {};

      // Employees filtered by company
      setEmployees(data.employees || []);
    } else {
      setEmployees([]);

      notifyError(
        res?.message ||
          EMPLOYEE_ACCESS_MESSAGES.DROPDOWN_LOAD_FAILED,
      );
    }
  } catch (error) {
    console.error("Employee dropdown load error:", error);

    setEmployees([]);

    notifyError(
      error?.message ||
        EMPLOYEE_ACCESS_MESSAGES.DROPDOWN_LOAD_FAILED,
    );
  } finally {
    setLoadingDropdowns(false);
  }
};

/* ---------------- DIVISION CHANGE ---------------- */

const handleDivisionChange = async (selected) => {
  setSelectedDivision(selected);

  // Reset dependent dropdowns
  setSelectedDepartment(null);
  setEmployeeFilter(null);

  // Reset employees
  setEmployees([]);

  // Reset displayed data
  setGroups([]);
  setProfiles([]);
  setSelectedGroups({});
  setSelectedEmployees({});
  setCollapsedGroups({});
  setDataLoaded(false);

  if (!selectedCompany?.value) {
    return;
  }

  try {
    setLoadingDropdowns(true);

    const res = await getEmployeeAccessDropdowns({
      companyId: selectedCompany.value,
      divisionId: selected?.value || "",
      departmentId: "",
    });

    if (res?.status) {
      const data = res.data || {};

      setEmployees(data.employees || []);
    } else {
      setEmployees([]);

      notifyError(
        res?.message ||
          EMPLOYEE_ACCESS_MESSAGES.DROPDOWN_LOAD_FAILED,
      );
    }
  } catch (error) {
    console.error("Employee dropdown load error:", error);

    setEmployees([]);

    notifyError(
      error?.message ||
        EMPLOYEE_ACCESS_MESSAGES.DROPDOWN_LOAD_FAILED,
    );
  } finally {
    setLoadingDropdowns(false);
  }
};


/* ---------------- DEPARTMENT CHANGE ---------------- */

const handleDepartmentChange = async (selected) => {
  setSelectedDepartment(selected);

  // Reset employee
  setEmployeeFilter(null);

  // Reset displayed data
  setGroups([]);
  setProfiles([]);
  setSelectedGroups({});
  setSelectedEmployees({});
  setCollapsedGroups({});
  setDataLoaded(false);

  if (!selectedCompany?.value) {
    return;
  }

  try {
    setLoadingDropdowns(true);

    const res = await getEmployeeAccessDropdowns({
      companyId: selectedCompany.value,
      divisionId: selectedDivision?.value || "",
      departmentId: selected?.value || "",
    });

    if (res?.status) {
      const data = res.data || {};

      setEmployees(data.employees || []);
    } else {
      setEmployees([]);

      notifyError(
        res?.message ||
          EMPLOYEE_ACCESS_MESSAGES.DROPDOWN_LOAD_FAILED,
      );
    }
  } catch (error) {
    console.error("Employee dropdown load error:", error);

    setEmployees([]);

    notifyError(
      error?.message ||
        EMPLOYEE_ACCESS_MESSAGES.DROPDOWN_LOAD_FAILED,
    );
  } finally {
    setLoadingDropdowns(false);
  }
};

/* ---------------- COMPANY CHANGE ----------------

const handleCompanyChange = async (selected) => {
  setSelectedCompany(selected);

  // Reset employee selection whenever company changes
  setEmployeeFilter(null);
  setEmployees([]);

  // Reset currently displayed data
  setGroups([]);
  setProfiles([]);
  setSelectedGroups({});
  setSelectedEmployees({});
  setCollapsedGroups({});
  setDataLoaded(false);

  // No company selected
  if (!selected?.value) {
    return;
  }

  try {
    setLoadingDropdowns(true);

    //const res = await getEmployeeAccessDropdowns(selected.value);

    const res = awaitgetEmployeeAccessDropdowns({
                companyId,
                divisionId,
                departmentId,
              });

    if (res?.status) {
      const data = res.data || {};

      // Only employees belonging to selected company
      setEmployees(data.employees || []);
    } else {
      setEmployees([]);

      notifyError(
        res?.message || EMPLOYEE_ACCESS_MESSAGES.DROPDOWN_LOAD_FAILED,
      );
    }
  } catch (error) {
    console.error("Employee dropdown load error:", error);

    setEmployees([]);

    notifyError(
      error?.message || EMPLOYEE_ACCESS_MESSAGES.DROPDOWN_LOAD_FAILED,
    );
  } finally {
    setLoadingDropdowns(false);
  }
};
*/
  /* ---------------- SHOW DATA ---------------- */

  const handleShowData = async () => {
    if (!selectedCompany) {
      notifyWarning("Please select Company");
      return;
    }

    try {
      setLoadingData(true);

      setGroups([]);
      setProfiles([]);
      setSelectedGroups({});
      setSelectedEmployees({});
      setCollapsedGroups({});
      setDataLoaded(false);

      const res = await getEmployeeAccessData({
        company: selectedCompany?.value || "",
        division: selectedDivision?.value || "",
        department: selectedDepartment?.value || "",
        employee: employeeFilter?.value || "",
      });

      if (res?.status) {
        const data = res.data || {};

        setProfiles(data.profiles || []);
        setGroups(data.groups || []);
        setDataLoaded(true);
      } else {
        notifyError(res?.message || EMPLOYEE_ACCESS_MESSAGES.DATA_LOAD_FAILED);
      }
    } catch (error) {
      notifyError(error?.message || EMPLOYEE_ACCESS_MESSAGES.DATA_LOAD_FAILED);
    } finally {
      setLoadingData(false);
    }
  };

  /* ---------------- PROFILE OPTIONS ---------------- */

  const profileOptions = useMemo(
    () =>
      profiles.map((p) => ({
        value: p.PROFILE_ID,
        label: p.PROFILE_DESC,
      })),
    [profiles],
  );

  /* ---------------- TOGGLES ---------------- */

  const toggleCollapse = (groupCode) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [groupCode]: !prev[groupCode],
    }));
  };

  const toggleGroup = (group) => {
    const isChecked = !selectedGroups[group.groupCode];
    const updatedEmployees = { ...selectedEmployees };

    (group.employees || []).forEach((emp) => {
      updatedEmployees[emp.empCode] = isChecked;
    });

    setSelectedEmployees(updatedEmployees);
    setSelectedGroups((prev) => ({
      ...prev,
      [group.groupCode]: isChecked,
    }));
  };

  const toggleEmployee = (empCode) => {
    setSelectedEmployees((prev) => ({
      ...prev,
      [empCode]: !prev[empCode],
    }));
  };

  /* ---------------- PROFILE CHANGE ---------------- */

  const handleGroupProfileChange = (groupCode, selected) => {
    const profileIds = selected ? selected.map((p) => p.value) : [];

    const updated = groups.map((group) => {
      if (group.groupCode === groupCode) {
        return {
          ...group,
          employees: (group.employees || []).map((emp) => ({
            ...emp,
            profiles: profileIds,
          })),
        };
      }
      return group;
    });

    setGroups(updated);
  };

  const handleEmployeeProfileChange = (empCode, selected) => {
    const profileIds = selected ? selected.map((p) => p.value) : [];

    const updated = groups.map((group) => ({
      ...group,
      employees: (group.employees || []).map((emp) =>
        emp.empCode === empCode ? { ...emp, profiles: profileIds } : emp,
      ),
    }));

    setGroups(updated);
  };

  /* ---------------- SAVE ---------------- */

  const handleSave = async () => {
    let payload = [];
    let hasSelection = false;

    for (const group of groups) {
      for (const emp of group.employees || []) {
        const groupSelected = selectedGroups[group.groupCode];
        const empSelected = selectedEmployees[emp.empCode];

        if (groupSelected || empSelected) {
          hasSelection = true;

          if (!emp.profiles || emp.profiles.length === 0) {
            notifyWarning(
              `${EMPLOYEE_ACCESS_MESSAGES.PROFILE_REQUIRED} ${emp.empName}`,
            );
            return;
          }

          payload.push({
            empCode: emp.empCode,
            profiles: emp.profiles,
          });
        }
      }
    }

    if (!hasSelection) {
      notifyWarning(EMPLOYEE_ACCESS_MESSAGES.NO_SELECTION);
      return;
    }

    const confirm = await confirmAction(
      EMPLOYEE_ACCESS_MESSAGES.SAVE_CONFIRM_TITLE,
      EMPLOYEE_ACCESS_MESSAGES.SAVE_CONFIRM_MESSAGE,
    );

    if (!confirm) return;

    try {
      setSaving(true);

      const res = await saveEmployeeProfiles(payload);

      if (res?.status) {
        notifySuccess(res.message);
        await handleShowData();
      } else {
        notifyError(res?.message || EMPLOYEE_ACCESS_MESSAGES.SAVE_FAILED);
      }
    } catch {
      notifyError(EMPLOYEE_ACCESS_MESSAGES.SAVE_ERROR);
    } finally {
      setSaving(false);
    }
  };

  const selectStyles = {
    control: (base) => ({
      ...base,
      minHeight: "38px",
    }),
    valueContainer: (base) => ({
      ...base,
      maxHeight: "36px",
      overflowY: "auto",
    }),
    // This targets the "chips" in a multi-select
    multiValue: (base) => ({
      ...base,
      backgroundColor: "#e9ecee", // Set your background color here
    }),
    // This targets the text inside the chips
    multiValueLabel: (base) => ({
      ...base,
      color: "#646B72",
    }),
    // This targets the 'x' remove button
    multiValueRemove: (base) => ({
      ...base,
      color: "#646B72",
      ":hover": {
        backgroundColor: "#c5ccd0",
        color: "#646B72",
      },
    }),
  };

  return (
    <>
      <div className="page-header">
        <div className="add-item d-flex">
          <div className="page-title">
            <h4> Employee Access</h4>
          </div>
        </div>

        <BreadcrumbNav
          items={[
            { text: "Home", link: portalHome },
            { text: "Employee Access" },
          ]}
        />
      </div>
      <div className="card">
        {/* FILTER */}
        <div className="card-body row">
          <div className="col-lg-3">
            <label className="form-label mb-2">Company</label>
            <Select
              options={companies}
              value={selectedCompany}
              onChange={handleCompanyChange}
              isLoading={loadingDropdowns}
              isClearable
              placeholder="Select Company"
              menuPortalTarget={document.body}
              menuPosition="fixed"
            />
          </div>

          <div className="col-lg-2">
            <label className="form-label mb-2">Division</label>
            <Select
              options={divisions}
              value={selectedDivision}
              onChange={handleDivisionChange}
              isDisabled={!selectedCompany}
              isClearable
              placeholder="Select Division"
              menuPortalTarget={document.body}
              menuPosition="fixed"
            />
          </div>

          <div className="col-lg-2 d-grid align-self-end">
            <label className="form-label mb-2">Department</label>
            <Select
                options={departments}
                value={selectedDepartment}
                onChange={handleDepartmentChange}
                isDisabled={!selectedCompany}
                isClearable
                placeholder="Select Department"
                menuPortalTarget={document.body}
                menuPosition="fixed"
              />
          </div>

         <div className="col-lg-3">
  <label className="form-label mb-2">Employee</label>

  <Select
    options={employees}
    value={employeeFilter}
    onChange={setEmployeeFilter}
    isClearable
    isDisabled={!selectedCompany || loadingDropdowns}
    isLoading={loadingDropdowns}
    placeholder={
      selectedCompany
        ? "Select Employee"
        : "Select Company First"
    }
    noOptionsMessage={() =>
      selectedCompany
        ? "No employees found"
        : "Select Company First"
    }
    menuPortalTarget={document.body}
    menuPosition="fixed"
  />
</div>

          <div className="col-lg-2 d-flex align-items-end">
            <button
              className="btn btn-warning w-100"
              onClick={handleShowData}
              disabled={loadingData}
            >
              {loadingData ? "Loading..." : "Show Data"}
            </button>
          </div>
        </div>

        {/* LOADING */}
        {loadingData && (
          <div className="card p-4 text-center mt-3">
            <div className="spinner-border text-primary"></div>
            <div className="mt-2">Loading data...</div>
          </div>
        )}

        {/* EMPTY */}
        {!loadingData && dataLoaded && groups.length === 0 && (
          <div className="card text-center p-5 mt-3">
            <div style={{ fontSize: "50px", opacity: 0.7 }}>📭</div>
            <h5 className="mt-3">No Data Found</h5>
          </div>
        )}

        {/* GROUPS */}
        {!loadingData &&
          groups.map((group) => {
            const groupProfiles = profileOptions.filter((opt) =>
              (group.employees || []).every((emp) =>
                emp.profiles?.includes(opt.value),
              ),
            );

            return (
              <div
                className="card mb-3 shadow-sm border-0 mx-3"
                key={group.groupCode}
                style={{
                  background: "#f8fafc",
                }}
              >
                <div
                  className="card-header d-flex align-items-center"
                  style={{
                    background: "#e8f1ff",
                    padding: "0.5rem",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedGroups[group.groupCode] || false}
                    onChange={() => toggleGroup(group)}
                    className="form-check-input me-2"
                  />

                  <b
                    onClick={() => toggleCollapse(group.groupCode)}
                    style={{ cursor: "pointer" }}
                  >
                    <FontAwesomeIcon
                      icon={
                        collapsedGroups[group.groupCode]
                          ? faChevronRight
                          : faChevronDown
                      }
                      style={{ marginRight: "6px", fontSize: "12px" }}
                    />
                    {group.groupCode} - {group.groupName}
                  </b>

                  <div className="ms-auto" style={{ width: 350 }}>
                    <Select
                      isMulti
                      options={profileOptions}
                      value={groupProfiles}
                      styles={selectStyles}
                      isDisabled={!selectedGroups[group.groupCode]}
                      onChange={(opts) =>
                        handleGroupProfileChange(group.groupCode, opts)
                      }
                      menuPortalTarget={document.body}
                      menuPosition="fixed"
                    />
                  </div>
                </div>

                {!collapsedGroups[group.groupCode] && (
                  <div className="card-body p-2">
                    {(group.employees || []).map((emp) => {
                      const selectedProfiles = profileOptions.filter((opt) =>
                        emp.profiles?.includes(opt.value),
                      );

                      return (
                        <div key={emp.empCode} className="row mb-2">
                          <div className="col-md-4 d-flex align-items-center">
                            <input
                              type="checkbox"
                              className="form-check-input me-2"
                              checked={selectedEmployees[emp.empCode] || false}
                              onChange={() => toggleEmployee(emp.empCode)}
                            />
                            <span
                              style={{ cursor: "pointer" }}
                              onClick={() => toggleEmployee(emp.empCode)}
                            >
                              {emp.empName}
                            </span>
                          </div>

                          <div className="col-md-8">
                            <Select
                              isMulti
                              options={profileOptions}
                              value={selectedProfiles}
                              styles={selectStyles}
                              isDisabled={!selectedEmployees[emp.empCode]}
                              onChange={(opts) =>
                                handleEmployeeProfileChange(emp.empCode, opts)
                              }
                              menuPortalTarget={document.body}
                              menuPosition="fixed"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

        {/* SAVE */}
        {groups.length > 0 && (
          <div
            className="text-center"
            style={{
              marginTop: "30px",
              marginBottom: "50px",
            }}
          >
            <button
              className="btn btn-primary"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Profile Assignment"}
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default EmployeeAccess;
