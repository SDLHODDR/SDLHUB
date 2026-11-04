import { createPortal } from "react-dom";
import ExitSeparationRequestModal from "../../portals/hrms/pages/maintainance/ExitSeparationRequestModal";
import ExitInterviewModal from "../../portals/hrms/pages/maintainance/ExitInterviewModal";
import ExitActivityModal from "../../portals/hrms/pages/maintainance/ExitActivityModal";
import ExitLetterModal from "../../portals/hrms/pages/maintainance/ExitLetterModal";
import ExitDeactivateEmployeeModal from "../../portals/hrms/pages/maintainance/ExitDeactivateEmployeeModal";

const EXIT_MODALS = {
  SEPARATION: ExitSeparationRequestModal,
  EXIT_INT: ExitInterviewModal,
  EXIT_ACT: ExitActivityModal,
  DEACT_EMP: ExitDeactivateEmployeeModal,
  REL_EXP: ExitLetterModal,
};

const ExitAuthorizationModal = ({ config, show, record, onClose, onSuccess }) => {
  const Modal = EXIT_MODALS[config?.type];
  if (!show || !record || !Modal) return null;

  return createPortal(
    <Modal
      config={config}
      record={record}
      onClose={onClose}
      onSuccess={onSuccess}
    />,
    document.body
  );
};

export default ExitAuthorizationModal;
