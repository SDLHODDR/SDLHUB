import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import BreadcrumbNav from '../../../../shared/components/BreadcrumbNav'
import { getOrganogramHierarchyTree } from '../../services/reportService'
import '../../assets/css/orgHierarchyChart.css'

/** Ids of the nodes above `depth` levels (open by default: the old chart showed two levels). */
const idsAbove = (node, depth, level = 0, ids = new Set()) => {
  if (level < depth && node.children.length) {
    ids.add(node.id)
    node.children.forEach(child => idsAbove(child, depth, level + 1, ids))
  }
  return ids
}

const NodeCard = ({ data, expanded, onToggle }) => (
  <div className={`org-chart-node${data.vacant ? ' org-chart-node-vacant' : ''}`} title={`${data.title}\n${data.desi}, ${data.dept}`}>
    <div className='org-chart-node-name'>
      <i className='ti ti-users me-1' />
      {data.name}
    </div>
    <div className='org-chart-node-title'>{data.title}</div>
    <div className='org-chart-node-desi'>{data.desi}</div>
    {data.children.length > 0 && (
      <button
        type='button'
        className='org-chart-toggle org-chart-no-print'
        aria-expanded={expanded}
        aria-label={`${expanded ? 'Hide' : 'Show'} the ${data.children.length} locations under ${data.title}`}
        onClick={onToggle}
      >
        <i className={`ti ${expanded ? 'ti-chevron-up' : 'ti-chevron-down'}`} />
        {!expanded && <span className='ms-1'>{data.children.length}</span>}
      </button>
    )}
  </div>
)

/* One box and, when open, its children below on one row (lines drawn in orgHierarchyChart.css). */
const TreeBranch = ({ node, open, onToggle }) => {
  const expanded = open.has(node.id)
  return (
    <li>
      <NodeCard data={node} expanded={expanded} onToggle={() => onToggle(node.id)} />
      {expanded && node.children.length > 0 && (
        <ul>
          {node.children.map(child => (
            <TreeBranch key={child.id} node={child} open={open} onToggle={onToggle} />
          ))}
        </ul>
      )}
    </li>
  )
}

/*
 * Organogram Hierarchy - Visual (legacy organogram/index.php): the organogram tree under a location,
 * opened in its own tab. Hover a box for designation and department; the arrow under a box shows or hides
 * its children; Print / Save as PDF prints the chart only. (PrimeReact's OrganizationChart is not used: in
 * 10.9.8 it repeats every child row of a node with more than 10 children.)
 */
const OrganogramHierarchyChart = () => {
  const [params] = useSearchParams()
  const orgLocId = params.get('org_loc_id') || ''
  const [result, setResult] = useState(null)
  const [loadError, setLoadError] = useState('')
  const [open, setOpen] = useState(() => new Set())
  const scrollRef = useRef(null)

  useEffect(() => {
    if (!/^\d+$/.test(orgLocId)) return undefined
    let active = true
    getOrganogramHierarchyTree(orgLocId)
      .then(response => {
        if (!response?.status) throw new Error(response?.message)
        if (!active) return
        setResult(response.data)
        if (response.data.tree) setOpen(idsAbove(response.data.tree, 1))
      })
      .catch(error => {
        if (active) setLoadError(error?.message || 'Unable to load the organogram.')
      })
    return () => {
      active = false
    }
  }, [orgLocId])

  // A wide tree starts scrolled to its middle, where the top box is.
  useEffect(() => {
    const box = scrollRef.current
    if (box) box.scrollLeft = (box.scrollWidth - box.clientWidth) / 2
  }, [result])

  const toggle = id =>
    setOpen(current => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  const error = /^\d+$/.test(orgLocId) ? loadError : 'Please select a location from the Organogram Hierarchy - Visual report.'

  return (
    <>
      <div className='page-header org-chart-no-print' style={{ marginBottom: '8px' }}>
        <div className='page-title'>
          <h4>Organogram Hierarchy - Visual</h4>
        </div>
        <BreadcrumbNav
          items={[{ text: 'Home', link: '/hrms/dashboard' }, { text: 'Reports', link: '#' }, { text: 'Organogram Hierarchy - Visual' }]}
        />
      </div>
      <div className='card org-chart-print'>
        <div className='card-body'>
          {error && <div className='alert alert-danger mb-0'>{error}</div>}
          {!error && !result && (
            <div className='text-center py-5'>
              <div className='spinner-border text-primary' role='status'>
                <span className='visually-hidden'>Loading...</span>
              </div>
            </div>
          )}
          {!error && result && (
            <>
              <div className='d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3'>
                <div>
                  <strong>Parent :</strong> {result.parent} <span className='text-muted'>({result.count} locations)</span>
                </div>
                <div className='d-flex gap-2 org-chart-no-print'>
                  <button type='button' className='btn btn-outline-primary btn-sm' onClick={() => setOpen(idsAbove(result.tree, Number.MAX_SAFE_INTEGER))}>
                    Expand All
                  </button>
                  <button type='button' className='btn btn-outline-primary btn-sm' onClick={() => setOpen(idsAbove(result.tree, 1))}>
                    Collapse All
                  </button>
                  <button type='button' className='btn btn-primary btn-sm' onClick={() => window.print()}>
                    <i className='ti ti-printer me-1' />
                    Print / Save as PDF
                  </button>
                </div>
              </div>
              {!result.tree ? (
                <div className='alert alert-warning mb-0'>No organogram found under this location.</div>
              ) : (
                <div className='org-chart-scroll' ref={scrollRef}>
                  <ul className='org-tree'>
                    <TreeBranch node={result.tree} open={open} onToggle={toggle} />
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default OrganogramHierarchyChart
