import { useEffect, useState, useRef } from "react";
import { getDashboardData } from "../../services/dashboardService";

import UpcomingBirthdays from "./widgets/UpcomingBirthdays";
import AttendanceLog from "./widgets/AttendanceLog";
import Attendance10Days from "./widgets/Last10DaysAttendance";
import ITRemarksAlert from "./widgets/ItRemarks";
import DashboardAlerts from "./widgets/DashboardAlerts";
import WorkLeaveTabs from "./widgets/WorkLeaveTabs";
import MeetingsWidget from "./widgets/MeetingsWidget";

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [attendance10Days, setAttendance10Days] = useState([]);
  const [dashAccess, setDashAccess] = useState([]);

  const hasLoaded = useRef(false);

  useEffect(() => {
    if (hasLoaded.current) return;

    hasLoaded.current = true;

    const loadDashboard = async () => {
      try {
        const res = await getDashboardData();

        if (!res) return;

        setData(res);

        setDashAccess(
          Array.isArray(res.dashAccessData?.dashAccess)
            ? res.dashAccessData.dashAccess
            : []
        );

        // Load slow API separately
        if (res._last10Days) {
          const records = await res._last10Days;

          //console.log(records);
          setAttendance10Days(
            Array.isArray(records) ? records : []
          );
        }
      } catch (err) {
        console.error("Dashboard load failed:", err);
      }
    };

    loadDashboard();
  }, []);

  if (!data) {
    return (
      <div className="d-flex align-items-center justify-content-center vh-100">
        <div className="text-center">
          <div
            className="spinner-border text-primary mb-3"
            role="status"
          />
          <div className="fw-semibold">
            Loading dashboard...
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* IT Remarks */}
      {dashAccess.includes("itremarks") && (
        <ITRemarksAlert data={data.itRemarks} />
      )}

      <div className="container-fluid">
        {/* Alerts */}
         <DashboardAlerts alerts={data.alerts} />
        {dashAccess.includes("alerts") && (
          <DashboardAlerts alerts={data.alerts} />
        )}

        <div className="row g-3">
          {/* Attendance */}
          {dashAccess.includes("tdyinout") && (
            <div className="col-lg-4">
              <AttendanceLog
                initialData={data.attendanceLog}
              />
            </div>
          )}

          {/* Work Summary */}
          {dashAccess.includes("wdsum") && (
            <div className="col-lg-4">
              <WorkLeaveTabs
                workData={data.workSummary}
                leaveData={
                  dashAccess.includes("ldsum")
                    ? data.leaveSummary
                    : []
                }
              />
            </div>
          )}

          {/* Meetings + Birthdays */}
          {(dashAccess.includes("meetings") ||
            dashAccess.includes("dyqts")) && (
            <div className="col-lg-4">
              <MeetingsWidget data={data.meetings} />

              {dashAccess.includes("dyqts") && (
                <UpcomingBirthdays
                  data={data.birthdays}
                />
              )}
            </div>
          )}

          {/* Last 10 Days Attendance */}
          {dashAccess.includes("10dyattd") && (
            <div className="col-lg-12">
              <Attendance10Days
                data={attendance10Days}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Dashboard;