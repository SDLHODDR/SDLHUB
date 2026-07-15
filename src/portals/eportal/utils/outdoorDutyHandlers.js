import Swal from "sweetalert2";
import {
  sendauthGPDataDetails,
  resendauthGPDataDetails,
  deleteGPData,
  closeGPTicket,
} from "../services/outdoorDutyService";

import { getOutdoorDutyDataResponse } from "../../../store/eportal/ePortalOutdoorDutySlice";

export const createOutdoorDutyHandlers = ({ dispatch, handleSuccess, openModal }) => {
  const sendAuth = async (id) => {
        const result = await Swal.fire({
          title: "Send for Authorization?",
          icon: "question",
          showCancelButton: true
        });
    
        if (!result.isConfirmed) return;
    
        //try {
          //await sendauthGPDataDetails({ ID: id, sendAuth: true });
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
  
            //cacheRef.current = {};
            //dispatch(getOutdoorDutyDataResponse());
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
        //} 
        // catch {
        //   Swal.fire("Error!", "", "error");
        // }
    };
  
    const resendAuth = async (id) => {
        const result = await Swal.fire({
          title: "Resend Authorization?",
          icon: "warning",
          showCancelButton: true
        });
    
        if (!result.isConfirmed) return;
    
        //try {
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
  
            //cacheRef.current = {};
            //fetchData();
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
        // } catch {
        //   Swal.fire("Error!", "", "error");
        // }
      };
  
      const updateRemarks = (rowData) => {
        console.log("============", rowData);
  
        openModal({
          mode: "edit",
          id: rowData.id,
          data: rowData,
          isPostRemark:true
        });
      };
  
      const closeTicketGP = async (id) => {
        try {
          await closeGPTicket({ ID: id, closeTicket: true });
    
          //cacheRef.current = {};
          dispatch(getOutdoorDutyDataResponse());
    
        } catch (err) {
          console.error(err);
        }
      };
  
      const viewGP = (id) => openModal(null, "view", id);
      const editGP = (rowData) => {
        console.log("============", rowData);
  
        openModal({
          mode: "edit",
          id: rowData.id,
          data: rowData,
        });
      };
  
      const deleteGP = async (id) => {
        const result = await Swal.fire({
          title: "Are you sure?",
          text: "Delete this Outdoor Duty request?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Yes, Delete!"
        });
    
        if (!result.isConfirmed) return;
        console.log("========Dleete payload=====", { deleteOD: true, delteId: id });
        //try {
          //await deleteGPData({ deleteOD: true, delteId: id });
          const response = await deleteGPData({
            deleteOD: true,
            delteId: id
          });
    
          if (response?.status) {
            await Swal.fire({
              icon: "success",
              title: "Deleted!",
              text:
                response?.message ||
                "Gatepass deleted successfully"
            });
  
            //cacheRef.current = {};
            //fetchData();
            handleSuccess?.();
          } else {
            Swal.fire({
              icon: "error",
              title: "Failed!",
              text:
                response?.message ||
                "Delete failed"
            });
          }
        //} 
        //catch {
        //   Swal.fire("Error!", "Delete failed", "error");
        // }
      };

  return { sendAuth, resendAuth, updateRemarks, closeTicketGP, viewGP, editGP, deleteGP };
};