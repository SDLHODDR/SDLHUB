import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getTicketBookingDataResponse } from "../../../../store/eportal/ePortalTicketBookingSlice";
import { createTicketBookingHandlers } from "../../utils/ticketBookingHandlers"; // adjust path
import BreadcrumbNav from "../breadcrumb-nav/BreadcrumbNav";
import SDLDataTable from "../../../../components/datatable/SDLDataTable";
import SDLSearch from "../../../../components/datatable/SDLSearch";
import SDLCalendar from "../../../../components/calendar/SDLCalendar";
import TicketBookingModal from "../../modal/TicketBookingModal";
import { ticketBookingColumns } from "../../utils/columnHandlers/ticketBookingColumns";
import Swal from "sweetalert2";
import { getAuthroizationTaskCount } from "../../../../store/eportal/ePortalAuthorizationCountSlice";

const TicketBooking = () => {
  const dispatch = useDispatch();
  const [listData, setListData] = useState([]);
  const [loader, setLoader] = useState(true);
  const ticketBookingData = useSelector((state) => state.eportalTBRData.data);
  const loading = useSelector((state) => state.eportalTBRData.loading);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    dispatch(getTicketBookingDataResponse());
  }, [dispatch, refreshKey]);

  useEffect(() => {
    let mounted = true;
    try {
      const flattened = (ticketBookingData.data || []).map((item, index) => {
        return {
          id: item.id || index,
          person_name: item.person_name || "-",
          //trvl_mode: item.trvl_mode || "-",
          trvl_date: item.trvl_date || "-",
          trvl_from_location: item.trvl_from_location || "-",
          trvl_to_loc: item.trvl_to_loc || "-",
          trvl_ft_name: item.trvl_ft_name || "-",
          trvl_ft_no: item.trvl_ft_no || "-",
          //ttnt_depr_time: item.ttnt_depr_time || "-",
          statusText: item.approval || "-",
          remarks: item.remarks || "-",
          statusColor: item.statusColor || "-",
          status: item.status || "-",
        };
      });
      if (mounted) setListData(flattened);
    } catch (error) {
      console.error(error);
      if (mounted) setListData([]);
    }
    return () => {
      mounted = false;
    };
  }, [ticketBookingData]);

  /* ================= SEARCH FILTER ================= */
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return listData;

    const query = searchQuery.trim().toLowerCase();

    return listData.filter(
      (item) =>
        item.person_name?.toLowerCase().includes(query) ||
        item.trvl_mode?.toLowerCase().includes(query) ||
        item.remarks?.toLowerCase().includes(query),
    );
    
  }, [searchQuery, listData]);

  const [modalState, setModalState] = useState({
    isOpen: false,
    mode: "create",
    modalDate: null,
  });

  const openModal = (config = {}) => {
    setLoader(true);
    if (config.modalDate) {
      const currentDate = new Date();
      const modalDate = new Date(config.modalDate);

      // Remove time portion for accurate day comparison
      currentDate.setHours(0, 0, 0, 0);
      modalDate.setHours(0, 0, 0, 0);

      // No Math.abs() — we want to know direction, not just distance
      const diffTime = modalDate - currentDate;
      const diffDays = diffTime / (1000 * 60 * 60 * 24);

      console.log("==========diffDays========", diffDays);

      if (diffDays < 0) {
        // modalDate is before today → block it
        Swal.fire({
          icon: "warning",
          title: "Not Permitted",
          text: "It is not permitted to raise a Ticket Booking request for past dates",
        });

        return;
      }
    }

    setModalState({
      isOpen: true,
      mode: config.mode || "create",
      modalDate: config.modalDate || null,
      id: config.id || null,
      isPostRemark: config.isPostRemark || null,
    });

    setLoader(false);
  };

  const formSettings = {
    isOpen: false,
    modalPage: "TicketBooking",
    mode: "create",
    modeLabel: "Add",
    modalDate: null,
    form_header: "Ticket Booking",
    form_text: "Manage Your ticket booking",
    showHeader: true,
    showLayout: true,
  };

  const closeModal = () => {
    setModalState((prev) => ({
      ...prev,
      isOpen: false,
    }));
    setLoader(false);
  };

  const handleSuccess = () => {
    dispatch(getTicketBookingDataResponse());
    // refresh GenericDataTable (Add/Edit/Delete flow)
    setRefreshKey((prev) => prev + 1);
    // refresh Authorization table (if passed)
    dispatch(getAuthroizationTaskCount());
  };

  // Build handlers (sendAuth, resendAuth, updateRemarks, closeTicketTB, viewTB, editTB, deleteTB)
  const handlers = createTicketBookingHandlers({ dispatch, handleSuccess, openModal });
  const columns = ticketBookingColumns(handlers);

  return (
    <>
      {/* ================= PAGE HEADER ================= */}
      <div className="page-header">
        <div className="add-item d-flex">
          <div className="page-title">
            <h4>Ticket Booking</h4>
          </div>
        </div>

        <BreadcrumbNav
          items={[
            { text: "Home", link: "/eportal/dashboard" },
            { text: "Ticket Booking" },
          ]}
        />
      </div>

      {/* ================= MAIN CARD ================= */}
      <div className="card">
        <div className="card-body">
          <div className="row">
            {/* ================= LEFT SIDE OUTDOOR DUTY LIST ================= */}
            <div className="col-xl-3 border-end">
              <SDLCalendar openModal={openModal} />
            </div>
            {/* ================= RIGHT SIDE PDF PREVIEW ================= */}
            <div className="col-xl-9 d-flex flex-column">
              <h6 className="mb-3">Ticket Booking Preview</h6>
              <div className="position-relative flex-grow-1">
                {/* ================= SEARCH ================= */}
                <div className="row mb-3">
                  <div className="col-lg-4 col-md-6 col-12">
                    <SDLSearch
                      value={searchQuery}
                      onChange={setSearchQuery}
                      placeholder="Search Ticket Booking..."
                      style={{ width: "120px" }}
                    />
                  </div>
                </div>
                {/* ================= TABLE ================= */}
                <SDLDataTable
                  data={filteredData}
                  columns={columns}
                  loading={loading}
                  emptyMessage="No ticket booking found"
                  removableSort
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* ================= MODAL ================= */}
      {modalState.isOpen && (
        <TicketBookingModal
          formSettings={formSettings}
          modalState={modalState}
          closeModal={closeModal}
          onSuccess={handleSuccess}
        />
      )}
    </>
  );
};

export default TicketBooking;