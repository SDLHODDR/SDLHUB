import { useParams } from "react-router-dom";
import { useEffect } from "react";
import BreadcrumbNav from "../../portals/eportal/components/breadcrumb-nav/BreadcrumbNav";
//import JoiningAuthorizationModal from "../../portals/hrms/modal/JoiningAuthorizationModal";
import SDLDataTable from "../datatable/SDLDataTable";
import SDLSearch from "../datatable/SDLSearch";
import "../../portals/eportal/assets/css/companyPolicies.css";
import { formatDashDate } from "../../portals/eportal/utils/formatUtils";
import { useJoiningAuthorizationHandler } from "./useJoiningAuthorizationHandler";
import { getJoiningAuthorizationColumns } from "./JoiningAuthorizationColumns";

// Map TASK_ID -> page title / API endpoint / column config
const JOINING_TASK_CONFIG = {
  13: { title: "Employee Document Upload", endpoint: "/joining/doc-upload" },
  44: { title: "Print Appointment Letter", endpoint: "/joining/appointment-letter" },
  45: { title: "Employee Code Generation - Request", endpoint: "/joining/code-generation" },
  37: { title: "CTC Details", endpoint: "/joining/ctc-details" },
  4:  { title: "Joining Activity", endpoint: "/joining/activity" },
};

const JoiningAuthorization = () => {
    const { tid } = useParams();
    const config = JOINING_TASK_CONFIG[tid];

    const {
        loading,
        searchQuery,
        setSearchQuery,
        filteredData,
        //showModal,
        openModal,
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
                        onRowClick={(e) => openModal(e.data)}
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