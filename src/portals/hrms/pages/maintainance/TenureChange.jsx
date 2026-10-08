import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import SDLDataTable from "../../../../components/datatable/SDLDataTable";
import SDLSearch from "../../../../components/datatable/SDLSearch";
import BreadcrumbNav from "../../components/breadcrumb-nav/BreadcrumbNav";
import { getPortalFromPath } from "../../../../config/portalConfig";
import { notifyError } from "../../../../services/alertService";
import { getTenureChangeList } from "../../services/tenureChangeService";
import "../../assets/css/tenureChange.css";

const TenureChange = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const portal = getPortalFromPath(location.pathname);
  const [search, setSearch] = useState("");
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

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
      [employee.empCode, employee.empName, employee.designation, employee.location, employee.empType]
        .some((value) => String(value || "").toLowerCase().includes(query)),
    );
  }, [employees, search]);

  const columns = [
    { field: "empCode", header: "Code", style: { width: "9%" } },
    { field: "empName", header: "Employee Name", style: { width: "15%" } },
    { field: "designation", header: "Designation", style: { width: "13%" } },
    { field: "location", header: "Organogram Location", style: { width: "16%" } },
    { field: "empType", header: "Employee Type", style: { width: "14%" } },
    { field: "doj", header: "DOJ", style: { width: "10%", textAlign: "center" } },
    { field: "tenureDue", header: "Tenure Due Date", style: { width: "14%", textAlign: "center" } },
    {
      header: "Action",
      style: { width: "9%", textAlign: "center" },
      body: (employee) => (
        <button
          type="button"
          className="btn btn-icon btn-sm btn-primary"
          aria-label="Start tenure change assessment"
          title="Start tenure change assessment"
          onClick={() => navigate("/hrms/maintainance/tenure-change/assessment", {
            state: {
              employee: {
                code: employee.empCode,
                name: employee.empName,
                designation: employee.designation,
                location: employee.location,
                department: employee.department || "-",
                employeeType: employee.empType,
                dateOfJoining: employee.doj,
                tenureDueDate: employee.tenureDue,
                currentCtc: employee.currentCtc || "",
              },
            },
          })}
        >
          <i className="ti ti-send" aria-hidden="true"></i>
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
