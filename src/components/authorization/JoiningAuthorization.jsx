import { useParams } from "react-router-dom";
import { useEffect } from "react";
import BreadcrumbNav from "../../portals/eportal/components/breadcrumb-nav/BreadcrumbNav";

// Map TASK_ID -> page title / API endpoint / column config
const JOINING_TASK_CONFIG = {
  13: { title: "Employee Document Upload", endpoint: "/api/hrms/joining/doc-upload" },
  44: { title: "Print Appointment Letter", endpoint: "/api/hrms/joining/appointment-letter" },
  45: { title: "Employee Code Generation - Request", endpoint: "/api/hrms/joining/code-generation" },
  37: { title: "CTC Details", endpoint: "/api/hrms/joining/ctc-details" },
  4:  { title: "Joining Activity", endpoint: "/api/hrms/joining/activity" },
};

const JoiningAuthorization = () => {
    const { tid } = useParams();
    const config = JOINING_TASK_CONFIG[tid];

    useEffect(() => {
        if (!config) return;
        // fetch(config.endpoint)... load table data specific to this tid
    }, [tid, config]);

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
                    SDL Search comes here
                    </div>
                </div>

                <div className="company-policies-table">
                    SDLTable Comes here — data driven by tid = {tid}
                </div>
                </div>
            </div>
            SDL Modal Comes here
        </>
    );
};

export default JoiningAuthorization;