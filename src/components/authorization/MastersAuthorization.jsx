import { useParams } from "react-router-dom";
import BreadcrumbNav from "../../portals/eportal/components/breadcrumb-nav/BreadcrumbNav";
//import JoiningAuthorizationModal from "../../portals/hrms/modal/JoiningAuthorizationModal";
import SDLDataTable from "../datatable/SDLDataTable";
import SDLSearch from "../datatable/SDLSearch";
import "../../portals/eportal/assets/css/companyPolicies.css";
import { formatDashDate } from "../../portals/eportal/utils/formatUtils";
//import { useJMiscellaneousAuthorizationHandler } from "./useJMiscellaneousAuthorizationHandler";
//import { getMiscellaneousAuthorizationColumns } from "./getMiscellaneousAuthorizationColumns";

// Map TASK_ID -> page title / API endpoint / column config
const JOINING_TASK_CONFIG = {

  55: { title: "Change Bank Info - Request", endpoint: "/changeBankInfo/bank-info" },
 
};

const MastersAuthorization = () => {
    const { tid } = useParams();
    const config = JOINING_TASK_CONFIG[tid];

  
   

    if (loading) return <div>Loading...</div>;

    // useEffect(() => {
    //     if (!config) return;
    //     // fetch(config.endpoint)... load table data specific to this tid
    // }, [tid, config]);

    console.log("=============FilteredData============", filteredData);

    return (
        <>
           
        </>
    );
};

export default MastersAuthorization;