import { useNavigate, useParams } from "react-router-dom";
import BreadcrumbNav from "../../../../shared/components/BreadcrumbNav";
//import JoiningAuthorizationModal from "../../../../../_archive/src/portals/hrms/modal/JoiningAuthorizationModal";
import SDLDataTable from "../../../../shared/components/datatable/SDLDataTable";
import SDLSearch from "../../../../shared/components/datatable/SDLSearch";
import "../../../../shared/assets/css/companyPolicies.css";
import { formatDashDate } from "../../../../shared/utils/formatUtils";
import { useJoiningAuthorizationHandler } from "./useJoiningAuthorizationHandler";
import { getJoiningAuthorizationColumns } from "./JoiningAuthorizationColumns";

// Map TASK_ID -> page title / API endpoint / column config
const JOINING_TASK_CONFIG = {
  13: { title: "Employee Document Upload", endpoint: "/joining/doc-upload" },
  34: { title: "Tenure Details" },
  35: { title: "Basic Details" },
  36: { title: "Bank Details" },
  37: { title: "CTC Details", endpoint: "/joining/ctc-details" },
  38: { title: "Qualification Details" },
  39: { title: "Experience Details" },
  41: { title: "Family Details" },
  42: { title: "Application Access" },
  43: { title: "KRA Details" },
  44: { title: "Print Appointment Letter", endpoint: "/joining/appointment-letter" },
  45: { title: "Employee Code Generation - Request", endpoint: "/joining/code-generation" },
  4:  { title: "Joining Activity", endpoint: "/joining/activity" },
};

// These open the employee on the Employee Information page: 45 to authorize,
// the others on their own tab with Save and Submit.
const TASKS_OPENING_EMPLOYEE_PAGE = ["34", "35", "36", "37", "38", "39", "41", "42", "43", "45"];

const JoiningAuthorization = () => {
    const { tid } = useParams();
    const navigate = useNavigate();
    const config = JOINING_TASK_CONFIG[tid];

    const handleRowClick = (record) => {
        if (!TASKS_OPENING_EMPLOYEE_PAGE.includes(String(tid)) || !record?.TRAN_CODE) return;
        navigate(
            `/hrms/masterdata/employee?emp_code=${encodeURIComponent(record.TRAN_CODE)}&user_task_id=${encodeURIComponent(record.ID)}`
        );
    };

    const {
        loading,
        searchQuery,
        setSearchQuery,
        filteredData,
        //showModal,
        //closeModal,
        //handleModalSuccess,
    } = useJoiningAuthorizationHandler(tid, config);

    const columns = getJoiningAuthorizationColumns(
        formatDashDate, 
        tid,
        filteredData[0]?.exit_arr_data,
        filteredData[0]?.join_arr_data,
    );
   

    if (loading) return <div>Loading...</div>;

    // useEffect(() => {
    //     if (!config) return;
    //     // fetch(config.endpoint)... load table data specific to this tid
    // }, [tid, config]);

    console.log("=============FilteredData============", filteredData);

    return (
        <>
            <div className="page-header">
                <div className="page-title">
                    <h4>{config?.title || "Joining Authorization"}</h4>
                </div>
                <BreadcrumbNav
                items={[
                    { text: "Home", link: "/hrms/dashboard" },
                    { text: config?.title || "Joining Authorization" },
                ]}
                />
            </div>

            <div className="card">
                <div className="card-body">
                <div className="row mb-3">
                    <div className="col-lg-4 col-md-6 col-12">
                         <SDLSearch
                            value={searchQuery}
                            onChange={setSearchQuery}
                            placeholder="Search Joining..."
                            style={{ width: "270px" }}
                        />
                    </div>
                </div>

                <div className="company-policies-table">
                    <SDLDataTable
                        data={filteredData}
                        columns={columns}
                        loading={loading}
                        emptyMessage="No Tasks found"
                        className="company-policies-grid"
                        removableSort
                        onRowClick={(e) => handleRowClick(e.data)}
                    />
                </div>
                </div>
            </div>
             {/* {showModal && (
                <JoiningAuthorizationModal
                    outddorduty={selectedOutduty}
                    isOpen={true}
                    onClose={closeModal}
                    onSuccess={handleModalSuccess}
                />
            )} */}
        </>
    );
};

export default JoiningAuthorization;