export const getTicketBookingActions = ({
  sendAuth,
  resendAuth,
  closeTicketTB,
}) => [
  {
    key: "resendAuth",
    label: "Resend Auth",
    icon: "ti ti-refresh",
    className: "btn-outline-primary",
    show: (row) => row.status?.trim()?.toUpperCase() === "R",
    onClick: (row) => resendAuth(row.id),
  },
  {
    key: "sendAuth",
    label: "Send for Auth",
    icon: "ti ti-send",
    className: "btn-outline-primary",
    show: (row) => row.status?.trim()?.toUpperCase() === "N",
    onClick: (row) => sendAuth(row.id),
  },
  {
    key: "closeTicket",
    label: "Cancel Ticket",
    icon: "ti ti-x",
    className: "btn-outline-danger",
    // Same as old ePortal: cancel is offered only once the request is approved
    // (that is when the admin's ticket-booking task 347 is created).
    show: (row) => row.status?.trim()?.toUpperCase() === "A",
    onClick: (row) => closeTicketTB(row.id),
  },
];