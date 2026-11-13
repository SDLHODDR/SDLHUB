import { openOrganogramMasterReport } from '../../services/reportService'
import OrganogramUnitReport from './OrganogramUnitReport'

/* Organogram Master report (legacy rept_admin.php?reptnm=orgmaster): positions of a company / division / department. */
const OrganogramMasterReport = () => (
  <OrganogramUnitReport title='Organogram Master' report='orgmaster' onOpen={openOrganogramMasterReport} />
)

export default OrganogramMasterReport
