import { openOrganogramHierarchyChart } from '../../services/reportService'
import HierarchyLocationReport from './HierarchyLocationReport'

/* Organogram Hierarchy - Visual: the tree under a location, opened as a chart page in a new tab. */
const OrganogramHierarchyVisualReport = () => (
  <HierarchyLocationReport
    title='Organogram Hierarchy - Visual'
    report='orglochierarchyvisual'
    onOpen={openOrganogramHierarchyChart}
  />
)

export default OrganogramHierarchyVisualReport
