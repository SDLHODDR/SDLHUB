import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getOutdoorDutyDataResponse } from "../../../../store/eportal/ePortalOutdoorDutySlice";
import { createOutdoorDutyHandlers } from "../../utils/outdoorDutyHandlers"; // adjust path
import BreadcrumbNav from "../breadcrumb-nav/BreadcrumbNav";
import SDLDataTable from "../../../../components/datatable/SDLDataTable";
import SDLSearch from "../../../../components/datatable/SDLSearch";
import SDLCalendar from "../../../../components/calendar/SDLCalendar";
import OutdoorDutyModal from "../../modal/OutdoorDutyModal";
import { outdoorDutyColumns } from "../../utils/columnHandlers/outdoorDutyColumns";
import Swal from "sweetalert2";
import { getAuthroizationTaskCount } from "../../../../store/eportal/ePortalAuthorizationCountSlice";

const OutdoorDuty = () => {
  const dispatch = useDispatch();
  const [listData, setListData] = useState([]);
  const [loading, setLoading] = useState(true);
  const outdoorDutydata = useSelector((state) => state.eportalODData.data);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setLoading(true);
    dispatch(getOutdoorDutyDataResponse());
  }, [dispatch, refreshKey]);

  useEffect(() => {
    let mounted = true;
    try {
      const flattened = (outdoorDutydata.data || []).map((item, index) => {
        return {
          id: item.id || index,
          asonDate: item.asondate || "-",
          outType: item.outtype || "-",
          statusText: item.approval || "-",
          remarks: item.remarks || "-",
          statusColor: item.statusColor || "-",
          status: item.status || "-",
        };
      });
      if (mounted) {
        setListData(flattened);
        setLoading(false); // data processed — stop showing spinner
      }
    } catch (error) {
      console.error(error);
      if (mounted) {
        setListData([]);
        setLoading(false); // still stop the spinner even on error, so we can show "No bookings found" instead of spinning forever
      }
    }
    return () => {
      mounted = false;
    };
  }, [outdoorDutydata]);
  console.log("=====", outdoorDutydata);
 

  /* ================= SEARCH FILTER ================= */
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return listData;

    const query = searchQuery.trim().toLowerCase();

    return listData.filter(
      (item) =>
        item.outType.toLowerCase().includes(query) ||
        item.remarks.toLowerCase().includes(query),
    );
  }, [searchQuery, listData]);

  const [modalState, setModalState] = useState({
    isOpen: false,
    mode: "create",
    modalDate: null,
  });

  const openModal = (config = {}) => {
    setLoading(true);
    console.log("=======config========", config);
    if (config.modalDate) {
      const currentDate = new Date();
      const modalDate = new Date(config.modalDate);

      // Remove time portion for accurate day comparison
      currentDate.setHours(0, 0, 0, 0);
      modalDate.setHours(0, 0, 0, 0);

      const diffTime = Math.abs(currentDate - modalDate);
      const diffDays = diffTime / (1000 * 60 * 60 * 24);

      if (diffDays > 25) {
        Swal.fire({
          icon: "warning",
          title: "Not Permitted",
          text: "It is not permitted to raise an Outdoor Duty request",
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
      //modalData: config.data || null
    });

    //console.log("=======modalState========", modalState);
    setLoading(false);
  };

  const formSettings = {
    isOpen: false,
    modalPage: "Outdoor",
    mode: "create",
    modeLabel: "Add",
    modalDate: null,
    form_header: "Outdoor Duty",
    form_text: "Manage Your outdoor duty",
    showHeader: true,
    showLayout: true,
  };

  const closeModal = () => {
    setModalState((prev) => ({
      ...prev,
      isOpen: false,
    }));
    setLoading(false);
  };

  const handleSuccess = () => {
    console.log(
      "----------------OutdoorDuty.jsx: handleSuccess called----------------",
    );
    dispatch(getOutdoorDutyDataResponse());
    // refresh GenericDataTable (Add/Edit/Delete flow)
    setRefreshKey((prev) => prev + 1);
    // refresh Authorization table (if passed)
    dispatch(getAuthroizationTaskCount());
  };

  // Build handlers (sendAuth, resendAuth, updateRemarks, closeTicketTB, viewTB, editTB, deleteTB)
  const handlers = createOutdoorDutyHandlers({
    dispatch,
    handleSuccess,
    openModal,
  });
  const columns = outdoorDutyColumns(handlers);

  console.log("==============ListData===========", listData);
  console.log("==============Data===========", filteredData);

  return (
    <>
      {/* ================= PAGE HEADER ================= */}

      <div className="page-header">
        <div className="add-item d-flex">
          <div className="page-title">
            <h4>Outdoor Duties</h4>
          </div>
        </div>

        <BreadcrumbNav
          items={[
            { text: "Home", link: "/eportal/dashboard" },
            { text: "Outdoor Duties" },
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
              <h6 className="mb-3">Outdoor Duty Preview</h6>
              <div className="position-relative flex-grow-1">
                {/* ================= SEARCH ================= */}

                <div className="row mb-3">
                  <div className="col-lg-4 col-md-6 col-12">
                    <SDLSearch
                      value={searchQuery}
                      onChange={setSearchQuery}
                      placeholder="Search Outdoor Duties..."
                      style={{ width: "120px" }}
                    />
                  </div>
                </div>
                {/* {loading ? (
                  <div className="p-4 text-center">
                    <div className="spinner-border text-warning"></div>
                  </div>
                ) : filteredData.length === 0 ? (
                  <div className="p-4 text-center text-muted">
                    No requests found
                  </div>
                ) : ( */}
                  <SDLDataTable
                    data={filteredData}
                    columns={columns}
                    loading={loading}
                    emptyMessage="No outdoor duties found"
                    removableSort
                  />
                {/*  )} */}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* ================= MODAL ================= */}
      {modalState.isOpen && (
        <OutdoorDutyModal
          formSettings={formSettings}
          modalState={modalState}
          closeModal={closeModal}
          onSuccess={handleSuccess}
        />
      )}
    </>
  );
};

export default OutdoorDuty;
