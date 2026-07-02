import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../../../auth/AuthProvider";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { getAttendance } from "../../services/attendanceService";
import { Link } from "react-router-dom";

const DailyAttendanceInfo = () => {
    const { user } = useContext(AuthContext);

    const [data, setData] = useState([]);
    const [meta, setMeta] = useState({});
    const [summary, setSummary] = useState({});
    const [loading, setLoading] = useState(false); // overlay loading
    const [initialLoading, setInitialLoading] = useState(true); // first load skeleton
    const [error, setError] = useState(null);

    const [rows, setRows] = useState(10);

    const [time, setTime] = useState(new Date());
    const [selectedMonth, setSelectedMonth] = useState(new Date());

    /* ================= LIVE CLOCK ================= */
    useEffect(() => {
        const t = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(t);
    }, []);

    /* ================= MONTH ================= */

    const formatMonthParam = (date) => date.toISOString().slice(0, 7);

    const formatMonthLabel = (date) =>
        date.toLocaleDateString("en-GB", {
            month: "short",
            year: "numeric",
        });

    const prevMonth = () => {
        const d = new Date(selectedMonth);
        d.setMonth(d.getMonth() - 1);
        setSelectedMonth(d);
    };

    const nextMonth = () => {
        const d = new Date(selectedMonth);
        d.setMonth(d.getMonth() + 1);
        setSelectedMonth(d);
    };

    /* ================= FETCH ================= */

    useEffect(() => {
        const controller = new AbortController();

        const fetchAttendance = async () => {
            try {
                setError(null);

                if (!initialLoading) setLoading(true);

                const res = await getAttendance(
                    formatMonthParam(selectedMonth),
                    controller.signal
                );

                if (res.status) {
                    const apiData = res.data || [];

                    setData(apiData);
                    setMeta(res.meta || {});
                    setSummary(res.meta?.summary || {});

                    setRows(apiData.length || 31);
                } else {
                    setError(res.message || "API Error");
                }
            } catch (err) {
                if (err.name !== "CanceledError") {
                    setError(err.message);
                }
            } finally {
                setLoading(false);
                setInitialLoading(false);
            }
        };

        fetchAttendance();
        return () => controller.abort();
    }, [selectedMonth]);


    /* ================= FORMAT ================= */

    const formatTime = (date) =>
        date.toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
        });

    const formatDate = (date) =>
        date.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });

    /* ================= STATES ================= */

    if (initialLoading) return <AttendanceSkeleton />;

    if (error) return <p className="text-danger">{error}</p>;

    const tourBody = (row) => row.tour || "-";

    const statusBody = (row) => {
        const map = {
            P: "bg-success-transparent",
            A: "bg-danger-transparent",
            H: "bg-purple-transparent",
            W: "bg-primary-transparent",
            L: "bg-warning-transparent",
        };

        return (
            <span className={`badge ${map[row.status] || "badge-secondary"}`}>
                {row.description}
            </span>
        );
    };

    return (
        <>
            {/* HEADER */}

            <div className="page-header">
                <div className="add-item d-flex">
                    <div className="page-title">
                        <h4>Daily Attendance Information</h4>
                    </div>
                </div>

                <nav aria-label="breadcrumb">
                    <ol className="breadcrumb">
                        <li className="breadcrumb-item">
                            <Link to="/eportal/dashboard">Home</Link>
                        </li>
                        <li
                            className="breadcrumb-item active"
                            aria-current="page"
                        >
                            Daily Attendance Information
                        </li>
                    </ol>
                </nav>
            </div>

            {/* META */}
            <div className="card mb-2">
                <div className="card-body py-2 px-3 d-flex justify-content-between">
                    <div>
                        <strong>Shift:</strong>{" "}
                        {meta?.shift?.START_TIME} - {meta?.shift?.END_TIME}
                    </div>
                    <div><strong>From:</strong> {meta?.startDate}</div>
                    <div><strong>To:</strong> {meta?.endDate}</div>
                    <div><strong>Grace:</strong> {meta?.shift?.GRACE_HRS}</div>
                    <div className="d-flex align-items-center gap-2">
                        <button className="btn btn-sm btn-light" onClick={prevMonth}>
                            ◀
                        </button>

                        <span className="fw-semibold" style={{ minWidth: 100, textAlign: "center" }}>
                            {formatMonthLabel(selectedMonth)}
                        </span>

                        <button className="btn btn-sm btn-light" onClick={nextMonth}>
                            ▶
                        </button>
                    </div>
                </div>

            </div>

            {/* TOP BAR */}
            <div className="card mb-2 position-relative">

                {/* overlay loader */}
                {loading && (
                    <div
                        className="position-absolute w-100 h-100 d-flex align-items-center justify-content-center"
                        style={{ background: "rgba(255,255,255,0.6)", zIndex: 10 }}
                    >
                        <div className="spinner-border text-primary"></div>
                    </div>
                )}

                <div className="card-body py-2 px-3">
                    <div className="d-flex justify-content-between align-items-center flex-wrap">

                        {/* LEFT */}
                        <div className="d-flex align-items-center gap-4">
                            <div>
                                <div className="text-muted">Today</div>
                                <div className="fw-semibold fs-18">
                                    {formatDate(time)}
                                </div>
                            </div>

                            <div>
                                <div className="text-muted">Time</div>
                                <div className="fw-bold fs-18">
                                    {formatTime(time)}
                                </div>
                            </div>

                            <div>
                                <div className="text-muted">Break</div>
                                <div className="fw-semibold fs-18">
                                    {meta?.todayBreak || "00:00"}
                                </div>
                            </div>
                        </div>

                        {/* RIGHT */}
                        <div className="d-flex align-items-center gap-3 flex-wrap">
                            <MiniStat label="Total Days" value={summary.totalDays} color="bg-primary-transparent" />
                            <MiniStat label="Present Days" value={summary.present} color="bg-success-transparent" />
                            <MiniStat label="Absent Days" value={summary.absent} color="bg-danger-transparent" />
                            <MiniStat label="Leave Days" value={summary.leave} color="bg-warning-transparent" />
                            <MiniStat label="Late Days" value={summary.lateDays} color="bg-info-transparent" />
                            <MiniStat label="Holiday Days" value={summary.holidays} color="bg-purple-transparent" />
                        </div>
                    </div>
                </div>
            </div>

            {/* TABLE */}
            <div className="card position-relative">

                {loading && (
                    <div
                        className="position-absolute w-100 h-100 d-flex align-items-center justify-content-center"
                        style={{ background: "rgba(255,255,255,0.6)", zIndex: 10 }}
                    >
                        <div className="spinner-border text-primary"></div>
                    </div>
                )}

                <div className="card-body">
                    <div className="attendance-table">
    <DataTable
    value={data}
    loading={loading}
    paginator={data.length > 10}
    rows={rows}
    rowsPerPageOptions={[10, 20, 31]}
    onPage={(e) => setRows(e.rows)}
    stripedRows
    showGridlines
    scrollable
    responsiveLayout="scroll"
    removableSort
    paginatorDropdownAppendTo="self"
    emptyMessage="No attendance records found"
    className="p-datatable-sm"
>
    <Column field="date" header="Date" sortable />
    <Column field="in" header="In" sortable />
    <Column field="out" header="Out" sortable />
    <Column field="late" header="Late" sortable />
    <Column field="early" header="Early" sortable />
    <Column field="workHr" header="Work Hr" sortable />
    <Column field="onDesk" header="On Desk" sortable />
    <Column field="offDesk" header="Off Desk" sortable />
    <Column field="terrace" header="Terrace" sortable />
    <Column field="extra" header="Extra" sortable />
    <Column field="tour" header="Tour" body={tourBody} />
    <Column field="status" header="Status" body={statusBody} sortable />
</DataTable>
</div>
                </div>
            </div>
        </>
    );
};

