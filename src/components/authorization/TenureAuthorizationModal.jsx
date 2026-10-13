import "../../portals/hrms/assets/css/tenureChange.css";
import TenureChangeAssessmentModal from "../../portals/hrms/pages/maintainance/TenureChangeAssessmentModal";
import TenureChangeLetterModal from "../../portals/hrms/pages/maintainance/TenureChangeLetterModal";

const TenureAuthorizationModal = ({
  config,
  show,
  record,
  onClose,
}) => {
  if (!show || !record || !config?.type) return null;

  switch (config.type) {
    case "EMPTENURECHG":
      return (
        <TenureChangeAssessmentModal
          config={config}
          show={show}
          record={record}
          onClose={onClose}
        />
      );

    case "TENURECHANGELETTER":
      return (
        <TenureChangeLetterModal
          config={config}
          show={show}
          record={record}
          onClose={onClose}
        />
      );
    
    default:
      return null;
  }
};

export default TenureAuthorizationModal;
