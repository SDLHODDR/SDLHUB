import {
  sendauthTBDataDetails,
  resendauthTBDataDetails,
  closeTBTicket,
} from "../services/ticketbookingService";
import { confirmAction, notifyError, notifySuccess } from "../../../shared/services/alertService";
import { handleError } from "../../../shared/services/errorHandler";

export const createTicketBookingHandlers = ({ handleSuccess }) => {
  const sendAuth = async (id) => {
    const result = await confirmAction(
      "Send for Authorization?"
    );
   
    if (!result) return;

    const response = await sendauthTBDataDetails({ ID: id, sendAuth: true });
    if (response?.status) {
      notifySuccess(response?.message || "Authorization request sent successfully.");
      handleSuccess?.();
    } else {
      notifyError(response?.message || "Unable to send authorization request.");
    }
  };

  const resendAuth = async (id) => {
    const result = await confirmAction("Resend Authorization?");
    
    if (!result) return;

    const response = await resendauthTBDataDetails({ ID: id, resendAuth: true });
    if (response?.status) {
      notifySuccess(response?.message || "Authorization request resent successfully.");
      handleSuccess?.();
    } else {
      notifyError(response?.message || "Unable to resend authorization request.");
    }
  };

  const closeTicketTB = async (id) => {
    try {
      const result = await confirmAction("Cancel this ticket?", "This will cancel the approved ticket booking.");
            
      if (!result) return;

      const response = await closeTBTicket({
        ID: id,
        closeTicket: true
      });
      if (response?.status) {
        notifySuccess(response?.message || "Ticket Booking Closed successfully.");
      } else {
        notifyError(response?.message || "Unable to close request.");
      }
      handleSuccess?.();
    } catch (err) {
      handleError(err, { context: "Close ticket booking request", fallback: "Unable to close request." });
    }
  };

  return { sendAuth, resendAuth, closeTicketTB };
};