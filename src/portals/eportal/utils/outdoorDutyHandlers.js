import Swal from "sweetalert2";
import {
  sendauthGPDataDetails,
  resendauthGPDataDetails,
  //deleteGPData,
  closeGPTicket,
} from "../services/outdoorDutyService";

export const createOutdoorDutyHandlers = ({ handleSuccess, openModal }) => {
  const sendAuth = async (id) => {
        const result = await Swal.fire({
          title: "Send for Authorization?",
          icon: "question",
          showCancelButton: true,
          confirmButtonText: "Yes",
        });
    
        if (!result.isConfirmed) return;
    
        //try {
          const response = await sendauthGPDataDetails({
            ID: id,
            sendAuth: true
          });
  
          if (response?.status) {
            await Swal.fire({
              icon: "success",
              title: "Sent!",
              text:
                response?.message ||
                "Authorization request sent successfully."
            });
            handleSuccess?.();
          } else {
            Swal.fire({
              icon: "error",
              title: "Failed!",
              text:
                response?.message ||
                "Unable to send authorization request."
            });
          }
    };
  
    const resendAuth = async (id) => {
        const result = await Swal.fire({
          title: "Resend Authorization?",
          icon: "warning",
          showCancelButton: true
        });
    
        if (!result.isConfirmed) return;
          const response = await resendauthGPDataDetails({
            ID: id,
            resendAuth: true
          });
          
          if (response?.status) {
            await Swal.fire({
              icon: "success",
              title: "Resent!",
              text:
                response?.message ||
                "Authorization request resent successfully."
            });
            handleSuccess?.();
          } else {
            Swal.fire({
              icon: "error",
              title: "Failed!",
              text:
                response?.message ||
                "Unable to resend authorization request."
            });
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
          const result = await Swal.fire({
            title: "Close OutDoor Duty Request?",
            icon: "question",
            showCancelButton: true
          });

          if (!result.isConfirmed) return;

          const response = await closeGPTicket({
            ID: id,
            closeTicket: true
          });

          if (response?.status) {
            await Swal.fire({
              icon: "success",
              title: "Closed!",
              text:
                response?.message ||
                "Outdoor Request Closed successfully."
            });

          } else {
            Swal.fire({
              icon: "error",
              title: "Failed!",
              text:
                response?.message ||
                "Unable to close request."
            });
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