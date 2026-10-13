import "../../portals/hrms/assets/css/tenureChange.css";
import TenureChangeAssessmentModal from "../../portals/hrms/pages/maintainance/TenureChangeAssessmentModal";
import TenureChangeCtcModal from "../../portals/hrms/pages/maintainance/TenureChangeCtcModal";
import TenureChangeLetterModal from "../../portals/hrms/pages/maintainance/TenureChangeLetterModal";

const TenureAuthorizationModal = ({
  config,
  show,
  record,
  onClose,
  onSuccess,
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
          onSuccess={onSuccess}
        />
      );

     case "TENURECTCCHG":
      return (
        <TenureChangeCtcModal
          config={config}
          show={show}
          record={record}
          onClose={onClose}
          onSuccess={onSuccess}
        />
      );

    case "TENURECHANGELETTER":
      return (
        <TenureChangeLetterModal
          config={config}
          show={show}
          record={record}
          onClose={onClose}
          onSuccess={onSuccess}
        />
      );
    
    default:
      return null;
  }
};

export default TenureAuthorizationModal;
