import FamilyAuthorizationModal from "./FamilyAuthorizationModal";
import BankAuthorizationModal from "./BankAuthorizationModal";
import PersonalInfoAuthorizationModal from "./PersonalInfoAuthorizationModal";
import OrganogramAuthorizationModal from "./OrganogramAuthorizationModal";

const MastersAuthorizationModal = ({
  type,
  show,
  record,
  onClose,
  onSuccess,
}) => {
  const modalProps = {
    show,
    record,
    onClose,
    onSuccess,
  };

  switch (type) {
    case "PERSONAL":
      return <PersonalInfoAuthorizationModal {...modalProps} />;
    case "FAMILY":
      return <FamilyAuthorizationModal {...modalProps} />;
    case "BANK":
      return <BankAuthorizationModal {...modalProps} />;
    case "ORGANOGRAM":
      return <OrganogramAuthorizationModal {...modalProps} />;
    default:
      return null;
  }
};

export default MastersAuthorizationModal;
