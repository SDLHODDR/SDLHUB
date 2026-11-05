import { createPortal } from "react-dom";
import ExitSeparationRequestModal from "../../pages/separation/ExitSeparationRequestModal";
import ExitInterviewModal from "../../pages/separation/ExitInterviewModal";
import ExitActivityModal from "../../pages/separation/ExitActivityModal";
import ExitLetterModal from "../../pages/separation/ExitLetterModal";
import ExitDeactivateEmployeeModal from "../../pages/separation/ExitDeactivateEmployeeModal";

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
