import { useContext, useState, useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../../../auth/AuthProvider";
import Select from "react-select";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronRight } from "@fortawesome/free-solid-svg-icons";

import {
    getEmployeeAccessDropdowns,
    getEmployeeAccessData,
    saveEmployeeProfiles
} from "../../services/employeeAccessService";

import {
    notifySuccess,
    notifyError,
    notifyWarning,
    confirmAction
} from "../../../../services/alertService";

const EmployeeAccess = () => {

    const { user } = useContext(AuthContext);

    const [companies, setCompanies] = useState([]);
    const [divisions, setDivisions] = useState([]);
    const [departments, setDepartments] = useState([]);

    const [selectedCompany, setSelectedCompany] = useState(null);
    const [selectedDivision, setSelectedDivision] = useState(null);
    const [selectedDepartment, setSelectedDepartment] = useState(null);

    const [profiles, setProfiles] = useState([]);
    const [groups, setGroups] = useState([]);

    const [selectedGroups, setSelectedGroups] = useState({});
    const [selectedEmployees, setSelectedEmployees] = useState({});
    const [collapsedGroups, setCollapsedGroups] = useState({});

    const [loadingDropdowns, setLoadingDropdowns] = useState(false);
    const [loadingData, setLoadingData] = useState(false);
    const [saving, setSaving] = useState(false);

    const [dataLoaded, setDataLoaded] = useState(false);

    /* ---------------- useRef GUARD ---------------- */
    const hasFetchedDropdowns = useRef(false);

    /* ---------------- LOAD DROPDOWNS ---------------- */

    useEffect(() => {

        if (hasFetchedDropdowns.current) return;
        
        hasFetchedDropdowns.current = true;

        const loadDropdowns = async () => {
            setLoadingDropdowns(true);
            try {
                const res = await getEmployeeAccessDropdowns();
                if (res.status) {
                    setCompanies(res.companies || []);
                    setDivisions(res.divisions || []);
                    setDepartments(res.departments || []);
                } else {
                    notifyError("Failed to load dropdown data");
                }
            } catch {
                notifyError("Error loading dropdown data");
            }
            setLoadingDropdowns(false);
        };
        loadDropdowns();
    }, []);

    /* ---------------- SHOW DATA ---------------- */

    const handleShowData = async () => {
        /*if (!selectedCompany || !selectedDivision || !selectedDepartment) {
            notifyWarning("Please select Company, Division and Department");
            return;
        }*/

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
                department: selectedDepartment?.value || ""
            });


            if (res.status) {
                setProfiles(res.profiles || []);
                setGroups(res.groups || []);
                setDataLoaded(true);
            } else {
                notifyError("Failed to load employee access data");
            }

        } catch {
            notifyError("Error fetching employee access data");
        } finally {
            setLoadingData(false);
        }
    };

    /* ---------------- PROFILE OPTIONS ---------------- */

    const profileOptions = useMemo(() =>
        profiles.map(p => ({
            value: p.PROFILE_ID,
            label: p.PROFILE_DESC
        })),
        [profiles]
    );

    /* ---------------- TOGGLES ---------------- */

    const toggleCollapse = (groupCode) => {
        setCollapsedGroups(prev => ({
            ...prev,
            [groupCode]: !prev[groupCode]
        }));
    };

    const toggleGroup = (group) => {
        const isChecked = !selectedGroups[group.groupCode];
        const updatedEmployees = { ...selectedEmployees };

        (group.employees || []).forEach(emp => {
            updatedEmployees[emp.empCode] = isChecked;
        });

        setSelectedEmployees(updatedEmployees);
        setSelectedGroups(prev => ({
            ...prev,
            [group.groupCode]: isChecked
        }));
    };

    const toggleEmployee = (empCode) => {
        setSelectedEmployees(prev => ({
            ...prev,
            [empCode]: !prev[empCode]
        }));
    };

    /* ---------------- PROFILE CHANGE ---------------- */

    const handleGroupProfileChange = (groupCode, selected) => {
        const profileIds = selected ? selected.map(p => p.value) : [];

        const updated = groups.map(group => {
            if (group.groupCode === groupCode) {
                return {
                    ...group,
                    employees: (group.employees || []).map(emp => ({
                        ...emp,
                        profiles: profileIds
                    }))
                };
            }
            return group;
        });

        setGroups(updated);
    };

    const handleEmployeeProfileChange = (empCode, selected) => {
        const profileIds = selected ? selected.map(p => p.value) : [];

        const updated = groups.map(group => ({
            ...group,
            employees: (group.employees || []).map(emp =>
                emp.empCode === empCode
                    ? { ...emp, profiles: profileIds }
                    : emp
            )
        }));

        setGroups(updated);
    };

    /* ---------------- SAVE ---------------- */

    const handleSave = async () => {

        let payload = [];
        let hasSelection = false;

        for (const group of groups) {
            for (const emp of (group.employees || [])) {

                const groupSelected = selectedGroups[group.groupCode];
                const empSelected = selectedEmployees[emp.empCode];

                if (groupSelected || empSelected) {

                    hasSelection = true;

                    if (!emp.profiles || emp.profiles.length === 0) {
                        notifyWarning(`Please assign profile to ${emp.empName}`);
                        return;
                    }

                    payload.push({
                        empCode: emp.empCode,
                        profiles: emp.profiles
                    });
                }
            }
        }

        if (!hasSelection) {
            notifyWarning("Please select at least one group or employee");
            return;
        }

        const confirm = await confirmAction(
            "Save Profile Assignment?",
            "Selected employee profiles will be updated"
        );

        if (!confirm) return;

        try {
            setSaving(true);

            const res = await saveEmployeeProfiles(payload);

            if (res?.status) {
                notifySuccess(res.message);
                await handleShowData();
            } else {
                notifyError(res?.message || "Failed to save profiles");
            }

        } catch {
            notifyError("Error saving profiles");
        } finally {
            setSaving(false);
        }
    };

    const selectStyles = {
  control: (base) => ({ 
    ...base, 
    minHeight: "38px" 
  }),
  valueContainer: (base) => ({ 
    ...base, 
    maxHeight: "36px", 
    overflowY: "auto" 
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

                <nav aria-label="breadcrumb">
                    <ol className="breadcrumb">
                        <li className="breadcrumb-item">
                            <Link to="/eportal/dashboard">Home</Link>
                        </li>
                        <li
                            className="breadcrumb-item active"
                            aria-current="page"
                        >
                               Employee Access
                        </li>
                    </ol>
                </nav>
            </div>
            <div className="card">

                {/* FILTER */}
                <div className="card-body row">

                    <div className="col-lg-4">
                        <label>Company</label>
                        <Select
                            options={companies}
                            value={selectedCompany}
                            onChange={setSelectedCompany}
                            isLoading={loadingDropdowns}
                        />
                    </div>

                    <div className="col-lg-3">
                        <label>Division</label>
                        <Select
                            options={divisions}
                            value={selectedDivision}
                            onChange={setSelectedDivision}
                        />
                    </div>

                    <div className="col-lg-3">
                        <label>Department</label>
                        <Select
                            options={departments}
                            value={selectedDepartment}
                            onChange={setSelectedDepartment}
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
                {!loadingData && groups.map(group => {

                    const groupProfiles =
                        profileOptions.filter(opt =>
                            (group.employees || []).every(emp =>
                                emp.profiles?.includes(opt.value)
                            )
                        );

                    return (
                        <div
                            className="card mb-3 shadow-sm border-0 mx-3"
                            key={group.groupCode}
                            style={{
                                background: "#f8fafc"
                            }}
                        >

                            <div
                                className="card-header d-flex align-items-center"
                                style={{
                                    background: "#e8f1ff",
                                    padding: "0.5rem"
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
    icon={collapsedGroups[group.groupCode] ? faChevronRight : faChevronDown}
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
                                        onChange={(opts) => handleGroupProfileChange(group.groupCode, opts)}
                                    />
                                </div>

                            </div>

                            {!collapsedGroups[group.groupCode] && (
                                <div className="card-body p-2">

                                    {(group.employees || []).map(emp => {

                                        const selectedProfiles =
                                            profileOptions.filter(opt =>
                                                emp.profiles?.includes(opt.value)
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
                                                    <span>{emp.empName}</span>
                                                </div>


                                                <div className="col-md-8">
                                                    <Select
                                                        isMulti
                                                        options={profileOptions}
                                                        value={selectedProfiles}
                                                        styles={selectStyles}
                                                        onChange={(opts) => handleEmployeeProfileChange(emp.empCode, opts)}
                                                    />
                                                </div>

                                            </div>
                                        )
                                    })}

                                </div>
                            )}

                        </div>
                    )
                })}

                {/* SAVE */}
                {groups.length > 0 && (
                    <div
                        className="text-center"
                        style={{
                            marginTop: "30px",
                            marginBottom: "50px"
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
