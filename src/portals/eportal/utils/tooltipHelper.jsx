import { OverlayTrigger, Tooltip } from "react-bootstrap";

export const renderTooltip = (text) => (props) => (
  <Tooltip {...props} className="custom-tooltip-nocss">
    {text}
  </Tooltip>
);

export const IconWithTooltip = ({ text, children }) => (
  <OverlayTrigger
    placement="top"
    delay={{ show: 200, hide: 100 }}
    overlay={renderTooltip(text)}
    container={document.body}
  >
    <span className="d-inline-block">{children}</span>
  </OverlayTrigger>
);

export const renderTravelTooltip = (row) => (props) => (
  <Tooltip {...props} className="custom-tooltip">
    <div><b>From:</b> {row.trvl_from_location}</div>
    <div><b>To:</b> {row.trvl_to_loc}</div>
    <div><b>Flight/Train Name:</b> {row.trvl_ft_name}</div>
    <div><b>Flight/Train Number:</b> {row.trvl_ft_no}</div>
    <div><b>Suitable Onward:</b> {row.ttnt_depr_time}</div>
  </Tooltip>
);


export const renderConferenceTooltip = (row) => (props) => (
  <Tooltip {...props} className="custom-tooltip">
    <div><b>Start Time:</b> {row.STARTTIME}</div>
    <div><b>End Time:</b> {row.ENDTIME}</div>
  </Tooltip>
);

export const renderLeaveTooltip = (row) => (props) => (
  <Tooltip {...props} className="custom-tooltip">
    <div><b>From Date:</b> {row.LVE_DATE_FR}</div>
    <div><b>To Date:</b> {row.LVE_DATE_TO}</div>
    <div><b>Number of Days:</b> {row.NO_DAYS}</div>
  </Tooltip>
);
