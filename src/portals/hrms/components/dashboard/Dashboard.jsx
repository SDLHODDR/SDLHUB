import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Chart from 'react-apexcharts'
import { getHrmsDashboard } from '../../services/dashboardService'
import { getNewJoinees } from '../../services/newEmployeeService'
import { getTenureChangeList } from '../../services/tenureChangeService'

/*
 * HRMS dashboard (legacy hradmin/dashboard.php). Which widgets a user sees is set
 * per profile in HR_PROFILE_DASHBOARD; the backend returns only those.
 */

// Count cards in the legacy order. A card links only where the page exists.
const COUNT_CARDS = [
  { widget: 'JoineeCnt', label: 'New Joinees', icon: 'ti ti-user-plus', color: 'bg-info', link: '/hrms/joining/new-joinee' },
  { widget: 'IntrvCnt', label: 'Pending Interviews', icon: 'ti ti-calendar-event', color: 'bg-success' },
  { widget: 'CandCnt', label: 'New Candidates', icon: 'ti ti-users', color: 'bg-warning' },
  { widget: 'CanEmpCnt', label: 'Upcoming Emp Tenure Change', icon: 'ti ti-chart-pie', color: 'bg-danger', link: '/hrms/maintainance/tenure-change' }
]

const TYPE_COLORS = ['#3B5998', '#8B0000', '#556B2F', '#FF8C00', '#4B0082']

const loadCount = async request => {
  const response = await request()
  if (!response?.status) throw new Error(response?.message)
  return Array.isArray(response.data) ? response.data.length : 0
}

const CountCard = ({ card, value }) => {
  const body = (
    <div className='card-body'>
      <div className='d-flex align-items-center justify-content-between'>
        <div>
          <p className='text-muted mb-1'>{card.label}</p>
          <h3 className='mb-0'>
            {value === undefined ? (
              <span className='spinner-border spinner-border-sm text-primary' role='status' aria-label='Loading' />
            ) : (
              value
            )}
          </h3>
        </div>
        <div className={`avatar avatar-lg ${card.color}`}>
          <i className={`${card.icon} fs-24`} aria-hidden='true'></i>
        </div>
      </div>
      {card.link && (
        <small className='d-block mt-2 text-primary'>
          More info <i className='ti ti-arrow-right' aria-hidden='true'></i>
        </small>
      )}
    </div>
  )

  return (
    <div className='col-xl-3 col-md-6 mb-3'>
      {card.link ? (
        <Link to={card.link} className='card h-100 text-reset text-decoration-none'>
          {body}
        </Link>
      ) : (
        <div className='card h-100'>{body}</div>
      )}
    </div>
  )
}

const ChartCard = ({ title, icon, children }) => (
  <div className='col-md-6 mb-3'>
    <div className='card h-100'>
      <div className='card-header'>
        <h5 className='card-title mb-0'>
          <i className={`${icon} me-2`} aria-hidden='true'></i>
          {title}
        </h5>
      </div>
      <div className='card-body'>{children}</div>
    </div>
  </div>
)

const EmployeeTypeChart = ({ rows }) => {
  if (rows.length === 0) return <p className='text-muted mb-0'>No active employees found.</p>
  const total = rows.reduce((sum, row) => sum + row.count, 0)
  const options = {
    chart: { type: 'donut' },
    labels: rows.map(row => row.type),
    colors: TYPE_COLORS,
    legend: { position: 'left' },
    dataLabels: { enabled: false },
    plotOptions: {
      pie: {
        donut: {
          size: '60%',
          labels: {
            show: true,
            total: { show: true, label: 'Total', formatter: () => String(total) }
          }
        }
      }
    }
  }
  return <Chart options={options} series={rows.map(row => row.count)} type='donut' height={300} />
}

// Exits are drawn below the axis, as in the legacy chart, but always read as positive.
const JoinersVsExitChart = ({ rows }) => {
  const options = {
    chart: { type: 'bar', stacked: true, toolbar: { show: false } },
    colors: ['#52AD96', '#EB534E'],
    plotOptions: { bar: { columnWidth: '45%' } },
    dataLabels: { enabled: false },
    xaxis: { categories: rows.map(row => row.month), title: { text: 'Months' } },
    yaxis: { labels: { formatter: value => Math.abs(Math.round(value)).toLocaleString() } },
    tooltip: { y: { formatter: value => Math.abs(value).toLocaleString() } },
    legend: { position: 'top' }
  }
  const series = [
    { name: 'Joiners', data: rows.map(row => row.joiners) },
    { name: 'Exiters', data: rows.map(row => -row.exits) }
  ]
  return <Chart options={options} series={series} type='bar' height={300} />
}

