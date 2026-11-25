import { useEffect, useState, useMemo } from "react";
import BreadcrumbNav from "../../../shared/components/BreadcrumbNav";
import SDLDataTable from "../../../shared/components/datatable/SDLDataTable";
import SDLSearch from "../../../shared/components/datatable/SDLSearch";
import "../../../shared/assets/css/companyPolicies.css";
import ConferenceRoomAuthorizationModal from "../modal/ConferenceRoomAuthorizationModal";
import { useDispatch, useSelector } from "react-redux";
import { getAuthDataResponse } from "../store/ePortalAuthorizationDataSlice";
import { formatDashDate } from "../../../shared/utils/formatUtils";
import { getCFColumns } from "./CFAuthorizationColumns";
import { handleError } from "../../../shared/services/errorHandler";

const TASK_MODAL_MAP = {
    357: {
        task_modal_typ: "Conference Room Booking",
        form_header: "Conference Room Booking Request",
        form_text: "Manage Your Conference Room Booking",
        
    },
};

const ConferenceRoomAuthorization = () => {
  const dispatch = useDispatch();
  const authData = useSelector((state) => state.eportalAuthData.data);
  const loading = useSelector((state) => state.eportalAuthData.loading);
  const [searchQuery, setSearchQuery] = useState("");
  const [listData, setListData] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const cfcolumns = getCFColumns(formatDashDate);

  const [modalConfig, setModalConfig] = useState({
      isOpen: false,
      mid: null,
      modalPage: null,
      mode: null,
      modalDate: null,
      form_header: null,
      form_text: null,
  });

  /* ================= DURATION FORMATTER ================= */
  const calculateDuration = (start, end) => {
    if (!start || !end) return "-";

    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);

    const startMinutes = sh * 60 + sm;
    const endMinutes = eh * 60 + em;

    let diff = endMinutes - startMinutes;

    // Handle overnight case (if ever needed)
    if (diff < 0) {
      diff += 24 * 60;
    }

    const hours = Math.floor(diff / 60);
    const minutes = diff % 60;

    if (hours === 0) return `${minutes} min`;
    if (minutes === 0) return `${hours} hr`;
    return `${hours} hr ${minutes} min`;
  };

  // =========================
  // FETCH DATA
  // =========================

  useEffect(() => {
    // Cancel this load if the page closes or loads another list first,
    // so a stale request can't show an error or overwrite newer data.
    const load = dispatch(getAuthDataResponse({ task_id: 357 }));
    load.unwrap().catch(error => handleError(error, { context: "Load conference room requests", fallback: "Unable to load conference room requests." }));
    return () => load.abort();
  }, [dispatch, refreshKey]);

  useEffect(() => {
    let mounted = true;
    try {
      const flattened = (authData || []).map((item) => {
        const details = item.DETAILS || {};
        return {
            id: item?.ID ?? item?.TRAN_CODE,
            empName: item.CREATED_BY,
            addedon: formatDashDate(item.CREATED_ON) || "-",
            original: item,
            details: details,
            taskIdAuth: item?.ID || null,
            room: details?.ROOM_LABEL || "-",
            noofattd: details?.NOOF_ATTD || "-",
            date: details?.ASON_DATE || "-",
            duration: calculateDuration(details?.STARTTIME, details?.ENDTIME),
            remarks: item.DETAILS.REMARKS || "-",
            task: `(${item.TASK_DESC} - ${formatDashDate(details?.ASON_DATE) || "-"})`
        };
      });
      if (mounted) setListData(flattened);
    } catch (error) {
      handleError(error, { context: "Build conference room requests rows", notify: false });
      if (mounted) setListData([]);
    }
    return () => {
      mounted = false;
    };
  }, [authData]);

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return listData;
    const query = searchQuery.trim().toLowerCase();
    return listData.filter(
      (item) =>
        (item.room || "").toLowerCase().includes(query) ||
        (item.REMARKS || "").toLowerCase().includes(query) ||
        (item.remarks || "").toLowerCase().includes(query) ||
        (item.CREATED_BY || "").toLowerCase().includes(query),
    );
  }, [searchQuery, listData]);

