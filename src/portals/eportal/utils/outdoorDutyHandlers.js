import {
  sendauthGPDataDetails,
  resendauthGPDataDetails,
  //deleteGPData,
  closeGPTicket,
} from "../services/outdoorDutyService";

import { notifySuccess, confirmAction, notifyError } from "../../../services/alertService";

export const createOutdoorDutyHandlers = ({ handleSuccess, openModal }) => {
  const sendAuth = async (id) => {
    const result = await confirmAction(
      "Send for Authorization?"
    );
       
    
        if (!result.isConfirmed) return;
    
        //try {
          const response = await sendauthGPDataDetails({
            ID: id,
            sendAuth: true
          });
  
          if (response?.status) {
            notifySuccess( response?.message || "Authorization request sent successfully.");
            handleSuccess?.();
          } else {
            notifyError(response?.message || "Unable to send authorization request.");
          }
    };
  
    const resendAuth = async (id) => {
      const result = await confirmAction(
        "Resend Authorization?"
      );
       
        if (!result.isConfirmed) return;
          const response = await resendauthGPDataDetails({
            ID: id,
            resendAuth: true
          });
          
          if (response?.status) {
            notifySuccess( response?.message || "Authorization request resent successfully." );
            handleSuccess?.();
          } else {
            notifyError(response?.message || "Unable to resend authorization request.");
          }
      };
  
      const updateRemarks = (rowData) => {
        openModal({
          mode: "postremark",
          id: rowData.id,
          data: rowData,
          isPostRemark:true
        });
      };
  
      const closeTicketGP = async (id) => {
        try {
          const result = await confirmAction(
            "Close OutDoor Duty Request?"
          );
          
          if (!result.isConfirmed) return;

          const response = await closeGPTicket({
            ID: id,
            closeTicket: true
          });

          if (response?.status) {
            notifySuccess( response?.message || "Outdoor Request Closed successfully." );
          } else {
            notifyError(response?.message || "Unable to close request.");
          }
    
          handleSuccess?.();
        } catch (err) {
          console.error(err);
        }
      };
  
      const viewGP = null; 
      const editGP = null;
      const deleteGP = null;

  return { sendAuth, resendAuth, updateRemarks, closeTicketGP, viewGP, editGP, deleteGP };
};