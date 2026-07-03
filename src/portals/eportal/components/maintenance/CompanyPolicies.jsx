import { useEffect, useState, useMemo } from "react";

import { getPolicies } from "../../services/policyService";
import "../../assets/css/companyPolicies.css";

import BreadcrumbNav from "../breadcrumb-nav/BreadcrumbNav";
import SDLDataTable from "../../../../components/datatable/SDLDataTable"; // Update path if required
import SDLSearch from "../../../../components/datatable/SDLSearch";

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

    /* ================= SEARCH FILTER ================= */

    const filteredData = useMemo(() => {
        if (!searchQuery.trim()) return listData;

        const query = searchQuery.trim().toLowerCase();

        return listData.filter(
            (item) =>
                item.policyName.toLowerCase().includes(query) ||
                item.description.toLowerCase().includes(query)
        );
    }, [searchQuery, listData]);

    /* ================= ACTION COLUMN ================= */

    const actionBodyTemplate = (rowData) => (
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

    /* ================= TABLE COLUMNS ================= */

    const columns = [
        {
            field: "policyName",
            header: "Policy Name",
            sortable: true,
        },
        {
            field: "description",
            header: "Description",
        },
        {
            field: "startDate",
            header: "Start Date",
            sortable: true,
        },
        {
            field: "endDate",
            header: "End Date",
            sortable: true,
        },
        {
            header: "Action",
            body: actionBodyTemplate,
            style: { width: "100px" },
        },
    ];

    return (
        <>
            {/* ================= PAGE HEADER ================= */}

            <div className="page-header">
                <div className="page-title">
                    <h4>Company Policies</h4>
                </div>

                <BreadcrumbNav
                    items={[
                        { text: "Home", link: "/eportal/dashboard" },
                        { text: "Company Policies" },
                    ]}
                />
            </div>

            {/* ================= CARD ================= */}

            <div className="card">
                <div className="card-body">

                    {/* ================= SEARCH ================= */}

                    <div className="row mb-3">
                        <div className="col-lg-4 col-md-6 col-12">
                            <SDLSearch
                                value={searchQuery}
                                onChange={setSearchQuery}
                                placeholder="Search Policies..."
                                 style={{ width: "120px" }}
                            />
                        </div>
                    </div>

                    {/* ================= TABLE ================= */}

                    <div className="company-policies-table">
                        <SDLDataTable
                            data={filteredData}
                            columns={columns}
                            loading={loading}
                            emptyMessage="No policies found"
                            className="company-policies-grid"
                            removableSort
                        />
                    </div>

                </div>
            </div>
        </>
    );
};

export default CompanyPolicies;