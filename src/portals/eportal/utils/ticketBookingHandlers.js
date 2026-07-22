import Swal from "sweetalert2";
import {
  sendauthTBDataDetails,
  resendauthTBDataDetails,
  deleteTBRData,
  closeTBTicket,
} from "../services/ticketbookingService";
import { getTicketBookingDataResponse } from "../../../store/eportal/ePortalTicketBookingSlice";

export const createTicketBookingHandlers = ({ dispatch, handleSuccess, openModal }) => {
  const sendAuth = async (id) => {
    const result = await Swal.fire({
      title: "Send for Authorization?",
      icon: "question",
      showCancelButton: true,
    });
    if (!result.isConfirmed) return;

    const response = await sendauthTBDataDetails({ ID: id, sendAuth: true });
    if (response?.status) {
      await Swal.fire({
        icon: "success",
        title: "Sent!",
        text: response?.message || "Authorization request sent successfully.",
      });
      handleSuccess?.();
    } else {
      Swal.fire({
        icon: "error",
        title: "Failed!",
        text: response?.message || "Unable to send authorization request.",
      });
    }
  };

  const resendAuth = async (id) => {
    const result = await Swal.fire({
      title: "Resend Authorization?",
      icon: "warning",
      showCancelButton: true,
    });
    if (!result.isConfirmed) return;

    const response = await resendauthTBDataDetails({ ID: id, resendAuth: true });
    if (response?.status) {
      await Swal.fire({
        icon: "success",
        title: "Resent!",
        text: response?.message || "Authorization request resent successfully.",
      });
      handleSuccess?.();
    } else {
      Swal.fire({
        icon: "error",
        title: "Failed!",
        text: response?.message || "Unable to resend authorization request.",
      });
    }
  };

  const updateRemarks = (rowData) => {
    openModal({ mode: "edit", id: rowData.id, data: rowData, isPostRemark: true });
  };

  const closeTicketTB = async (id) => {
    try {
      const result = await Swal.fire({
        title: "Close Ticket Booking?",
        icon: "question",
        showCancelButton: true
      });
      
      if (!result.isConfirmed) return;

      const response = await closeTBTicket({
        ID: id,
        closeTicket: true
      });
      if (response?.status) {
        await Swal.fire({
          icon: "success",
          title: "Closed!",
          text:
            response?.message ||
            "Ticket Booking Closed successfully."
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
      //dispatch(getTicketBookingDataResponse());
    } catch (err) {
      console.error(err);
    }
  };

  const viewTB = (id) => openModal(null, "view", id);

  const editTB = (rowData) => {
    openModal({ mode: "edit", id: rowData.id, data: rowData });
  };

  const deleteTB = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Delete this Ticket Booking request?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Delete!",
    });
    if (!result.isConfirmed) return;

    const response = await deleteTBRData({ deleteTB: true, delteId: id });
    if (response?.status) {
      await Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: response?.message || "Gatepass deleted successfully",
      });
      handleSuccess?.();
    } else {
      Swal.fire({
        icon: "error",
        title: "Failed!",
        text: response?.message || "Delete failed",
      });
    }
  };

  return { sendAuth, resendAuth, updateRemarks, closeTicketTB, viewTB, editTB, deleteTB };
};