const NewApplicants = ({ requisitions }) => {
  const [activeId, setActiveId] = useState(requisitions[0]?.id)
  const active = requisitions.find(requisition => requisition.id === activeId) || requisitions[0]

  return (
    <div className='col-12 mb-3'>
      <div className='card'>
        <div className='card-header'>
          <h5 className='card-title mb-0'>
            <i className='ti ti-edit me-2' aria-hidden='true'></i>
            New Applicants
          </h5>
        </div>
        <div className='card-body'>
          {requisitions.length === 0 ? (
            <p className='text-muted mb-0'>No open requisitions with applications.</p>
          ) : (
            <div className='row'>
              <div className='col-md-4 mb-3 mb-md-0'>
                <div className='list-group' role='tablist' aria-label='Requisitions'>
                  {requisitions.map(requisition => (
                    <button
                      key={requisition.id}
                      type='button'
                      role='tab'
                      aria-selected={requisition.id === active.id}
                      className={`list-group-item list-group-item-action${requisition.id === active.id ? ' active' : ''}`}
                      onClick={() => setActiveId(requisition.id)}
                    >
                      {requisition.title}
                    </button>
                  ))}
                </div>
              </div>
              <div className='col-md-8'>
                <div className='table-responsive'>
                  <table className='table table-sm table-bordered table-hover mb-0'>
                    <thead>
                      <tr>
                        <th style={{ width: '40px' }}>#</th>
                        <th>Application Date</th>
                        <th>Name</th>
                        <th>Current CTC</th>
                        <th>Expt CTC</th>
                        <th>Locality</th>
                      </tr>
                    </thead>
                    <tbody>
                      {active.applicants.map((applicant, index) => (
                        <tr key={`${applicant.applicationIso}-${index}`}>
                          <td>{index + 1}</td>
                          <td className='text-nowrap'>{applicant.applicationDate}</td>
                          <td>{applicant.name}</td>
                          <td>{applicant.currentCtc}</td>
                          <td>{applicant.expectedCtc}</td>
                          <td>{applicant.locality}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const Dashboard = () => {
  const [dashboard, setDashboard] = useState(null)
  const [error, setError] = useState('')
  const [counts, setCounts] = useState({})

  useEffect(() => {
    let current = true
    const setCount = (widget, value) => {
      if (current) setCounts(previous => ({ ...previous, [widget]: value }))
    }

    getHrmsDashboard()
      .then(response => {
        if (!response?.status) throw new Error(response?.message)
        if (!current) return
        const data = response.data
        setDashboard(data)
        setCounts({ IntrvCnt: data.pendingInterviews, CandCnt: data.newCandidates })

        // Counted from the pages these cards open, so the numbers always match them.
        if (data.widgets.includes('JoineeCnt')) {
          loadCount(getNewJoinees).then(value => setCount('JoineeCnt', value), () => setCount('JoineeCnt', '—'))
        }
        if (data.widgets.includes('CanEmpCnt')) {
          loadCount(getTenureChangeList).then(value => setCount('CanEmpCnt', value), () => setCount('CanEmpCnt', '—'))
        }
      })
      .catch(loadError => {
        if (current && !loadError?.cancelled) setError(loadError?.message || 'Unable to load the dashboard.')
      })

    return () => {
      current = false
    }
  }, [])

  const widgets = dashboard?.widgets || []
  const has = widget => widgets.includes(widget)
  const cards = COUNT_CARDS.filter(card => has(card.widget))

  return (
    <div className='container-fluid'>
      <div className='page-header mb-3'>
        <h3 className='page-title mb-0'>Dashboard</h3>
      </div>

      {error && (
        <div className='alert alert-danger' role='alert'>
          {error}
        </div>
      )}

      {!dashboard && !error && (
        <div className='text-center py-5'>
          <span className='spinner-border text-primary' role='status' aria-label='Loading dashboard' />
        </div>
      )}

      {dashboard && widgets.length === 0 && (
        <div className='card'>
          <div className='card-body'>
            <h5 className='mb-1'>Welcome to HRMS</h5>
            <p className='text-muted mb-0'>
              No dashboard widgets are set up for your profile. Use the menu above to get started.
            </p>
          </div>
        </div>
      )}

      {cards.length > 0 && (
        <div className='row'>
          {cards.map(card => (
            <CountCard key={card.widget} card={card} value={counts[card.widget]} />
          ))}
        </div>
      )}

      {(has('EmpTypeCnt') || has('JoinVsExit')) && (
        <div className='row'>
          {has('EmpTypeCnt') && (
            <ChartCard title='Employee Type Wise Count' icon='ti ti-chart-donut'>
              <EmployeeTypeChart rows={dashboard.employeeTypes || []} />
            </ChartCard>
          )}
          {has('JoinVsExit') && (
            <ChartCard title='Joiners Vs Exit' icon='ti ti-chart-bar'>
              <JoinersVsExitChart rows={dashboard.joinersVsExit || []} />
            </ChartCard>
          )}
        </div>
      )}

      {has('NewApps') && (
        <div className='row'>
          <NewApplicants requisitions={dashboard.newApplicants || []} />
        </div>
      )}
    </div>
  )
}

export default Dashboard
