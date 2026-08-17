export const getOutdoorDutyActions = ({
  sendAuth,
  resendAuth,
  updateRemarks,
  closeTicketGP,
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
    key: "updateRemarks",
    label: "Update Remarks",
    icon: "ti ti-message-plus",
    className: "btn-outline-primary",
    show: (row) => {
      const status = row.status?.trim()?.toUpperCase();
      return !row.postremarks && ["A", "T"].includes(status) && !!row.outType;
    },
    onClick: (row) => updateRemarks(row),
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
      return ["A", "R"].includes(status) && row.dateTimePass >= 0;
    },
    onClick: (row) => closeTicketGP(row.id),
  },
];