/* ================= MINI STAT ================= */

const MiniStat = ({ label, value, color }) => {
    const isLightBg = color?.includes("transparent");

    return (
        <div style={{ minWidth: 90 }} className="text-center">
            <div
                className={`avatar fw-bold ${color}`}
                style={{
                    width: 44,
                    height: 44,
                    fontSize: 15,
                    color: isLightBg ? "#333" : "#fff" // ✅ fix contrast
                }}
            >
                {value ?? 0}
            </div>

            <div style={{ fontSize: 12 }}>
                {label}
            </div>
        </div>
    );
};



/* ================= SKELETON ================= */

const AttendanceSkeleton = () => (
    <div className="card">
        <div className="card-body">

            <div className="d-flex justify-content-between mb-3">
                <div className="placeholder-glow">
                    <span className="placeholder col-6"></span>
                </div>

                <div className="d-flex gap-2">
                    {[...Array(6)].map((_, i) => (
                        <span key={i} className="placeholder"
                            style={{ width: 40, height: 40, borderRadius: 8 }} />
                    ))}
                </div>
            </div>

            {[...Array(8)].map((_, i) => (
                <div key={i} className="placeholder-glow mb-2">
                    <span className="placeholder col-12"></span>
                </div>
            ))}
        </div>
    </div>
);

export default DailyAttendanceInfo;
