export const LeaveStartEndArr = {
  B: "Beginning Of The Day",
  M: "Middle Of The Day",
  E: "End Of The Day",
};

export const getLeavesAuthorizationColumns = (openModal, formatDashDate) => [
  
  {
    header: "Created On",
    body: (rowData) => {
      return (
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            openModal(rowData);
          }}
          title="Created On"
        >
          {formatDashDate(rowData.CREATED_ON)}
        </a>
      );
    },
  },
  {
    header: "Created By",
    body: (rowData) => {
      return (
        <a  
            href="#"
            onClick={(e) => {
              e.preventDefault();
              openModal(rowData);
            }}
            title="Created By"
          >
            {rowData.CREATED_BY}
        </a>
      );
    },
  },
  {
    header: "Raised By",
    body: (rowData) => {
      return (
        <a  
            href="#"
            onClick={(e) => {
              e.preventDefault();
              openModal(rowData);
            }}
            title="Created By"
          >
            {rowData.REQUEST_FOR}
        </a>
      );
    },
  },
  {
    field: "LVE_START_ON",
    header: "Start",
    sortable: true,
    body: (rowData) => {
      const startOn = LeaveStartEndArr[rowData?.LVE_START_ON] || rowData?.LVE_START_ON || "-";
      return (
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            openModal(rowData);
          }}
          title="START"
          style={{ whiteSpace: "nowrap" }}
        >
          <span style={{ fontSize: "0.8rem" }}>{startOn}</span>
        </a>
      );
    },
  },
  {
    field: "LVE_END_ON",
    header: "End",
    sortable: true,
    body: (rowData) => {
      const endOn = LeaveStartEndArr[rowData?.LVE_END_ON] || rowData?.LVE_END_ON || "-";
      return (
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            openModal(rowData);
          }}
          title="END"
          style={{ whiteSpace: "nowrap" }}
        >
          <span style={{ fontSize: "0.8rem" }}>{endOn}</span>
        </a>
      );
    },
  },
  {
    field: "LVE_CODE",
    header: "Leave Type",
    sortable: true,
    body: (rowData) => (
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          openModal(rowData);
        }}
        title="From"
      >
        {rowData?.LVE_CODE || "-"}
      </a>
    ),
  },
  {
    field: "TOTAL_DAYS",
    header: "No. of Days",
    sortable: true,
    body: (rowData) => (
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          openModal(rowData);
        }}
        title="Days"
      >
        {rowData?.TOTAL_DAYS || "-"}
      </a>
    ),
  },
  {
    field: "REMARKS",
    header: "Reason",
    body: (rowData) => {
      const text = rowData?.DETAILS?.REASON || "-";
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
              title="Reason"
            >
              {trimmed}
            </a>
          </div>
        </div>
      );
    },
  },
];