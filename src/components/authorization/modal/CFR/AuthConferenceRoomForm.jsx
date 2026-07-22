import AuthCFRModal from "./AuthCFRModal";
import { useState, useEffect, useCallback } from "react";

const AuthConferenceRoomForm = ({ formSettings = {}, onSuccess, onClose }) => {
    const { isOpen } = formSettings;
    console.log("==========AuthConferenceRoomForm===========", formSettings);
    const [open, setOpen] = useState(true);
    const [refreshKey, setRefreshKey] = useState(0);
    const [loading, setLoading] = useState(false);
    
    const handleSuccess = () => {
      // refresh GenericDataTable (Add/Edit/Delete flow)
      setRefreshKey(prev => prev + 1);
      // refresh Authorization table (if passed)
      onSuccess?.();
    };

    return(
        <>
            <AuthCFRModal
              formSettings={formSettings}
              isOpen={formSettings.isOpen}
              onClose={onClose}
            />
        </>
    );
}

export default AuthConferenceRoomForm;