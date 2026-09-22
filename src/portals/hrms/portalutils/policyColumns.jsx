import { formatDashDate } from '../../eportal/utils/formatUtils'
import EditButton from '../components/buttons/EditButton'

export const policyColumns = ({ handleEdit }) => [
  {
    field: 'COMP_DESC',
    header: 'Company Name',
    style: { width: '30%' }
  },
  // {
  //   field: "DEPT_DESC",
  //   header: "Department Name",
  //   style: { width: "14%" },
  // },
  // {
  //   field: "DIVSN_DESC",
  //   header: "Division Name",
  //   style: { width: "14%" },
  // },
  {
    field: 'POLICY_NAME',
    header: 'Policy Name',
    style: { width: '24%' }
  },
  {
    header: 'Start Date',
    style: { textAlign: 'center' },
    body: row => formatDashDate(row.START_DATE_DISPLAY)
  },
  {
    header: 'End Date',
    style: { textAlign: 'center' },
    body: row => formatDashDate(row.END_DATE_DISPLAY)
  },
  // {
  //   field: "START_DATE_DISPLAY",
  //   header: "Start Date",
  //   style: { width: "8%", textAlign: "center" },
  // },
  // {
  //   field: "END_DATE_DISPLAY",
  //   header: "End Date",
  //   style: { width: "8%", textAlign: "center" },
  // },
  // {
  //   field: "POLICY_DESC",
  //   header: "Policy Description",
  //   style: { width: "18%" },
  // },
  {
    header: 'Download Document',
    body: row =>
      row.DOC_PATH ? (
        <a
          href={row.DOC_PATH}
          target='_blank'
          rel='noopener noreferrer'
          aria-label='Download policy document'
          className='btn btn-sm btn-outline-primary d-flex align-items-center justify-content-center mx-auto'
          style={{
            width: '30px',
            height: '30px',
            padding: 0
          }}
        >
          <i className='fas fa-download icon-xl' />
        </a>
      ) : (
        '-'
      )
  },
  {
    header: 'Status',
    body: row =>
      row.STATUS === 'A' ? (
        <span className='text-muted'>Published</span>
      ) : (
        <EditButton onClick={() => handleEdit(row)} ariaLabel='Edit Policy' />
      ),
    style: { textAlign: 'center' }
  }
]
