import { Link } from "react-router-dom";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import Swal from "sweetalert2";

export const renderTicketBookingActions = (
  rowData,
  { sendAuth, resendAuth, updateRemarks, closeTicketTB, viewTB, editTB, deleteTB }
) => {
  const status = rowData.status?.trim()?.toUpperCase();
  const postRemarks = rowData.postremarks;
  const datePass = rowData.dateTimePass;
  const id = rowData.id;

  const disableEditDelete = ["A", "R", "T", "X"].includes(status);

  const renderTooltip = (text) => (props) => (
    <Tooltip id={`tooltip-${text}`} {...props}>
      {text}
    </Tooltip>
  );

  // safe click handler — `disabled` should already reflect whether this action is blocked
  const handleClick = (e, action, disabled = false) => {
    e.preventDefault();
    e.stopPropagation();

    if (disabled) {
      Swal.fire({
        icon: "error",
        title: "Failed!",
        text: "Cannot Perform this action",
      });
      return;
    }

    action(id);
  };

  return (
    <div className="d-flex align-items-center gap-2 flex-wrap">
      {disableEditDelete ? (
        <span className="text-muted small"> - </span>
      ) : (
        <>
          {/* Edit */}
          <OverlayTrigger placement="top" overlay={renderTooltip("Edit")}>
            <span className="d-inline-block">
              <Link to="" className="p-2" onClick={(e) => handleClick(e, () => editTB(rowData))}>
                <i className="ti ti-edit"></i>
              </Link>
            </span>
          </OverlayTrigger>

          {/* Delete */}
          <OverlayTrigger placement="top" overlay={renderTooltip("Delete")}>
            <span className="d-inline-block">
              <Link to="" className="p-2" onClick={(e) => handleClick(e, () => deleteTB(id))}>
                <i className="ti ti-trash text-danger"></i>
              </Link>
            </span>
          </OverlayTrigger>
        </>
      )}

      {/* Resend Auth */}
      {status === "R" && (
        <OverlayTrigger placement="top" overlay={renderTooltip("Resend Auth")}>
          <span>
            <Link to="" onClick={(e) => handleClick(e, () => resendAuth(id))}>
              <i className="ti ti-refresh"></i>
            </Link>
          </span>
        </OverlayTrigger>
      )}

     

      {/* Send Auth */}
      {status === "N" && (
        <OverlayTrigger placement="top" overlay={renderTooltip("Send for Auth")}>
          <span>
            <Link to="" onClick={(e) => handleClick(e, () => sendAuth(id))}>
              <i className="ti ti-send"></i>
            </Link>
          </span>
        </OverlayTrigger>
      )}

      {["A", "T", "R"].includes(status) && (
          <OverlayTrigger placement="top" overlay={renderTooltip("Close Ticket")}>
            <span>
              <Link
                to=""
                // onClick={(e) => handleClick(e, updateRemarks)}
                onClick={(e) =>
                  handleClick(e, () => closeTicketTB(rowData.id), false, status)
                }
              >
                <i className="ti ti-x" />
              </Link>
            </span>
          </OverlayTrigger>
        )}

      {/* Close Ticket */}
      {status === "T" && !postRemarks && datePass > 0 && "-"}
    </div>
  );
};