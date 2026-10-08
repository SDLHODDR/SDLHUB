import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import SDLDataTable from "../../../../components/datatable/SDLDataTable";
import SDLSearch from "../../../../components/datatable/SDLSearch";
import BreadcrumbNav from "../../components/breadcrumb-nav/BreadcrumbNav";
import { getPortalFromPath } from "../../../../config/portalConfig";
import { demoTenureEmployee } from "./tenureChangeDemoData";
import "../../assets/css/tenureChange.css";

const TenureChange = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const portal = getPortalFromPath(location.pathname);
  const [search, setSearch] = useState("");

  // UI prototype data; replace this list with the tenure API response when it is available.
  const employees = useMemo(() => [demoTenureEmployee], []);
  const visibleEmployees = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return employees;

    return employees.filter((employee) =>
      [employee.code, employee.name, employee.designation, employee.location, employee.employeeType]
        .some((value) => String(value || "").toLowerCase().includes(query)),
    );
  }, [employees, search]);

  const columns = [
    { field: "code", header: "Code", style: { width: "9%" } },
    { field: "name", header: "Employee Name", style: { width: "15%" } },
    { field: "designation", header: "Designation", style: { width: "13%" } },
    { field: "location", header: "Organogram Location", style: { width: "16%" } },
    { field: "employeeType", header: "Employee Type", style: { width: "14%" } },
    { field: "dateOfJoining", header: "DOJ", style: { width: "10%", textAlign: "center" } },
    { field: "tenureDueDate", header: "Tenure Due Date", style: { width: "14%", textAlign: "center" } },
    {
      header: "Action",
      style: { width: "9%", textAlign: "center" },
      body: (employee) => (
        <button
          type="button"
          className="btn btn-sm tenure-send-button"
          onClick={() => navigate("/hrms/maintainance/tenure-change/assessment", { state: { employee } })}
        >
          Send
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
            loading={false}
            emptyMessage="No upcoming tenure changes found"
            className="tenure-change-table"
            tableStyle={{ width: "100%", minWidth: "100%", tableLayout: "fixed" }}
            scrollable={false}
          />
          <p className="small text-muted mt-3 mb-0">
            Sample employee data is shown while the tenure-change API is being developed.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TenureChange;
