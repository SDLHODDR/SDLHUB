export const getTicketBookingAuthorizationColumns = (openModal, formatDashDate) => [
  {
    header: "Created On",
    body: (rowData) => (
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          openModal(rowData);
        }}
        title="Added On"
      >
        {formatDashDate(rowData.CREATED_ON)}
      </a>
    ),
  },
  {
    header: "Created By",
    body: (rowData) => {
      const taskFor = rowData?.CREATED_BY || "-";
      return (
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            openModal(rowData);
          }}
          title="Task For"
        >
          {taskFor}
        </a>
      );
    },
  },
  {
    header: "Travel Person",
    body: (rowData) => {
      const requestFor = rowData?.REQUEST_FOR || "-";
      return (
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            openModal(rowData);
          }}
          title="Request For"
        >
          {requestFor}
        </a>
      );
    },
  },
  
  {
    field: "TRVL_DATE",
    header: "Travel Date",
    sortable: true,
    body: (rowData) => {
      const trvlDate = formatDashDate(rowData?.TRVL_DATE) || "-";
      return (
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            openModal(rowData);
          }}
          title="Request DATE"
        >
          {trvlDate}
        </a>
      );
    },
  },
  {
    header: "Travel From",
    body: (rowData) => {
      const fromLoc = rowData?.TRVL_FROM_LOC || "-";
      return (
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            openModal(rowData);
          }}
          title="From"
        >
          {fromLoc}
        </a>
      );
    },
  },
  {
    header: "Travel To",
    body: (rowData) => {
      const toLoc = rowData?.TRVL_TO_LOC || "-";
      return (
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            openModal(rowData);
          }}
          title="To"
        >
          {toLoc}
        </a>
      );
    },
  },
  {
    field: "REMARKS",
    header: "REMARKS",
    body: (rowData) => {
      const text = rowData?.REMARKS || "-";
      const trimmed = text.length > 15 ? `${text.substring(0, 15)}...` : text;
      return (
        <div className="remarks-wrapper">
          <div className="remarks-main" title={text}>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                openModal(rowData);
              }}
              title="Remarks"
            >
              {trimmed}
            </a>
          </div>
        </div>
      );
    },
  },
];