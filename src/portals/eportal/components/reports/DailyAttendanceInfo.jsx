import { useEffect, useState } from "react";
import { getAttendance } from "../../services/attendanceService";
import BreadcrumbNav from "../../../../shared/components/BreadcrumbNav";
import SDLDataTable from "../../../../shared/components/datatable/SDLDataTable";
import Badge from "../../../../shared/components/Badge";
import { getPortalFromPath } from "../../../../shared/config/portalConfig";
import "../../assets/css/wideContentPages.css";
import "../../assets/css/attendanceInfo.css";
import EportalPageLoader from "../loader/EportalPageLoader";

// Fixed names: en-GB gives "Sept"; other pages use dd-Mon-yyyy.
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const DailyAttendanceInfo = () => {

    const [data, setData] = useState([]);
    const [meta, setMeta] = useState({});
    const [summary, setSummary] = useState({});
    const [loading, setLoading] = useState(false); // overlay loading
    const [initialLoading, setInitialLoading] = useState(true); // first load skeleton
    const [error, setError] = useState(null);

    const [time, setTime] = useState(new Date());
    const [selectedMonth, setSelectedMonth] = useState(new Date());

	// Get current portal dynamically
	const portal = getPortalFromPath(location.pathname);
	const portalHome = `/${portal.key}/dashboard`;


    /* ================= LIVE CLOCK ================= */
    useEffect(() => {
        const t = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(t);
    }, []);

    /* ================= MONTH ================= */

    const formatMonthParam = (date) => date.toISOString().slice(0, 7);

    const formatMonthLabel = (date) =>
        `${MONTHS[date.getMonth()]} ${date.getFullYear()}`;

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
        `${String(date.getDate()).padStart(2, "0")}-${MONTHS[date.getMonth()]}-${date.getFullYear()}`;

    /* ================= STATES ================= */

    if (initialLoading) return <EportalPageLoader />;

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
            <Badge
                text={row.description}
                className={map[row.status] || "badge-secondary"}
            />
        );
    };

    const columns = [
        {
            field: "date",
            header: "Date",
            sortable: true,
            style: { width: "10%" },
        },
        {
            field: "in",
            header: "In",
            sortable: true,
            style: { width: "7%" },
        },
        {
            field: "out",
            header: "Out",
            sortable: true,
            style: { width: "7%" },
        },
        {
            field: "late",
            header: "Late",
            sortable: true,
            style: { width: "7%" },
        },
        {
            field: "early",
            header: "Early",
            sortable: true,
            style: { width: "7%" },
        },
        {
            field: "workHr",
            header: "Work Hr",
            sortable: true,
            style: { width: "8%" },
        },
        {
            field: "onDesk",
            header: "On Desk",
            sortable: true,
            style: { width: "8%" },
        },
        {
            field: "offDesk",
            header: "Off Desk",
            sortable: true,
            style: { width: "8%" },
        },
        {
            field: "terrace",
            header: "Terrace",
            sortable: true,
            style: { width: "8%" },
        },
        {
            field: "extra",
            header: "Extra",
            sortable: true,
            style: { width: "7%" },
        },
        {
            field: "tour",
            header: "Tour",
            body: tourBody,
            style: { width: "10%" },
        },
        {
            field: "status",
            header: "Status",
            body: statusBody,
            sortable: true,
            style: { width: "13%", textAlign: "center" },
        },
    ];

    return (
        <>
            {loading && <EportalPageLoader />}
            {/* HEADER */}

            <div className="page-header">
                <div className="add-item d-flex">
                    <div className="page-title">
                        <h4>Daily Attendance Information</h4>
                    </div>
                </div>

                 <BreadcrumbNav
                 items={[
                    { text: "Home", link: portalHome },
                    { text: "Daily Attendance Information" },
                ]}
                />

            </div>

            {/* META */}
            <div className="card mb-2 eportal-wide-card">
                <div className="card-body py-2 px-3 d-flex justify-content-between align-items-center flex-wrap gap-2 attendance-meta">
                    <div>
                        <strong>Shift:</strong>{" "}
                        {meta?.shift?.START_TIME} - {meta?.shift?.END_TIME}
                    </div>
                    <div><strong>From:</strong> {meta?.startDate}</div>
                    <div><strong>To:</strong> {meta?.endDate}</div>
                    <div><strong>Grace:</strong> {meta?.shift?.GRACE_HRS}</div>
                    <div className="d-flex align-items-center gap-2 attendance-month-nav">
                        <button className="btn btn-light" onClick={prevMonth} title="Previous month">
                            <i className="fas fa-chevron-left" />
                        </button>

                        <span className="attendance-month-label">
                            {formatMonthLabel(selectedMonth)}
                        </span>

                        <button className="btn btn-light" onClick={nextMonth} title="Next month">
                            <i className="fas fa-chevron-right" />
                        </button>
                    </div>
                </div>

            </div>

            {/* TOP BAR */}
            <div className="card mb-2 position-relative eportal-wide-card">

                <div className="card-body py-2 px-3">
                    <div className="d-flex justify-content-between align-items-center flex-wrap">

                        {/* LEFT */}
                        <div className="d-flex align-items-center gap-4">
                            <div>
                                <div className="attendance-today-label">Today</div>
                                <div className="attendance-today-value">
                                    {formatDate(time)}
                                </div>
                            </div>

                            <div>
                                <div className="attendance-today-label">Time</div>
                                <div className="attendance-today-value">
                                    {formatTime(time)}
                                </div>
                            </div>

                            <div>
                                <div className="attendance-today-label">Break</div>
                                <div className="attendance-today-value">
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
            <div className="card position-relative eportal-wide-card">

                <div className="card-body">
                    <div className="attendance-table">
                        <SDLDataTable
                            data={data}
                            columns={columns}
                            loading={false}
                            emptyMessage={loading ? " " : "No attendance records found"}
                            className="adaily-attendance-grid eportal-fit-table"
                            tableStyle={{ width: "100%", minWidth: "100%", tableLayout: "fixed" }}
                            scrollable={false}
                            rows={10}
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
        <div className="attendance-stat">
            <div
                className={`avatar attendance-stat-value ${color}`}
                style={{ color: isLightBg ? "#212b36" : "#fff" }}
            >
                {value ?? 0}
            </div>

            <div className="attendance-stat-label">
                {label}
            </div>
        </div>
    );
};

export default DailyAttendanceInfo;
