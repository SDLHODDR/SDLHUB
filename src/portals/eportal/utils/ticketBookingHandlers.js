import Swal from "sweetalert2";
import {
  sendauthTBDataDetails,
  resendauthTBDataDetails,
  closeTBTicket,
} from "../services/ticketbookingService";

export const createTicketBookingHandlers = ({ handleSuccess }) => {
  const sendAuth = async (id) => {
    const result = await Swal.fire({
      title: "Send for Authorization?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes",
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
    } catch (err) {
      console.error(err);
    }
  };

  return { sendAuth, resendAuth, closeTicketTB };
};