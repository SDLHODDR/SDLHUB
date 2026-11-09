import { useCallback, useEffect, useState } from 'react'
import BreadcrumbNav from '../../../../shared/components/BreadcrumbNav'
import SDLDataTable from '../../../../shared/components/datatable/SDLDataTable'
import SDLCalendar from '../../../../shared/components/calendar/SDLCalendar'
import SaveButton from '../../../../shared/components/buttons/SaveButton'
import CancelButton from '../../../../shared/components/buttons/CancelButton'
import EditButton from '../../../../shared/components/buttons/EditButton'
import {
  confirmAction,
  notifyError,
  notifySuccess
} from '../../../../shared/services/alertService'
import { parseDateValue, toDateInputValue } from '../../../../shared/utils/commonUtils'
import { getNewJoinees, saveNewJoinee } from '../../services/newEmployeeService'
import '../../../../shared/assets/css/companyPolicies.css'
import '../../assets/css/tenureChange.css'

const RequiredMark = () => <span className='text-danger'>*</span>

const JoineeModal = ({ joinee, onClose, onSaved, onSubmitted }) => {
  const [form, setForm] = useState({
    joiningDate: joinee.joiningIso || joinee.tentativeIso || '',
    joiningLocation: joinee.joiningLocation || joinee.orgLocation || '',
    joiningRemarks: joinee.joiningRemarks || ''
  })
  const [errors, setErrors] = useState({})
  const [busyAction, setBusyAction] = useState('')
  // Submit uses the saved details, so it is enabled only once they are saved.
  const [saved, setSaved] = useState(
    Boolean(joinee.joiningIso && joinee.joiningLocation && joinee.joiningRemarks)
  )
  const busy = Boolean(busyAction)

  const update = (field, value) => {
    setForm(current => ({ ...current, [field]: value }))
    setErrors(current => ({ ...current, [field]: '' }))
    setSaved(false)
  }

  const handleSave = async () => {
    const next = {}
    if (!form.joiningDate) next.joiningDate = 'Joining date is required.'
    if (!form.joiningLocation.trim()) next.joiningLocation = 'Joining location is required.'
    if (!form.joiningRemarks.trim()) next.joiningRemarks = 'Joining remarks are required.'
    setErrors(next)
    if (Object.keys(next).length > 0) return

    setBusyAction('save')
    try {
      const response = await saveNewJoinee({
        app_id: joinee.appId,
        action: 'save',
        joining_date: form.joiningDate,
        joining_location: form.joiningLocation.trim(),
        joining_remarks: form.joiningRemarks.trim()
      })
      if (!response?.status) throw new Error(response?.message)
      notifySuccess(response.message)
      setSaved(true)
      onSaved()
    } catch (error) {
      notifyError(error?.message || 'Unable to save the joining details.')
    } finally {
      setBusyAction('')
    }
  }

  const handleSubmit = async () => {
    const confirmed = await confirmAction(
      'Submit joinee?',
      `This fills the position and generates the Employee Code Generation task for ${joinee.name}.`
    )
    if (!confirmed) return

    setBusyAction('submit')
    try {
      const response = await saveNewJoinee({ app_id: joinee.appId, action: 'submit' })
      if (!response?.status) throw new Error(response?.message)
      notifySuccess(response.message)
      window.dispatchEvent(new Event('hrms-auth-tasks-changed'))
      onSubmitted()
    } catch (error) {
      notifyError(error?.message || 'Unable to submit the joinee.')
      setBusyAction('')
    }
  }

  const fieldError = field =>
    errors[field] && <small className='text-danger d-block mt-1'>{errors[field]}</small>

  return (
    <div
      className='modal fade show d-block tenure-modal-backdrop'
      tabIndex='-1'
      role='dialog'
      aria-modal='true'
      aria-labelledby='new-joinee-title'
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
    >
      <div className='modal-dialog modal-lg modal-dialog-centered'>
        <div className='modal-content shadow-lg border-0'>
          <div className='modal-header'>
            <div>
              <h5 className='modal-title mb-1' id='new-joinee-title'>
                Add Joining Remarks
              </h5>
              <small className='text-muted'>
                Candidate Name: <strong>{joinee.name}</strong>
              </small>
            </div>
            <button type='button' className='close' onClick={onClose} aria-label='Close' disabled={busy}>
              <span aria-hidden='true'>&times;</span>
            </button>
          </div>
          <div className='modal-body tenure-change-page'>
            <div className='row g-3'>
              <div className='col-md-6'>
                <label className='form-label'>
                  Joining Date <RequiredMark />
                </label>
                <SDLCalendar
                  value={parseDateValue(form.joiningDate)}
                  allowAllDates
                  inputClassName={errors.joiningDate ? 'is-invalid' : ''}
                  onChange={date => update('joiningDate', toDateInputValue(date))}
                />
                {fieldError('joiningDate')}
              </div>
              <div className='col-md-6'>
                <label className='form-label' htmlFor='new-joinee-location'>
                  Joining Location <RequiredMark />
                </label>
                <input
                  id='new-joinee-location'
                  type='text'
                  className={`form-control${errors.joiningLocation ? ' is-invalid' : ''}`}
                  value={form.joiningLocation}
                  maxLength={50}
                  onChange={event => update('joiningLocation', event.target.value)}
                />
                {fieldError('joiningLocation')}
              </div>
              <div className='col-12'>
                <label className='form-label' htmlFor='new-joinee-remarks'>
                  Joining Remarks <RequiredMark />
                </label>
                <textarea
                  id='new-joinee-remarks'
                  className={`form-control${errors.joiningRemarks ? ' is-invalid' : ''}`}
                  rows={3}
                  value={form.joiningRemarks}
                  maxLength={100}
                  onChange={event => update('joiningRemarks', event.target.value)}
                />
                {fieldError('joiningRemarks')}
              </div>
            </div>
          </div>
          <div className='modal-footer'>
            <SaveButton onClick={handleSave} disabled={busy} isSubmitting={busyAction === 'save'} className='me-2'>
              Save
            </SaveButton>
            <button
              type='button'
              className='btn btn-success me-2'
              onClick={handleSubmit}
              disabled={busy || !saved}
              title={!saved ? 'Save the joining details before submitting.' : undefined}
            >
              {busyAction === 'submit' ? 'Processing...' : 'Submit'}
            </button>
            <CancelButton onClick={onClose} disabled={busy} />
          </div>
        </div>
      </div>
    </div>
  )
}

