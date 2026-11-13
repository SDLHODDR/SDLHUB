import { openCandidateTrackerReport } from '../../services/reportService'
import PeriodReport from './PeriodReport'

/* Candidate wise Tracker: each candidate of the requests raised in the period, with the date of every stage reached. */
const CandidateTrackerReport = () => <PeriodReport title='Candidate Tracker' onOpen={openCandidateTrackerReport} />

export default CandidateTrackerReport
