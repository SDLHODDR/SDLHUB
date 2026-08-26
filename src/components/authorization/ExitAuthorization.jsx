import { useParams } from "react-router-dom";
import { useEffect } from "react";
import BreadcrumbNav from "../../portals/eportal/components/breadcrumb-nav/BreadcrumbNav";

// Map TASK_ID -> page title / API endpoint (fill in real TASK_IDs from your task_master_map)
const EXIT_TASK_CONFIG = {
  18:  { title: "Separation Request", endpoint: "/api/hrms/exit/separation-request" },
  20:  { title: "Exit Interview", endpoint: "/api/hrms/exit/interview" },
  19:  { title: "Exit Activity", endpoint: "/api/hrms/exit/activity" },
  24:  { title: "Generate Relieveing and Experience Letter", endpoint: "/api/hrms/exit/relieving-letter" },
};

const ExitAuthorization = () => {
    const { tid } = useParams();
    const config = EXIT_TASK_CONFIG[tid];

    useEffect(() => {
        if (!config) return;
        // fetch(config.endpoint)... load table data specific to this tid
    }, [tid, config]);

    return (
        <>
            <div className="page-header">
                <div className="page-title">
                <h4>{config?.title || "Exit Authorization"}</h4>
                </div>
                <BreadcrumbNav
                items={[
                    { text: "Home", link: "/hrms/dashboard" },
                    { text: config?.title || "Exit Authorization" },
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

export default ExitAuthorization;