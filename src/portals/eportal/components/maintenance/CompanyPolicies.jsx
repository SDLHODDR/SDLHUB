import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

import { getPolicies } from "../../services/policyService";
import "../../assets/css/companyPolicies.css";

const CompanyPolicies = () => {
  const [listData, setListData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
  let mounted = true;

  const loadPolicies = async () => {
    try {
      const response = await getPolicies();

      if (!mounted) return;

      if (response?.status) {
        setListData(
          (response.data || []).map((item, index) => ({
            id: item.policyId || index,
            policyName: item.policyName || "-",
            description: item.description || "-",
            startDate: item.startDate || "-",
            endDate: item.endDate || "-",
            previewUrl: item.previewUrl || null,
          }))
        );
      } else {
        setListData([]);
      }
    } catch (error) {
      console.error(error);

      if (mounted) {
        setListData([]);
      }
    } finally {
      if (mounted) {
        setLoading(false);
      }
    }
  };

  loadPolicies();

  return () => {
    mounted = false;
  };
}, []);

  // ================= SEARCH FILTER =================
   const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return listData;

    const query = searchQuery.trim().toLowerCase();

    return listData.filter(
      (item) =>
        item.policyName.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)
    );
  }, [searchQuery, listData]);

  const actionBodyTemplate = (rowData) => {
    return (
      <>
        {rowData.previewUrl && (
          <a
            href={rowData.previewUrl}
            title="View Policy"
            target="_blank"
            rel="noopener noreferrer"
             className="btn btn-icon btn-sm btn-primary"
          >
            <i className="ti ti-eye"></i>
          </a>
        )}
      </>
    );
  };

  return (
    <>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-title">
          <h4>Company Policies</h4>
          <h6>View Company Policies</h6>
        </div>

        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link to="/eportal/dashboard">Home</Link>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              Company Policies
            </li>
          </ol>
        </nav>
      </div>

      {/* Card */}
      <div className="card">
        <div className="card-body">
          {/* Search */}
          <div className="row mb-3">
            <div className="col-lg-4 col-md-6 col-12">
                <div className="search-set">
                  <div className="search-input position-relative">
                    <span className="btn-searchset">
                      <i className="ti ti-search"></i>
                    </span>

                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search Policies..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
            </div>
          </div>

          {/* DataTable */}
          <div className="company-policies-table">
            <DataTable
                  value={filteredData}
                  loading={loading}
                  paginator={filteredData.length > 10}
                  rows={10}
                  rowsPerPageOptions={[10,25,50,100]}
                  stripedRows
                  showGridlines
                  scrollable
                  responsiveLayout="scroll"
                  paginatorDropdownAppendTo="self"
                  removableSort
                  emptyMessage="No policies found"
                  className="p-datatable-sm company-policies-grid"
            >
              <Column field="policyName" header="Policy Name" sortable />

              <Column field="description" header="Description" />

              <Column field="startDate" header="Start Date" sortable />

              <Column field="endDate" header="End Date" sortable />

              <Column
                header="Action"
                body={actionBodyTemplate}
                style={{ width: "100px" }}
              />
            </DataTable>
          </div>
        </div>
      </div>
    </>
  );
};

export default CompanyPolicies;
