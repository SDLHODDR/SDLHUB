import { useEffect, useState, useMemo } from "react";
import BreadcrumbNav from "../../portals/eportal/components/breadcrumb-nav/BreadcrumbNav";
import SDLDataTable from "../datatable/SDLDataTable";
import SDLSearch from "../datatable/SDLSearch";
import "../../portals/eportal/assets/css/companyPolicies.css";
import { getTaskTableData } from "../../services/authorizationService";
import ConferenceRoomAuthorizationModal from "../../portals/eportal/modal/ConferenceRoomAuthorizationModal";
//import Swal from "sweetalert2";
import { useDispatch, useSelector } from "react-redux";
import { getAuthDataResponse } from "../../store/eportal/ePortalAuthorizationDataSlice";
import { getAuthroizationTaskCount } from "../../store/eportal/ePortalAuthorizationCountSlice";

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
  //const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [listData, setListData] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [tabId, setTabId] = useState(357);

  //const [currentPage, setCurrentPage] = useState(1);
  //const [rows, setRows] = useState(10);
  //const [authData, setAuthData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
   const [totalRecords, setTotalRecords] = useState(0);

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
//   useEffect(() => {
//     fetchAuthRequests();
//   }, [ refreshKey]);

  useEffect(() => {
    dispatch(getAuthDataResponse({ task_id: 357 }));
  }, [dispatch, refreshKey]);

  useEffect(() => {
    let mounted = true;
    try {
      const flattened = (authData || []).map((item) => {
        const details = item.DETAILS || {};
        return {
            id: item?.ID ?? item?.TRAN_CODE,
            empName: item.CREATED_BY,
            addedon: formatDate(item.CREATED_ON) || "-",
            original: item,
            details: details,
            taskIdAuth: item?.ID || null,
            room: details?.ROOM_LABEL || "-",
            date: details?.ASON_DATE || "-",
            duration: calculateDuration(details?.STARTTIME, details?.ENDTIME),
            remarks: item.DETAILS.REMARKS || "-",
            task: `(${item.TASK_DESC} - ${formatDate(details?.ASON_DATE) || "-"})`
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
  }, [authData]);

  // useMemo now runs on every render, no matter what
  const filteredData1 = useMemo(() => {
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
  // RESET PAGE
  // =========================
//   useEffect(() => {
//       setCurrentPage(1);
//   }, [refreshKey, tabId]);

//   const fetchAuthRequests = async () => {
//     try {
//         setLoading(true);
//         setAuthData([]);
//         setFilteredData([]);

//         console.log("---------API Payload---------", {
//             task_id: 357,
//             //page: currentPage,
//             //limit: rows,
//         });

//         const response = await getTaskTableData({
//             task_id: 357,
//             //page: currentPage,
//             //limit: rows,
//         });

//         console.log("---------Response API:-----------", response);

//         // adjust according to API structure
//         const result = response || [];
//         const total = response.length || 0;
//         console.log("---------Result data-----------", result);
//         const formatted = result.map((item, index) => {    
//             const details = item.DETAILS || {};

//             return {
//                 id: item?.ID ?? item?.TRAN_CODE,
//                 empName: item.CREATED_BY,
//                 addedon: formatDate(item.CREATED_ON) || "-",
//                 original: item,
//                 details: details,
//                 taskIdAuth: item?.ID || null,
//                 room: details?.ROOM_LABEL || "-",
//                 date: details?.ASON_DATE || "-",
//                 duration: calculateDuration(details?.STARTTIME, details?.ENDTIME),
//                 remarks: item.DETAILS.REMARKS || "-",
//                 task: `(${item.TASK_DESC} - ${formatDate(details?.ASON_DATE) || "-"})`
//             };
//         });

//         // DEBUG (optional)
//         // console.log("IDS:", formatted.map((x) => x.id));
//         // console.log("=====Console.log=========", formatted);

//         setAuthData(formatted);
//         setTotalRecords(total);
//     } catch (error) {
//         console.error("Auth API error:", error);
//         setAuthData([]);
//         setFilteredData([]);
//     } finally {
//         setLoading(false);
//     }
// };

const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    if (isNaN(date)) return "-";

    return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

// =========================
// SYNC FILTERED DATA
// =========================
useEffect(() => {
    setFilteredData(authData);
}, [authData]);

// =========================
// SEARCH
// =========================
const handleSearch = (value) => {
    setSearchQuery(value);

    if (!value) {
        setFilteredData(authData);
        return;
    }

    const filtered = authData.filter((item) =>
    Object.values(item)
        .join(" ")
        .toLowerCase()
        .includes(value.toLowerCase())
    );

    setFilteredData(filtered);
};

// =========================
// ROW CLICK → MODAL
// =========================
  const handleRowClick = (row) => {
    console.log("=========mdalMap=======", TASK_MODAL_MAP[tabId]);
    console.log("----------ROWDATA-----------", row );
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
                    starttime: row.original?.DETAILS?.START_TIME || "",
                    endtime: row.original?.DETAILS?.END_TIME || "",
            book_time: row.original?.DETAILS?.BOOK_TIME || "",
            noofattd: row.original?.DETAILS?.NOOF_ATTD || "",
            room_facl1: row.original?.DETAILS?.ROOM_FACL1 || "",
            room_facl2: row.original?.DETAILS?.ROOM_FACL2 || "",
            room_facl3: row.original?.DETAILS?.ROOM_FACL3 || "",
            divsn_id: row.original?.DETAILS?.DIVSN_ID || "",
                book_by_name: row.original?.DETAILS?.BOOK_BY_NAME || "",
    };

    console.log("----------taskEmployeeConfig-----------", taskEmployeeConfig );

    const modalMap = TASK_MODAL_MAP[357];
    if (!modalMap) return;

    //const status = row.original?.STATUS;
    console.log("=========mdalMap=======", modalMap);
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
  
  const getColumns = () => {
   
    const baseColumns = [
      { 
          field: "addedon", 
          header: "Request On",
          body: (row) => (
          <span className="request-date">
              {row.addedon}
          </span>
          )
      },
      {
          field: "empName",
          header: "Request By",
          body: (row) => (
          <span
              className="text-primary"
              style={{
              cursor: "pointer",
              textDecoration: "underline",
              fontWeight: 500,
              }}
              onClick={() => handleRowClick(row)}
          >
              {row.empName}
          </span>
          ),
      },
      
    
    ];

    // Add columns based on tabId
    if (357) {
        return [
            ...baseColumns,
            { field: "room", header: "Room" },
            { field: "remarks", header: "Reason"}, 
            { field: "date", header: "Date" },
            { field: "duration", header: "Duration" },
            { field: "task", header: "Task" },
        ];
    }

    return baseColumns;
  }; 

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
                placeholder="Search Policies..."
                style={{ width: "120px" }}
              />
            </div>
          </div>

          <div className="company-policies-table">
            <SDLDataTable
              data={filteredData1}
              columns={getColumns()}
              loading={loading}
              emptyMessage="No Tasks found"
              className="company-policies-grid"
              removableSort
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
                  console.log("Refreshing this table...");
                  setRefreshKey(prev => prev + 1);
              }}
              onClose={closeModal}
          />
      )}
    </>
  );
};

export default ConferenceRoomAuthorization;
