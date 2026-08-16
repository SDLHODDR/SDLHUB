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
    label: "Close Ticket",
    icon: "ti ti-x",
    className: "btn-outline-danger",
    show: (row) => {
      const status = row.status?.trim()?.toUpperCase();
      return status !== "X" && status !== "N" && status !== "R";
    },
    onClick: (row) => closeTicketTB(row.id),
  },
];