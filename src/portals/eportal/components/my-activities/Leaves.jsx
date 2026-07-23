import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getLeavesDataResponse } from "../../../../store/eportal/ePortalLeavesSlice";
import { createLeavesHandlers } from "../../utils/LeavesHandlers"; // adjust path
import BreadcrumbNav from "../breadcrumb-nav/BreadcrumbNav";
import SDLDataTable from "../../../../components/datatable/SDLDataTable";
import SDLSearch from "../../../../components/datatable/SDLSearch";
import SDLCalendar from "../../../../components/calendar/SDLCalendar";
import LeavesModal from "../../modal/LeavesModal";
import { leavesColumns } from "../../utils/columnHandlers/leavesColumns";
import Swal from "sweetalert2";
import { getAuthroizationTaskCount } from "../../../../store/eportal/ePortalAuthorizationCountSlice";
import { getLRDataDetails } from "../../services/leavesService";

const Leaves = () => {
  const dispatch = useDispatch();
  const [listData, setListData] = useState([]);
  const [loader, setLoader] = useState(true);
  const leavesData = useSelector((state) => state.eportalLRData.data);
  const loading = useSelector((state) => state.eportalLRData.loading);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
 

  useEffect(() => {
    dispatch(getLeavesDataResponse());
  }, [dispatch, refreshKey]);
  console.log("=====", leavesData);

  useEffect(() => {
    let mounted = true;
    try {
      const flattened = (leavesData.data || []).map((item, index) => {
        return {
          ID: item.ID || index,
          LVE_DATE_FR: item.LVE_DATE_FR || "-",
          LVE_DATE_TO: item.LVE_DATE_TO || "-",
          //LVE_START_ON: item.LVE_START_ON || "-",
          //LVE_END_ON: item.LVE_END_ON || "-",
          LVE_CODE: item.LVE_CODE || "-",
          NO_DAYS: item.NO_DAYS || "-",
          REMARKS: item.REMARKS || "-",
          statusText: item.STATUS || "-",
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
  }, [leavesData]);

  console.log("=======LIstData=====", listData);
  /* ================= SEARCH FILTER ================= */
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return listData;

    const query = searchQuery.trim().toLowerCase();
    return listData.filter(
      (item) =>
        item.LVE_CODE.toLowerCase().includes(query) ||
        item.REMARKS.toLowerCase().includes(query), 
    );
  }, [searchQuery, listData]);

  const [modalState, setModalState] = useState({
    isOpen: false,
    mode: "create",
    modalDate: null,
  });

  const openModal = (config = {}) => {
    setLoader(true);
    console.log("-----------CoNFIG---------------", config);
    if (config.modalDate) {
      const currentDate = new Date();
      const modalDate = new Date(config.modalDate);

      // Remove time portion for accurate day comparison
      currentDate.setHours(0, 0, 0, 0);
      modalDate.setHours(0, 0, 0, 0);

      // 1st day of current month
      const firstDayCurrentMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
      );

      // Last day of NEXT month
      const lastDayNextMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 2,
        0
      );

      // Format dates as "1 July 2026"
      const formatDate = (date) => {
        return date.toLocaleDateString("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });
      };

      const formattedFirstDay = formatDate(firstDayCurrentMonth);
      const formattedLastDay = formatDate(lastDayNextMonth);

      console.log("==========firstDayCurrentMonth========", formattedFirstDay);
      console.log("==========lastDayNextMonth========", formattedLastDay);

      if (modalDate < firstDayCurrentMonth || modalDate > lastDayNextMonth) {
        Swal.fire({
          icon: "warning",
          title: "Not Permitted",
          text: `Leave can only be requested between ${formattedFirstDay} and ${formattedLastDay}`,
        });

        return;
      }
    }

    const formatLocalDateTime = (date) => {
      const pad = (n) => String(n).padStart(2, '0');

      const year = date.getFullYear();
      const month = pad(date.getMonth() + 1);
      const day = pad(date.getDate());
      const hours = pad(date.getHours());
      const minutes = pad(date.getMinutes());
      const seconds = pad(date.getSeconds());

      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    };

    const fetchLRData = async () => {
        try {
          setLoader(true);
          const response = await getLRDataDetails({
            id: config.modalDate || null,
            //ID: mid || null,
            ID: config.modalDate || null,
            getLrdata: false,
            checkModalDate: true,
            ro: undefined,
            //hiddenTaskId: formConfig.taskIdHdn || null
            modal_date: formatLocalDateTime(config.modalDate || null)
          });
    
          //console.log("================= Response ------", response);
          if(response.flag === "Yes") {
            setModalState({
              isOpen: true,
              mode: config.mode || "create",
              modalDate: config.modalDate || null,
              id: config.id || null,
              isPostRemark: config.isPostRemark || null,
            });
          } else if(response.flag === "No") {
            Swal.fire({
              icon: "error",
              title: "Error",
              text: "You have already applied leave!",
            });

            setModalState({
              isOpen: false,
              mode: config.mode || "create",
              modalDate: config.modalDate || null,
              id: config.id || null,
              isPostRemark: config.isPostRemark || null,
            });
          }
          
        } catch (error) {
          console.error("Error fetching Leave Request Data:", error);
        } finally {
          setLoader(false);
        }
      };

    fetchLRData();

    setLoader(false);
  };

  const formSettings = {
    isOpen: false,
    modalPage: "Leave",
    mode: "create",
    modeLabel: "Add",
    modalDate: null,
    form_header: "Leaves",
    form_text: "Manage Your leaves",
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
    dispatch(getLeavesDataResponse());
    // refresh GenericDataTable (Add/Edit/Delete flow)
    setRefreshKey((prev) => prev + 1);
    // refresh Authorization table (if passed)
    dispatch(getAuthroizationTaskCount());
  };

  // Build handlers (sendAuth, resendAuth, updateRemarks, closeTicketTB, viewTB, editTB, deleteTB)
  const handlers = createLeavesHandlers({ handleSuccess, openModal });
  const columns = leavesColumns(handlers);

  // console.log("==============ListData===========", listData);
  //   console.log("==============Data===========", filteredData);

  return (
    <>
      {/* ================= PAGE HEADER ================= */}

      <div className="page-header">
        <div className="add-item d-flex">
          <div className="page-title">
            <h4>Leaves Request</h4>
          </div>
        </div>

        <BreadcrumbNav
          items={[
            { text: "Home", link: "/eportal/dashboard" },
            { text: "Leaves Request" },
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
              <h6 className="mb-3">Leave Request Preview</h6>
              <div className="position-relative flex-grow-1">
                {/* ================= SEARCH ================= */}

                <div className="row mb-3">
                  <div className="col-lg-4 col-md-6 col-12">
                    <SDLSearch
                      value={searchQuery}
                      onChange={setSearchQuery}
                      placeholder="Search Leaves..."
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
        <LeavesModal
          formSettings={formSettings}
          modalState={modalState}
          closeModal={closeModal}
          onSuccess={handleSuccess}
        />
      )}
    </>
  );
};

export default Leaves;
