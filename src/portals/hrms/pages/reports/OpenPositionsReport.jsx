import { openOpenPositionsReport } from '../../services/reportService'
import OrganogramUnitReport from './OrganogramUnitReport'

/* Open Positions: vacant organogram locations of a company, optionally one division / department. */
const OpenPositionsReport = () => (
  <OrganogramUnitReport title='Open Positions' report='openpositions' onOpen={openOpenPositionsReport} optionalUnits />
)

export default OpenPositionsReport
