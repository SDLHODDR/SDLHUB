import { useEffect, useMemo, useState } from "react";

import {
  getConferenceRoomMaintenance,
  saveConferenceRoom,
  updateConferenceRoomStatus,
} from "../../services/conferenceRoomMaintenanceService";

import BreadcrumbNav from "../breadcrumb-nav/BreadcrumbNav";

import SDLDataTable from "../../../../components/datatable/SDLDataTable";
import SDLSearch from "../../../../components/datatable/SDLSearch";

import { getPortalFromPath } from "../../../../config/portalConfig";

import { notifyError, notifySuccess } from "../../../../services/alertService";

const ConferenceRoomMaintenance = () => {
  /* ============================================================
     STATE
  ============================================================ */

  const [listData, setListData] = useState([]);

  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");

  const [saving, setSaving] = useState(false);

  const [statusSaving, setStatusSaving] = useState(false);

  /* ============================================================
     UPDATE MODAL
  ============================================================ */

  const [showUpdateModal, setShowUpdateModal] = useState(false);

  /* ============================================================
     STATUS MODAL
  ============================================================ */

  const [showStatusModal, setShowStatusModal] = useState(false);

  /* ============================================================
     SELECTED ROOM
  ============================================================ */

  const [selectedRoom, setSelectedRoom] = useState(null);

  /* ============================================================
     UPDATE FORM
  ============================================================ */

  const [formData, setFormData] = useState({
    id: null,
    roomLabel: "",
    roomLocation: "",
    roomCapacity: "",
    roomFacility: [],
    teleExt: "",
  });

  /* ============================================================
     UPDATE FORM ERRORS
  ============================================================ */

  const [formErrors, setFormErrors] = useState({
    roomLabel: "",
    roomLocation: "",
    roomCapacity: "",
  });

  /* ============================================================
     STATUS FORM
  ============================================================ */

  const [statusForm, setStatusForm] = useState({
    id: null,
    status: "",
    reason: "",
  });

  /* ============================================================
     STATUS FORM ERROR
  ============================================================ */

  const [statusFormError, setStatusFormError] = useState("");

  /* ============================================================
     PORTAL
  ============================================================ */

  const portal = getPortalFromPath(location.pathname);

  const portalHome = `/${portal.key}/dashboard`;

  /* ============================================================
     FACILITIES
  ============================================================ */

  const facilityOptions = [
    "Television",
    "Extension",
    "Air Condition",
    "White Board",
  ];

  /* ============================================================
     LOCATION OPTIONS
  ============================================================ */

  const locationOptions = ["5th Floor", "6th Floor"];

  /* ============================================================
     FETCH DATA
  ============================================================ */

  const loadRooms = async () => {
    try {
      setLoading(true);

      const response = await getConferenceRoomMaintenance();

      if (response?.status) {
        const rooms = (response.data || []).map((item, index) => ({
          id: item.id ?? index,

          roomLabel: item.roomLabel || "-",

          roomLocation: item.roomLocation || "-",

          roomCapacity: item.roomCapacity ?? "-",

          roomFacility: item.roomFacility || "",

          teleExt: item.teleExt || "",

          status: String(item.status ?? "")
            .trim()
            .toUpperCase(),

          reason: item.reason || "",
        }));

        setListData(rooms);
      } else {
        setListData([]);

        notifyError(response?.message || "Unable to fetch conference rooms.");
      }
    } catch (error) {
      console.error("Error loading conference rooms:", error);

      setListData([]);

      notifyError("Unable to fetch conference rooms.");
    } finally {
      setLoading(false);
    }
  };

  /* ============================================================
     INITIAL LOAD
  ============================================================ */

  useEffect(() => {
    loadRooms();
  }, []);

  /* ============================================================
     SEARCH
  ============================================================ */

  const filteredData = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return listData;
    }

    return listData.filter((item) => {
      const roomLabel = String(item.roomLabel ?? "").toLowerCase();

      const location = String(item.roomLocation ?? "").toLowerCase();

      const capacity = String(item.roomCapacity ?? "").toLowerCase();

      const facility = String(item.roomFacility ?? "").toLowerCase();

      const teleExt = String(item.teleExt ?? "").toLowerCase();

      const status = item.status === "A" ? "active" : "inactive";

      return (
        roomLabel.includes(query) ||
        location.includes(query) ||
        capacity.includes(query) ||
        facility.includes(query) ||
        teleExt.includes(query) ||
        status.includes(query)
      );
    });
  }, [listData, searchQuery]);

  /* ============================================================
     OPEN UPDATE MODAL
  ============================================================ */

  const openUpdateModal = (rowData) => {
    const facilities = String(rowData.roomFacility || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    setSelectedRoom(rowData);

    setFormData({
      id: rowData.id,

      roomLabel: rowData.roomLabel === "-" ? "" : rowData.roomLabel,

      roomLocation: locationOptions.includes(rowData.roomLocation)
        ? rowData.roomLocation
        : "",

      roomCapacity:
        rowData.roomCapacity === "-" ? "" : String(rowData.roomCapacity),

      roomFacility: facilities,

      teleExt: rowData.teleExt || "",
    });

    /* Clear previous validation */

    setFormErrors({
      roomLabel: "",
      roomLocation: "",
      roomCapacity: "",
    });

    setShowUpdateModal(true);
  };

  /* ============================================================
     CLOSE UPDATE MODAL
  ============================================================ */

  const closeUpdateModal = (forceClose = false) => {
    /*
     * Prevent closing while save is running.
     *
     * forceClose = true is used after
     * successful API response.
     */

    if (saving && !forceClose) {
      return;
    }

    setShowUpdateModal(false);

    setSelectedRoom(null);

    setFormData({
      id: null,
      roomLabel: "",
      roomLocation: "",
      roomCapacity: "",
      roomFacility: [],
      teleExt: "",
    });

    setFormErrors({
      roomLabel: "",
      roomLocation: "",
      roomCapacity: "",
    });
  };

  /* ============================================================
     FORM CHANGE
  ============================================================ */

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    /*
     * Clear field error as soon as
     * user changes the field.
     */

    setFormErrors((prev) => ({
      ...prev,
      [field]: "",
    }));
  };

  /* ============================================================
     FACILITY CHANGE
  ============================================================ */

  const handleFacilityChange = (facility) => {
    setFormData((prev) => {
      const current = prev.roomFacility || [];

      const exists = current.includes(facility);

      return {
        ...prev,

        roomFacility: exists
          ? current.filter((item) => item !== facility)
          : [...current, facility],
      };
    });
  };

  /* ============================================================
     CAPACITY CHANGE
  ============================================================ */

  const handleCapacityChange = (value) => {
    /*
     * Keep numbers only.
     */

    const numericValue = String(value).replace(/\D/g, "");

    handleFormChange("roomCapacity", numericValue);
  };

  /* ============================================================
     VALIDATE UPDATE FORM
  ============================================================ */

  const validateUpdateForm = () => {
    const errors = {};

    /* -----------------------------------------
       ROOM NAME
    ----------------------------------------- */

    if (!formData.roomLabel.trim()) {
      errors.roomLabel = "Room name is required.";
    }

    /* -----------------------------------------
       LOCATION
    ----------------------------------------- */

    if (!formData.roomLocation) {
      errors.roomLocation = "Please select room location.";
    }

    /* -----------------------------------------
       CAPACITY
    ----------------------------------------- */

    if (!formData.roomCapacity) {
      errors.roomCapacity = "Room capacity is required.";
    } else if (Number(formData.roomCapacity) <= 0) {
      errors.roomCapacity = "Room capacity must be greater than zero.";
    }

    setFormErrors(errors);

    return Object.keys(errors).length === 0;
  };

  /* ============================================================
     UPDATE ROOM
  ============================================================ */

  const handleUpdate = async (event) => {
    event.preventDefault();

    /* -----------------------------------------
       VALIDATE
    ----------------------------------------- */

    const isValid = validateUpdateForm();

    if (!isValid) {
      return;
    }

    try {
      setSaving(true);

      const payload = {
        id: formData.id,

        roomLabel: formData.roomLabel.trim(),

        roomLocation: formData.roomLocation,

        roomCapacity: Number(formData.roomCapacity),

        roomFacility: formData.roomFacility,

        teleExt: formData.teleExt.trim(),
      };

      const response = await saveConferenceRoom(payload);

      if (response?.status) {
        notifySuccess(
          response.message || "Conference room updated successfully.",
        );

        /*
         * Force close because saving
         * is still true.
         */

        closeUpdateModal(true);

        await loadRooms();
      } else {
        /*
         * API error is still shown
         * through notification.
         */

        notifyError(response?.message || "Unable to update conference room.");
      }
    } catch (error) {
      console.error("Update conference room error:", error);

      notifyError("Unable to update conference room.");
    } finally {
      setSaving(false);
    }
  };

  /* ============================================================
     OPEN STATUS MODAL
  ============================================================ */

  const openStatusModal = (rowData) => {
    const isActive = rowData.status === "A";

    setSelectedRoom(rowData);

    setStatusForm({
      id: rowData.id,

      /*
       * Active -> Inactive
       * Inactive -> Active
       */

      status: isActive ? "I" : "A",

      reason: isActive ? "" : rowData.reason || "",
    });

    /*
     * Clear previous validation error.
     */

    setStatusFormError("");

    setShowStatusModal(true);
  };

  /* ============================================================
     CLOSE STATUS MODAL
  ============================================================ */

  const closeStatusModal = (forceClose = false) => {
    if (statusSaving && !forceClose) {
      return;
    }

    setShowStatusModal(false);

    setSelectedRoom(null);

    setStatusForm({
      id: null,
      status: "",
      reason: "",
    });

    setStatusFormError("");
  };

  /* ============================================================
     STATUS REASON CHANGE
  ============================================================ */

  const handleStatusReasonChange = (value) => {
    setStatusForm((prev) => ({
      ...prev,
      reason: value,
    }));

    /*
     * Remove validation error
     * once user enters a reason.
     */

    if (value.trim()) {
      setStatusFormError("");
    }
  };

  /* ============================================================
     UPDATE STATUS
  ============================================================ */

  const handleStatusUpdate = async (event) => {
    event.preventDefault();

    const isMakingInactive = statusForm.status === "I";

    /* -----------------------------------------
       INLINE VALIDATION
    ----------------------------------------- */

    if (isMakingInactive && !statusForm.reason.trim()) {
      setStatusFormError("Reason is required.");

      return;
    }

    /*
     * Clear any old validation error.
     */

    setStatusFormError("");

    try {
      setStatusSaving(true);

      const response = await updateConferenceRoomStatus({
        id: statusForm.id,

        status: statusForm.status,

        reason: isMakingInactive ? statusForm.reason.trim() : "",
      });

      if (response?.status) {
        notifySuccess(
          response.message || "Conference room status updated successfully.",
        );

        /*
         * Force close because statusSaving
         * is still true.
         */

        closeStatusModal(true);

        await loadRooms();
      } else {
        notifyError(response?.message || "Unable to update room status.");
      }
    } catch (error) {
      console.error("Status update error:", error);

      notifyError("Unable to update room status.");
    } finally {
      setStatusSaving(false);
    }
  };

  /* ============================================================
     TABLE ACTION
  ============================================================ */

  const actionBodyTemplate = (rowData) => {
    const isActive = rowData.status === "A";

    return (
      <div className="d-flex gap-1">
        {/* UPDATE */}

        <button
          type="button"
          className="btn btn-sm btn-outline-primary"
          title="Update Room"
          onClick={() => openUpdateModal(rowData)}
        >
          <i className="ti ti-edit"></i>
        </button>

        {/* STATUS */}

        <button
          type="button"
          className={
            isActive
              ? "btn btn-sm btn-outline-danger"
              : "btn btn-sm btn-outline-success"
          }
          title={isActive ? "Make Room Inactive" : "Make Room Active"}
          onClick={() => openStatusModal(rowData)}
        >
          <i className={isActive ? "ti ti-ban" : "ti ti-check"}></i>
        </button>
      </div>
    );
  };

  /* ============================================================
     FACILITY DISPLAY
  ============================================================ */

  const facilityBodyTemplate = (rowData) => {
    if (!rowData.roomFacility) {
      return <span className="text-muted">-</span>;
    }

    const facilities = rowData.roomFacility
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    return (
      <div className="d-flex flex-wrap gap-1">
        {facilities.map((facility) => (
          <span key={facility} className="badge bg-light text-dark border">
            {facility}
          </span>
        ))}
      </div>
    );
  };

  /* ============================================================
     STATUS DISPLAY
  ============================================================ */

  const statusBodyTemplate = (rowData) => {
    const isActive = rowData.status === "A";

    return (
      <span className={isActive ? "badge bg-success" : "badge bg-danger"}>
        {isActive ? "Active" : "Inactive"}
      </span>
    );
  };

  /* ============================================================
     TABLE COLUMNS
  ============================================================ */

  const columns = [
    {
      field: "roomLabel",
      header: "Room",
      sortable: true,
    },

    {
      field: "roomLocation",
      header: "Location",
      sortable: true,
    },

    {
      field: "roomCapacity",
      header: "Capacity",
      sortable: true,
    },

    {
      header: "Facilities",
      body: facilityBodyTemplate,
    },

    {
      field: "teleExt",
      header: "Telephone Ext.",
    },

    {
      header: "Status",
      body: statusBodyTemplate,
      sortable: true,
    },

    {
      header: "Action",
      body: actionBodyTemplate,
      style: {
        width: "120px",
      },
    },
  ];

  /* ============================================================
     JSX
  ============================================================ */

  return (
    <>
      {/* ========================================================
          PAGE HEADER
      ======================================================== */}

      <div className="page-header">
        <div className="page-title">
          <h4>Conference Room Maintenance</h4>
        </div>

        <BreadcrumbNav
          items={[
            {
              text: "Home",
              link: portalHome,
            },
            {
              text: "Conference Room Maintenance",
            },
          ]}
        />
      </div>

      {/* ========================================================
          CARD
      ======================================================== */}

      <div className="card">
        <div className="card-body">
          {/* ====================================================
              SEARCH
          ==================================================== */}

          <div className="row mb-3">
            <div className="col-lg-4 col-md-6 col-12">
              <SDLSearch
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search Conference Rooms..."
                style={{
                  width: "270px",
                }}
              />
            </div>
          </div>

          {/* ====================================================
              TABLE
          ==================================================== */}

          <div className="conference-room-table">
            <SDLDataTable
              data={filteredData}
              columns={columns}
              loading={loading}
              emptyMessage={
                searchQuery
                  ? "No conference rooms match your search."
                  : "No conference rooms found."
              }
              removableSort
            />
          </div>
        </div>
      </div>

      {/* ========================================================
          UPDATE MODAL
      ======================================================== */}

      {showUpdateModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          role="dialog"
          style={{
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            role="document"
            style={{
              maxWidth: "650px",
            }}
          >
            <div className="modal-content">
              {/* ==================================================
                  HEADER
              ================================================== */}

              <div className="modal-header py-2">
                <h5 className="modal-title">Update Conference Room</h5>

                   <button
                    type="button"
                    className="close"
                    data-bs-dismiss="modal"
                    aria-label="Close"
                    disabled={saving}
                    onClick={closeUpdateModal}
                  >
                    <span aria-hidden="true">×</span>
                  </button>
              </div>

              {/* ==================================================
                  FORM
              ================================================== */}

              <form onSubmit={handleUpdate} noValidate>
                <div className="modal-body py-3">
                  <div className="row g-3">
                    {/* ============================================
                        ROOM NAME
                    ============================================ */}

                    <div className="col-md-6">
                      <label className="form-label mb-1">
                        Room Name
                        <span className="text-danger"> *</span>
                      </label>

                      <input
                        type="text"
                        className={`form-control ${
                          formErrors.roomLabel ? "is-invalid" : ""
                        }`}
                        value={formData.roomLabel}
                        onChange={(e) =>
                          handleFormChange("roomLabel", e.target.value)
                        }
                        disabled={saving}
                      />

                      {formErrors.roomLabel && (
                        <div className="invalid-feedback d-block">
                          {formErrors.roomLabel}
                        </div>
                      )}
                    </div>

                    {/* ============================================
                        LOCATION
                    ============================================ */}

                    <div className="col-md-6">
                      <label className="form-label mb-1">
                        Location
                        <span className="text-danger"> *</span>
                      </label>

                      <select
                        className={`form-control ${
                          formErrors.roomLocation ? "is-invalid" : ""
                        }`}
                        value={formData.roomLocation}
                        onChange={(e) =>
                          handleFormChange("roomLocation", e.target.value)
                        }
                        disabled={saving}
                      >
                        <option value="">Select Location</option>

                        {locationOptions.map((location) => (
                          <option key={location} value={location}>
                            {location}
                          </option>
                        ))}
                      </select>

                      {formErrors.roomLocation && (
                        <div className="invalid-feedback d-block">
                          {formErrors.roomLocation}
                        </div>
                      )}
                    </div>

                    {/* ============================================
                        CAPACITY
                    ============================================ */}

                    <div className="col-md-6">
                      <label className="form-label mb-1">
                        Capacity
                        <span className="text-danger"> *</span>
                      </label>

                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        className={`form-control ${
                          formErrors.roomCapacity ? "is-invalid" : ""
                        }`}
                        value={formData.roomCapacity}
                        onChange={(e) => handleCapacityChange(e.target.value)}
                        onKeyDown={(e) => {
                          if (["e", "E", "+", "-", "."].includes(e.key)) {
                            e.preventDefault();
                          }
                        }}
                        disabled={saving}
                      />

                      {formErrors.roomCapacity && (
                        <div className="invalid-feedback d-block">
                          {formErrors.roomCapacity}
                        </div>
                      )}
                    </div>

                    {/* ============================================
                        TELEPHONE EXTENSION
                    ============================================ */}

                    <div className="col-md-6">
                      <label className="form-label mb-1">
                        Telephone Extension
                      </label>

                      <input
                        type="text"
                        className="form-control"
                        value={formData.teleExt}
                        onChange={(e) =>
                          handleFormChange("teleExt", e.target.value)
                        }
                        disabled={saving}
                      />
                    </div>

                    {/* ============================================
                        FACILITIES
                    ============================================ */}

                    <div className="col-12">
                      <label className="form-label mb-1">Room Facilities</label>

                      <div
                        className="border rounded px-3 py-2"
                        style={{
                          minHeight: "48px",
                          backgroundColor: "#fafafa",
                        }}
                      >
                        <div className="row">
                          {facilityOptions.map((facility) => {
                            const checked =
                              formData.roomFacility.includes(facility);

                            const facilityId = `facility-${facility
                              .replace(/\s+/g, "-")
                              .toLowerCase()}`;

                            return (
                              <div
                                className="col-md-3 col-sm-6 col-6"
                                key={facility}
                              >
                                <div className="form-check">
                                  <input
                                    type="checkbox"
                                    className="form-check-input"
                                    id={facilityId}
                                    checked={checked}
                                    onChange={() =>
                                      handleFacilityChange(facility)
                                    }
                                    disabled={saving}
                                  />

                                  <label
                                    className="form-check-label"
                                    htmlFor={facilityId}
                                  >
                                    {facility}
                                  </label>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ==================================================
                    FOOTER
                ================================================== */}

                <div className="modal-footer py-2 gap-2">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-1"
                          role="status"
                        ></span>
                        Updating...
                      </>
                    ) : (
                      <>
                        <i className="ti ti-device-floppy me-1"></i>
                        Update
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={closeUpdateModal}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MAKE ACTIVE / INACTIVE MODAL
      ======================================================== */}

      {showStatusModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          role="dialog"
          style={{
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
        >
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              {/* ==================================================
                  HEADER
              ================================================== */}

              <div className="modal-header">
                <h5 className="modal-title">
                  {statusForm.status === "I"
                    ? "Make Room Inactive"
                    : "Make Room Active"}
                </h5>

                <button
                  type="button"
                  className="close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                  onClick={closeStatusModal}
                >
                  <span aria-hidden="true">×</span>
                </button>

              </div>

              {/* ==================================================
                  FORM
              ================================================== */}

              <form onSubmit={handleStatusUpdate} noValidate>
                <div className="modal-body">
                  {/* ==============================================
                      ROOM
                  ============================================== */}

                  <div className="mb-3">
                    <label className="form-label">Room</label>

                    <input
                      type="text"
                      className="form-control"
                      value={selectedRoom?.roomLabel || ""}
                      disabled
                    />
                  </div>

                  {/* ==============================================
                      INACTIVE REASON
                  ============================================== */}

                  {statusForm.status === "I" ? (
                    <div className="mb-3">
                      <label className="form-label">
                        Reason
                        <span className="text-danger"> *</span>
                      </label>

                      <textarea
                        className={`form-control ${
                          statusFormError ? "is-invalid" : ""
                        }`}
                        rows="4"
                        maxLength="500"
                        placeholder="Enter reason for making the room inactive..."
                        value={statusForm.reason}
                        onChange={(e) =>
                          handleStatusReasonChange(e.target.value)
                        }
                        disabled={statusSaving}
                      ></textarea>

                      {/* INLINE ERROR */}

                      {statusFormError && (
                        <div className="invalid-feedback d-block">
                          {statusFormError}
                        </div>
                      )}

                      {/* CHARACTER COUNT */}

                      <div className="d-flex justify-content-between mt-1">
                        <small className="text-muted">
                          Reason for making the room inactive
                        </small>

                        <small className="text-muted">
                          {statusForm.reason.length}
                          /500
                        </small>
                      </div>
                    </div>
                  ) : (
                    /* =============================================
                       ACTIVE CONFIRMATION
                    ============================================= */

                    <div className="alert alert-warning mb-0">
                      Are you sure you want to make this conference room active?
                    </div>
                  )}
                </div>

                {/* ==================================================
                    FOOTER
                ================================================== */}

                <div className="modal-footer gap-2">
                  {/* STATUS BUTTON */}

                  <button
                    type="submit"
                    className={
                      statusForm.status === "I"
                        ? "btn btn-danger"
                        : "btn btn-success"
                    }
                    disabled={statusSaving}
                  >
                    {statusSaving ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-1"
                          role="status"
                        ></span>
                        Updating...
                      </>
                    ) : (
                      <>
                        {statusForm.status === "I"
                          ? "Make Inactive"
                          : "Make Active"}
                      </>
                    )}
                  </button>

                  {/* CANCEL */}

                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={closeStatusModal}
                    disabled={statusSaving}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ConferenceRoomMaintenance;
