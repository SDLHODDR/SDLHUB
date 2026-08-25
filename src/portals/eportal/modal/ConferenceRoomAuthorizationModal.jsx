import AuthCFRModal from "./AuthCFRModal";

const ConferenceRoomAuthorizationModal = ({ formSettings = {}, onSuccess, onClose }) => (
  <AuthCFRModal
    formSettings={formSettings}
    isOpen={formSettings.isOpen}
    onSuccess={onSuccess}
    onClose={onClose}
  />
);

export default ConferenceRoomAuthorizationModal;
