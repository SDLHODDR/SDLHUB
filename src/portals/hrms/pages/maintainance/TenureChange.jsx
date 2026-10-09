import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import SDLDataTable from "../../../../components/datatable/SDLDataTable";
import SDLSearch from "../../../../components/datatable/SDLSearch";
import BreadcrumbNav from "../../components/breadcrumb-nav/BreadcrumbNav";
import { getPortalFromPath } from "../../../../config/portalConfig";
import {
  confirmAction,
  notifyError,
  notifySuccess,
} from "../../../../services/alertService";
import { getHRMSAuthroizationTaskCount } from "../../../../store/hrms/hrmsAuthorizationCountSlice";
//import { demoTenureEmployees } from "./tenureChangeDemoData";
import { sendTenureChangeForAuth } from "../../services/tenureChangeService";
import { getTenureChangeList } from "../../services/tenureChangeService";
import "../../assets/css/tenureChange.css";

const TenureChange = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const portal = getPortalFromPath(location.pathname);
  const [search, setSearch] = useState("");
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sendingEmployeeCode, setSendingEmployeeCode] = useState(null);

  useEffect(() => {
    let mounted = true;

    const loadEmployees = async () => {
      try {
        setLoading(true);
        const response = await getTenureChangeList();

        if (!mounted) return;
        if (response?.status) {
          setEmployees(Array.isArray(response.data) ? response.data : []);
        } else {
          setEmployees([]);
          notifyError(response?.message || "Unable to load upcoming tenure changes.");
        }
      } catch (error) {
        if (!mounted) return;
        setEmployees([]);
        notifyError(error?.message || "Unable to load upcoming tenure changes.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadEmployees();
    return () => { mounted = false; };
  }, []);

  const visibleEmployees = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return employees;

    return employees.filter((employee) =>
      [
        employee.empCode,
        employee.empName,
        employee.designation,
        employee.location,
        employee.empType,
        employee.approvalText,
      ]
        .some((value) => String(value || "").toLowerCase().includes(query)),
    );
  }, [employees, search]);

  const handleSend = async (employee) => {
    const managerCode = employee.manager?.empCode || employee.mgr_code;
    const managerName = employee.manager?.empName?.trim() || employee.managerName;

    const confirmation = await confirmAction(
      "Send tenure change for authorization?",
      `This will generate a task for ${managerName || "the assigned manager"}.`,
    );

    if (!confirmation?.isConfirmed) return;

    if (!managerCode) {
      notifyError("Manager code is not available for this employee.");
      return;
    }

    try {
      setSendingEmployeeCode(employee.empCode);
      const response = await sendTenureChangeForAuth(
        employee.empCode,
        managerCode,
      );

      if (response?.status) {
        setEmployees((currentEmployees) =>
          currentEmployees.filter(
            (currentEmployee) => currentEmployee.empCode !== employee.empCode,
          ),
        );
        dispatch(getHRMSAuthroizationTaskCount());
        notifySuccess(response.message || "Tenure change sent for authorization.");
      } else {
        notifyError(response?.message || "Unable to send tenure change for authorization.");
      }
    } catch (error) {
      console.error("Send tenure change error:", error);
      notifyError(error?.message || "Unable to send tenure change for authorization.");
    } finally {
      setSendingEmployeeCode(null);
    }
  };

  const approvalLevelBody = (employee) => {
    if (Array.isArray(employee.approvalLevels) && employee.approvalLevels.length) {
      return (
        <div>
          {employee.approvalLevels.map((level, index) => {
            const levelNumber = level?.level ?? index + 1;
            const managerName = level?.empName?.trim() || level?.empCode || "-";

            return (
              <div key={`${levelNumber}-${level?.empCode || index}`}>
                {levelNumber}. {managerName}
              </div>
            );
          })}
        </div>
      );
    }

    return employee.approvalText || "-";
  };

  const columns = [
    { field: "company", header: "Comp", style: { width: "8%" } },
    { field: "empCode", header: "Code", style: { width: "10%" } },
    { field: "empName", header: "Name", style: { width: "15%" } },
    { field: "designation", header: "Desi", style: { width: "12%" } },
    { field: "location", header: "Location", style: { width: "13%" } },
    { field: "empType", header: "Emp Type", style: { width: "10%" } },
    { field: "doj", header: "DOJ", style: { width: "9%", textAlign: "center" } },
    { field: "tenureDue", header: "Tenure Due", style: { width: "10%", textAlign: "center" } },
    {
      field: "approvalText",
      header: "Appr Level",
      body: approvalLevelBody,
      style: { width: "16%" },
    },
    {
      field: "action",
      header: "Action",
      style: { width: "7%", textAlign: "center" },
      body: (employee) => (
        <button
          type="button"
          className="btn btn-icon btn-sm btn-primary"
          onClick={() => handleSend(employee)}
          disabled={sendingEmployeeCode === employee.empCode}
        >
          {sendingEmployeeCode === employee.empCode ? "Sending..." : "Send"}
        </button>
      ),
    },
  ];

  return (
    <div className="tenure-change-page">
      <div className="page-header" style={{ marginBottom: '8px' }}>
        <div className='add-item d-flex'>
          <div className='page-title'>
            <h4>Upcoming Employee Tenure Change</h4>
          </div>
        </div>

        <BreadcrumbNav items={[
          { text: "Home", link: `/${portal.key}/dashboard` },
          { text: "Tenure Change" },
        ]} />
      </div>

      <div className="card tenure-change-card">
        <div className="card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
          <h5 className="mb-0">Upcoming Employee Tenure Change</h5>
          <div className="tenure-list-search">
            <SDLSearch value={search} onChange={setSearch} placeholder="Search employees..." />
          </div>
        </div>
        <div className="card-body pt-3">
          <SDLDataTable
            data={visibleEmployees}
            columns={columns}
            rows={10}
            loading={loading}
            emptyMessage={loading ? " " : "No upcoming tenure changes found"}
            className="tenure-change-table"
            tableStyle={{ width: "100%", minWidth: "100%", tableLayout: "fixed" }}
            scrollable={false}
          />
        </div>
      </div>
    </div>
  );
};

export default TenureChange;
