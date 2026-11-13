import { openRequisitionTrackerReport } from '../../services/reportService'
import PeriodReport from './PeriodReport'

/* Requisition wise Tracker (legacy rept_admin.php?reptnm=req_track): candidates of each request raised in the period, by status. */
const RequisitionTrackerReport = () => <PeriodReport title='Requisition Tracker' onOpen={openRequisitionTrackerReport} />

export default RequisitionTrackerReport
