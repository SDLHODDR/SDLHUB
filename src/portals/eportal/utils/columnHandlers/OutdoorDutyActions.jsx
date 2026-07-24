import { Link } from "react-router-dom";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import Swal from "sweetalert2";

export const renderOutdoorDutyActions = (
  rowData,
  { sendAuth, resendAuth, updateRemarks, closeTicketGP, viewGP, editGP, deleteGP }
) => {

  const status = rowData.status?.trim()?.toUpperCase();
  const postRemarks = rowData.postremarks;
  const outType = rowData.outType;
  const datePass = rowData.dateTimePass;
  const id = rowData.id;

  const disableEditDelete = ["A", "R", "T", "X"].includes(status);

  console.log("==============DisableEditDelete======Status============", status, disableEditDelete);

  console.log("==============RowData============", postRemarks, ["A", "T"].includes(status), outType, datePass <= 0);

  const renderTooltip = (text) => (props) => (
    <Tooltip id={`tooltip-${text}`} {...props}>
      {text}
    </Tooltip>
  );

  // safe click handler
  const handleClick = (e, action, disabled = false, status = "") => {
    console.log("********Action Disabled*******", action, status);
    e.preventDefault();
    e.stopPropagation();

    //  const disableHandler = ["A", "R", "T", "X"].includes(status);
    // if (disabled || disableHandler) {
    //   Swal.fire({
    //     icon: "error",
    //     title: "Failed!",
    //     text: "Cannot Perform this action"
    //   });

    //   return
    // };
    
    action(id);
  };

  return (
    <div className="d-flex align-items-center gap-2 flex-wrap">

      {/* {disableEditDelete ? (
        <span className="text-muted small">**</span>
      ) : (
        <> */}
          {/* Edit */}
          {!disableEditDelete && (
          <OverlayTrigger placement="top" overlay={renderTooltip("Edit")}>
            <span className="d-inline-block">
              <Link
                to=""
                className="p-2"
                onClick={(e) =>
                  handleClick(e, () => editGP(rowData), disableEditDelete, status)
                }
              >
                <i className="ti ti-edit"></i>
              </Link>
            </span>
          </OverlayTrigger>
          )}
          {/* Delete */}
          {!disableEditDelete && (
          <OverlayTrigger placement="top" overlay={renderTooltip("Delete")}>
            <span className="d-inline-block">
              <Link
                to=""
                className="p-2"
                onClick={(e) => handleClick(e, deleteGP, disableEditDelete, status)}
              >
                <i className="ti ti-trash text-danger"></i>
              </Link>
            </span>
          </OverlayTrigger>
         )}  
        {/* </>
      )} */}

      {/* Resend Auth */}
      {status === "R" && (
        <OverlayTrigger placement="top" overlay={renderTooltip("Resend Auth")}>
          <span>
            <Link
              to=""
              onClick={(e) => handleClick(e, resendAuth, false, status)}
            >
              <i className="ti ti-refresh"></i>
            </Link>
          </span>
        </OverlayTrigger>
      )}

      {/* Update Remarks */}
      {!postRemarks &&
        ["A", "T"].includes(status) &&
        outType &&
        datePass <= 0 && (
          <OverlayTrigger placement="top" overlay={renderTooltip("Update Remarks")}>
            <span>
              <Link
                to=""
                // onClick={(e) => handleClick(e, updateRemarks)}
                onClick={(e) =>
                  handleClick(e, () => updateRemarks(rowData), false, status)
                }
              >
                <i className="ti ti-message-plus"></i>
              </Link>
            </span>
          </OverlayTrigger>
        )}

      {/* Send Auth */}
      {status === "N" && (
        <OverlayTrigger placement="top" overlay={renderTooltip("Send for Auth")}>
          <span>
            <Link
              to=""
              onClick={(e) => handleClick(e, sendAuth, false, status)}
            >
              <i className="ti ti-send"></i>
            </Link>
          </span>
        </OverlayTrigger>
      )}

      {["A", "T", "R"].includes(status) &&
       datePass >= 0 && (
          <OverlayTrigger placement="top" overlay={renderTooltip("Close Ticket")}>
            <span>
              <Link
                to=""
                // onClick={(e) => handleClick(e, updateRemarks)}
                onClick={(e) =>
                  handleClick(e, () => closeTicketGP(rowData.id), false, status)
                }
              >
                <i className="ti ti-x" />
              </Link>
            </span>
          </OverlayTrigger>
        )}

      {/* Close Ticket */}
      {status === "T" && !postRemarks && datePass > 0 && "@@"}
    </div>
  );
};