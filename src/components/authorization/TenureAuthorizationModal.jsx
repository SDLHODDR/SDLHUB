import { createPortal } from "react-dom";
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

  let modalContent = null;
  switch (config.type) {
    case "EMPTENURECHG":
      modalContent = (
        <TenureChangeAssessmentModal
          config={config}
          show={show}
          record={record}
          onClose={onClose}
          onSuccess={onSuccess}
        />
      );
      break;

     case "TENURECTCCHG":
    case "TENURECTCAPPR":
      modalContent = (
        <TenureChangeCtcModal
          config={config}
          show={show}
          record={record}
          onClose={onClose}
          onSuccess={onSuccess}
        />
      );
      break;

    case "TENURECHANGELETTER":
      modalContent = (
        <TenureChangeLetterModal
          config={config}
          show={show}
          record={record}
          onClose={onClose}
          onSuccess={onSuccess}
        />
      );
      break;
    
    default:
      return null;
  }

  return createPortal(modalContent, document.body);
};

export default TenureAuthorizationModal;
