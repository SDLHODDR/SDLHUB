import { useEffect, useState } from "react";
import PrimeDataTable from "../../data-table";
import SearchFromApi from "../../data-table/search";
import { getTaskTableData } from "../../../services/authorizationService";
import AuthConferenceRoomForm from "../modal/CFR/AuthConferenceRoomForm";

const TASK_MODAL_MAP = {
    357: {
        task_modal_typ: "Conference Room Booking",
        form_header: "Conference Room Booking Request",
        form_text: "Manage Your Conference Room Booking",
        
    },
};

const ConferenceRoomAuthTable = ({ tabId }) => {
    const [authData, setAuthData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);

    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    
    const [currentPage, setCurrentPage] = useState(1);
    const [rows, setRows] = useState(10);
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

    // =========================
    // FETCH DATA
    // =========================
    useEffect(() => {
        console.log("----------TabId-----------", tabId);
        if (tabId) {
            fetchAuthRequests();
        }
    }, [tabId, currentPage, rows, refreshKey]);

    // =========================
    // RESET PAGE
    // =========================
    useEffect(() => {
        setCurrentPage(1);
    }, [refreshKey, tabId]);

    const fetchAuthRequests = async () => {
        try {
            setLoading(true);
            setAuthData([]);
            setFilteredData([]);
    
            console.log("---------API Payload---------", {
                task_id: tabId,
                page: currentPage,
                limit: rows,
            });
    
            const response = await getTaskTableData({
                task_id: tabId,
                page: currentPage,
                limit: rows,
            });
    
            console.log("---------Response API:-----------", response);

            // adjust according to API structure
            const result = response || [];
            const total = response.length || 0;
            console.log("---------Result data-----------", result);
            const formatted = result.map((item, index) => {    
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
    
            // DEBUG (optional)
            // console.log("IDS:", formatted.map((x) => x.id));
            // console.log("=====Console.log=========", formatted);
    
            setAuthData(formatted);
            setTotalRecords(total);
        } catch (error) {
            console.error("Auth API error:", error);
            setAuthData([]);
            setFilteredData([]);
        } finally {
            setLoading(false);
        }
    };

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

    console.log("=====authData=========", authData);

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

        const modalMap = TASK_MODAL_MAP[tabId];
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

    console.log("----------------Filtered------------------", filteredData);
    return (
        <>
            <div className="card table-list-card">
                {/* HEADER */}
                <div className="card-header d-flex align-items-center justify-content-between flex-wrap">
                    <SearchFromApi
                        callback={handleSearch}
                        rows={rows}
                        setRows={setRows}
                    />
                </div>

                {/* TABLE */}
                <div className="card-body">
                    <div className="table-responsive">
                        <PrimeDataTable
                            column={getColumns()}
                            data={filteredData.slice(
                                (currentPage - 1) * rows,
                                currentPage * rows
                            )}
                            rows={rows}
                            setRows={setRows}
                            currentPage={currentPage}
                            setCurrentPage={setCurrentPage}
                            totalRecords={totalRecords}
                            loading={loading}
                            dataKey="id"          // STABLE KEY
                        />
                    </div>
                </div>
            </div>

                 {/* MODAL */}
            {modalConfig.isOpen && (
                <AuthConferenceRoomForm
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

export default ConferenceRoomAuthTable;