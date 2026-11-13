import { openOrganogramHierarchyReport } from '../../services/reportService'
import HierarchyLocationReport from './HierarchyLocationReport'

/* Organogram Hierarchy: every reporting path under a location, as a PDF table. */
const OrganogramHierarchyReport = () => (
  <HierarchyLocationReport
    title='Organogram Hierarchy'
    report='orglochierarchy'
    onOpen={orgLocId => openOrganogramHierarchyReport({ org_loc_id: orgLocId })}
  />
)

export default OrganogramHierarchyReport
