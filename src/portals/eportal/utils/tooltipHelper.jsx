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



export const renderConferenceTooltip = (row) => (props) => (
  <Tooltip {...props} className="custom-tooltip">
    <div><b>Start Time:</b> {row.STARTTIME}</div>
    <div><b>End Time:</b> {row.ENDTIME}</div>
  </Tooltip>
);

