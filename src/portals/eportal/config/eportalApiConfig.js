export const EPORTAL_API = {
  MENU: {
    GET_MENU: "/getMenu.php",
  }, 
  PAYSLIPS: {
    GET_PAYSLIPS: "/payslips/getPayslips.php",
  },
  DOCUMENTS: {
    GET_DOCUMENTS: "/getDocuments.php",
  },
  POLICIES: {
    GET_POLICIES: "/getPolicies.php",
    GET_ACTIVE_POLICIES: "/getActivePolicies.php",
  },
  HOLIDAYS: {
    GET_HOLIDAYS: "/holidays/getHolidays.php",
    GET_HOLIDAY_RULES: "/holidays/getHolidayRules.php",
  },
  CONFERENCE_ROOM: {
    GET_CONFERENCE_ROOM_BOOKINGS: "/conference/getConferenceRooms.php",
    GET_BOOKING_DROPDOWN_DATA: "/conference/getBookingDropdownData.php",
    GET_BOOKING_AUTHDROPDOWN_DATA: "/conference/getBookingAuthDropdownData.php",
    CANCEL_CONFERENCE_BOOKING: "/conference/cancelConferenceBooking.php",
    CONFERENCE_ACTION: "/conference/conferenceAction.php",
    CONFERENCE_YEARLY: "/conference/getConferenceYearly.php",
    EXPORT_CONFERENCE_BOOKING_DATA: "conference/exportConferenceBookings.php",

    AUTHCBRData: "/conference/authConferenceRooms.php",
    REJECTCBRData: "/conference/authConferenceRooms.php",
  },
  PROFILE_MAINTENANCE: {
    ADD_PROFILE: "/profile/addProfile.php",
    GET_PROFILES: "/profile/getProfiles.php",
    GET_PROFILE_ACCESS: "/profile/getProfileAccess.php",
    SAVE_DASH: "/profile/saveDash.php",
    SAVE_MENU: "/profile/saveMenu.php",
    SAVE_TASK: "/profile/saveTask.php",
    GET_PROFILE_USERS: "/profile/getProfileUsers.php",
  },
  EMPLOYEE_ACCESS: {
    GET_EMPLOYEE_ACCESS_DROPDOWNS: "/employeeAccess/getEmployeeAccessDropdowns.php",
    GET_EMPLOYEE_ACCESS_DATA: "/employeeAccess/getEmployeeAccessData.php",
    SAVE_EMPLOYEE_PROFILES: "/employeeAccess/saveEmployeeProfiles.php"
  },
  ATTENDANCE: {
    GET_ATTENDANCE: "/getAttendance.php",
  },
  DASHBOARD: {
    STATS: "/dashboard_stats.php",
    ATTENDANCE_LOG: "/dashboard/attendanceLog.php",
    ATTENDANCE_10_DAYS: "/dashboard/attendanceLast10Days.php",
    LEAVE_SUMMARY: "/dashboard/leaveSummary.php",
    WORK_SUMMARY: "/dashboard/workSummary.php",
    BIRTHDAYS: "/dashboard/birthdays.php",
    ALERTS: "/dashboard/dashboardAlerts.php",
    IT_REMARKS: "/dashboard/itRemarks.php",
    ACCESS_DATA: "/dashboard/getDashboardAccessData.php"
  },
  IT_RETURN:{
    GET_INCOME_DATA: "/itreturn/getItReturnData.php", // Get income Data
    GET_DEDUCTION_DATA: "/itreturn/getDeductionData.php", // Get deduction Data
    GET_FORM12B_DATA: "/itreturn/getForm12B.php", // Get form12 B Data
    GET_PREVIEW_DATA: "/itreturn/getPreview.php", // Get preview Data
    GET_EXEMPTION_DATA: "/itreturn/getExemptionData.php", // Get exemption Data
    DELETE_EXEMPTION: "/itreturn/deleteExemptionData.php", // Delete exemption Data
    SAVE_REGIME: "/itreturn/saveRegime.php", // Save regime Data
    SAVE_OTHER_INCOME: "/itreturn/saveOtherIncome.php", // Save other income Data
    SAVE_DEDUCTIONS: "/itreturn/saveDeductions.php", // Save deductions Data
    SAVE_EXEMPTIONS: "/itreturn/saveExemptions.php", // Save exemptions Data
    SAVE_FORM_12B: "/itreturn/saveForm12B.php", // Save form 12B Data
    GET_EMPLOYEE_SUMMARY: "/itreturn/getEmployeeSummary.php", // Save employee summary
    GET_CONFIG: "/itreturn//getItReturnConfig.php" // get config params to set the window open for employees for duration
  },
  DOWNLOAD_ITR:{
    GET_EMPLOYEE_DROPDOWN: "/getEmployeeDropdown.php", 
    DOWNLOAD_ITR_DOCUMENT: "/downloadDocuments.php", // Download ITR Docs   
    DOWNLOAD_ITR_DECLARAION: "/downloadDeclaration.php", // Download ITR Docs   
  }, 
  ITR_DOWNLOAD_REPORT: {
    GET_REPORT: "/reports/getItrDownloadReport.php",
    EXPORT_REPORT: "/reports/exportItrDownloadReport.php",
  },
  POLICY_ENDORSEMENT: {
    GET_ENDORSEMENT_REPORT: "/reports/getPolicyEndorsementReport.php",
    GET_ACCEPTANCE_DETAILS: "/reports/getPolicyAcceptanceDetails.php",
    EXPORT_ACCEPTANCE_REPORT: "/reports/exportPolicyAcceptanceReport.php", 
  },
}
