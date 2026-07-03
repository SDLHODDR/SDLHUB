import { useEffect, useState, useMemo } from "react";
import { getAttendance } from "../../services/attendanceService";
import BreadcrumbNav from "../breadcrumb-nav/BreadcrumbNav";
import SDLDataTable from "../../../../components/datatable/SDLDataTable";

const DailyAttendanceInfo = () => {
   
    const [data, setData] = useState([]);
    const [meta, setMeta] = useState({});
    const [summary, setSummary] = useState({});
    const [loading, setLoading] = useState(false); // overlay loading
    const [initialLoading, setInitialLoading] = useState(true); // first load skeleton
    const [error, setError] = useState(null);

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

    const columns = [
        {
            field: "date",
            header: "Date",
            sortable: true,
            style: { minWidth: "120px" },
        },
        {
            field: "in",
            header: "In",
            sortable: true,
            style: { minWidth: "90px" },
        },
        {
            field: "out",
            header: "Out",
            sortable: true,
            style: { minWidth: "90px" },
        },
        {
            field: "late",
            header: "Late",
            sortable: true,
            style: { minWidth: "90px" },
        },
        {
            field: "early",
            header: "Early",
            sortable: true,
            style: { minWidth: "90px" },
        },
        {
            field: "workHr",
            header: "Work Hr",
            sortable: true,
            style: { minWidth: "100px" },
        },
        {
            field: "onDesk",
            header: "On Desk",
            sortable: true,
            style: { minWidth: "100px" },
        },
        {
            field: "offDesk",
            header: "Off Desk",
            sortable: true,
            style: { minWidth: "100px" },
        },
        {
            field: "terrace",
            header: "Terrace",
            sortable: true,
            style: { minWidth: "100px" },
        },
        {
            field: "extra",
            header: "Extra",
            sortable: true,
            style: { minWidth: "90px" },
        },
        {
            field: "tour",
            header: "Tour",
            body: tourBody,
            style: { minWidth: "120px" },
        },
        {
            field: "status",
            header: "Status",
            body: statusBody,
            sortable: true,
            style: { minWidth: "130px", textAlign: "center" },
        },
    ];

    return (
        <>
            {/* HEADER */}

            <div className="page-header">
                <div className="add-item d-flex">
                    <div className="page-title">
                        <h4>Daily Attendance Information</h4>
                    </div>
                </div>

                 <BreadcrumbNav
                 items={[
                    { text: "Home", link: "/eportal/dashboard" },
                    { text: "Daily Attendance Information" },
                ]}
                />

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
                        <SDLDataTable
                            data={data}
                            columns={columns}
                            loading={loading}
                            emptyMessage="No attendance records found"
                            className="adaily-attendance-grid"
                            tableStyle={{ minWidth: "1200px" }}
                            scrollHeight="60vh"
                        />
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