/*
 * New Joinee (legacy new_joinee.php): selected candidates with a tentative
 * joining date. HR saves the joining details, then submits, which creates the
 * Employee Code Generation task (3).
 */
const NewJoinee = () => {
  const [joinees, setJoinees] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)

  const loadJoinees = useCallback(async () => {
    setLoading(true)
    try {
      const response = await getNewJoinees()
      if (!response?.status) throw new Error(response?.message)
      setJoinees(response.data || [])
    } catch (error) {
      if (!error?.cancelled) notifyError(error?.message || 'Unable to load the new joinees.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // Async load; state is only set after the request resolves.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadJoinees()
  }, [loadJoinees])

  const columns = [
    { field: 'reqId', header: 'Req. ID', sortable: true, style: { width: '90px' } },
    { field: 'name', header: 'Name', sortable: true, style: { width: '220px' } },
    { field: 'organogram', header: 'Organogram', sortable: true },
    { field: 'orgLocation', header: 'Org. Location', sortable: true, style: { width: '170px' } },
    {
      field: 'tentativeIso',
      header: 'Tentative Joining Date',
      sortable: true,
      body: row => <span className='text-nowrap'>{row.tentativeDate}</span>,
      style: { width: '170px' }
    },
    {
      header: 'Action',
      body: row => (
        <div className='d-flex justify-content-center'>
          <EditButton
            onClick={() => setSelected(row)}
            ariaLabel={`Add joining remarks for ${row.name}`}
            iconClassName='ti ti-user-plus'
          />
        </div>
      ),
      style: { width: '80px', textAlign: 'center' }
    }
  ]

  return (
    <>
      <div className='page-header' style={{ marginBottom: '8px' }}>
        <div className='page-title'>
          <BreadcrumbNav
            items={[
              { text: 'Home', link: '/hrms/dashboard' },
              { text: 'Joining', link: '#' },
              { text: 'New Joinee' }
            ]}
          />
        </div>
      </div>

      <div className='row'>
        <div className='col-12 px-0'>
          <div className='card'>
            <div className='card-body'>
              <SDLDataTable
                data={joinees}
                columns={columns}
                loading={loading}
                emptyMessage='No New Joinees Found'
                className='company-policies-grid fit-width-grid'
                removableSort
                tableStyle={{ width: '100%' }}
              />
            </div>
          </div>
        </div>
      </div>

      {selected && (
        <JoineeModal
          key={selected.appId}
          joinee={selected}
          onClose={() => setSelected(null)}
          onSaved={loadJoinees}
          onSubmitted={() => {
            setSelected(null)
            loadJoinees()
          }}
        />
      )}
    </>
  )
}

export default NewJoinee