// =========================
// SEARCH
// =========================
// The table filters through filteredData below.
const handleSearch = (value) => setSearchQuery(value);

// =========================
// ROW CLICK → MODAL
// =========================
  const handleRowClick = (row) => {
    const taskEmployeeConfig = {
        bookByName: row.BOOK_BY_NAME,
        room: row.original?.DETAILS?.ROOM_LABEL || "-",
        date: row.original?.DETAILS?.ASON_DATE || "-",
        taskIdAuth: row.taskIdAuth,
        reason: row.original?.DETAILS?.REMARKS || "",
            TASKID: row.original?.ID || "",
            TRAN_CODE: row.original?.TRAN_CODE || "",
            addedon:row.addedon,
            task: row.task,
            room_id: row.original?.DETAILS?.ROOM_ID || "",
                    starttime: row.original?.DETAILS?.STARTTIME || row.original?.DETAILS?.START_TIME || "",
                    endtime: row.original?.DETAILS?.ENDTIME || row.original?.DETAILS?.END_TIME || "",
            book_time: row.original?.DETAILS?.BOOK_TIME || "",
            noofattd: row.original?.DETAILS?.NOOF_ATTD || "",
            room_facl1: row.original?.DETAILS?.ROOM_FACL1 || "",
            room_facl2: row.original?.DETAILS?.ROOM_FACL2 || "",
            room_facl3: row.original?.DETAILS?.ROOM_FACL3 || "",
            divsn_id: row.original?.DETAILS?.DIVSN_ID || "",
                book_by_name: row.original?.DETAILS?.BOOK_BY_NAME
                    ? `${row.original.DETAILS.BOOK_BY_EMP} - ${row.original.DETAILS.BOOK_BY_NAME}`
                    : "",
            divsn_desc: row.original?.DETAILS?.DIVSN_DESC || "",
    };

    const modalMap = TASK_MODAL_MAP[357];
    if (!modalMap) return;

    setModalConfig({
        isOpen: true,
        mode: "auth",
        mid:
            row.TRAN_CODE ??
            row.ID ??
            row.id,
        modalPage: modalMap.task_modal_typ,
        modalDate: row.addedon,
        form_header: modalMap.form_header,
        form_text: modalMap.form_text,
        showLayout: false,
        showHeader: false,
        taskIdHdn: row.taskIdAuth,
        status: row.STATUS,
        taskEmployeeConfig: taskEmployeeConfig
    });
  };

  // =========================
  // TABLE COLUMNS
  // =========================

  // CFAuthorizationColumns.jsx

  const closeModal = () => {
      setModalConfig((prev) => ({
      ...prev,
      isOpen: false
      }));
  };

  return (
    <>
      <div className="page-header">
        <div className="page-title">
          <h4>Conference Room Authorization</h4>
        </div>
        <BreadcrumbNav
          items={[
            { text: "Home", link: "/eportal/dashboard" },
            { text: "Conference Room Authorization" },
          ]}
        />
      </div>

      <div className="card">
        <div className="card-body">
          <div className="row mb-3">
            <div className="col-lg-4 col-md-6 col-12">
              <SDLSearch
                value={searchQuery}
                onChange={handleSearch}
                placeholder="Search Bookings..."
                style={{ width: "270px" }}
              />
            </div>
          </div>

          <div className="company-policies-table">
            <SDLDataTable
              data={filteredData}
              columns={cfcolumns}
              loading={loading}
              emptyMessage="No Tasks found"
              className="company-policies-grid"
              tableStyle={{ width: "100%", minWidth: "900px", tableLayout: "fixed" }}
              removableSort
              onRowClick={(e) => handleRowClick(e.data)}
            />
          </div>
        </div>
      </div>
      {/* ================= MODAL ================= */}
      {/* MODAL */}
      {modalConfig.isOpen && (
          <ConferenceRoomAuthorizationModal
              formSettings={modalConfig}
              onSuccess={() => {
                  setRefreshKey(prev => prev + 1);
              }}
              onClose={closeModal}
          />
      )}
    </>
  );
};

export default ConferenceRoomAuthorization;
