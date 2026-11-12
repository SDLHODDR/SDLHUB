import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import CancelButton from '../../../../shared/components/buttons/CancelButton'
import { confirmAction } from '../../../../shared/services/alertService'
import useExitTask from '../../hooks/useExitTask'
import {
  closeExitLetterTask,
  generateExitLetterReference
} from '../../services/exitService'
import ExitModalShell from './ExitModalShell'
import ExitEmployeeSummary from './ExitEmployeeSummary'

// Relieving letter wording: H = HO, F = Field.
const LETTER_TEMPLATES = [
  { value: 'H', label: 'HO' },
  { value: 'F', label: 'Field' }
]

const LETTER_SCRIPTS = {
  3: 'relieving_letter.php',
  4: 'experience_letter.php'
}

// Same API base as the rest of the app (proxied in development).
const letterUrl = (docId, separationId, template) =>
  `${import.meta.env.VITE_API_URL || ''}/hrms/reports/pdfReport/${LETTER_SCRIPTS[docId]}?REF_ID=${encodeURIComponent(separationId)}${docId === 3 ? `&flag=${template}` : ''}`

const ExitLetterModal = ({ config, record, onClose, onSuccess }) => {
  const task = useExitTask({ record, onClose, onSuccess })
  const [template, setTemplate] = useState('H')
  const [previewOpen, setPreviewOpen] = useState(false)
  const [activeDoc, setActiveDoc] = useState(3)
  const [pdfUrl, setPdfUrl] = useState('')
  const [pdfLoading, setPdfLoading] = useState(false)
  const [pdfError, setPdfError] = useState('')
  const pdfUrlRef = useRef('')

  const letters = task.details?.letters || []
  const separationId = task.details?.separation?.id
  const allIssued = letters.length > 0 && letters.every(letter => letter.reference)
  const referenceKey = letters.map(letter => letter.reference).join('|')

  // Load the selected letter as a PDF blob whenever the preview, letter,
  // template or issued references change.
  useEffect(() => {
    if (!previewOpen || !separationId) return undefined
    let active = true
    const load = async () => {
      setPdfLoading(true)
      setPdfError('')
      try {
        const response = await axios.get(letterUrl(activeDoc, separationId, template), {
          responseType: 'blob',
          withCredentials: true
        })
        if (!active) return
        if (response.data?.type && !response.data.type.includes('pdf')) {
          throw new Error(await response.data.text())
        }
        const url = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }))
        if (pdfUrlRef.current) URL.revokeObjectURL(pdfUrlRef.current)
        pdfUrlRef.current = url
        setPdfUrl(`${url}#toolbar=1&navpanes=0&zoom=page-width`)
      } catch (error) {
        const message =
          (await error?.response?.data?.text?.().catch(() => '')) ||
          error?.message ||
          'Unable to load the letter preview.'
        if (active) setPdfError(message)
      } finally {
        if (active) setPdfLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [previewOpen, activeDoc, template, separationId, referenceKey])

  useEffect(
    () => () => {
      if (pdfUrlRef.current) URL.revokeObjectURL(pdfUrlRef.current)
    },
    []
  )

  const handleGenerateReference = async () => {
    const confirmed = await confirmAction(
      'Generate reference codes?',
      'This will finalize the reference numbers for the Relieving and Experience letters.'
    )
    if (!confirmed) return
    const ok = await task.run('reference', () =>
      generateExitLetterReference({ user_task_id: record.ID })
    )
    if (ok) task.reload()
  }

  const handleCloseTask = async () => {
    const confirmed = await confirmAction(
      'Close task?',
      'Do you want to close this relieving and experience letter task?'
    )
    if (!confirmed) return
    task.run('close', () => closeExitLetterTask({ user_task_id: record.ID }), {
      close: true
    })
  }

  const busy = Boolean(task.busyAction)

  return (
    <ExitModalShell
      titleId='exit-letter-title'
      title={config?.title || 'Relieving and Experience Letter'}
      record={record}
      loading={task.loading}
      loadError={task.loadError}
      actionError={task.actionError}
      onClose={onClose}
      footer={<CancelButton onClick={onClose} disabled={busy} />}
    >
      {task.details && (
        <>
          <ExitEmployeeSummary
            employee={task.details.employee}
            relievingDate={task.details.separation.relievingDate}
          />

          <div className='row align-items-center g-2 pt-3 border-top'>
            <div className='col-md-4 col-sm-6'>
              <select
                className='form-select tenure-template-select tenure-change-select'
                value={template}
                onChange={event => setTemplate(event.target.value)}
                aria-label='Letter template'
              >
                {LETTER_TEMPLATES.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className='col-auto d-flex gap-2'>
              <button
                type='button'
                className='btn btn-warning fw-bold text-dark legacy-preview-btn'
                onClick={() => setPreviewOpen(true)}
                disabled={busy}
              >
                Preview Template
              </button>
              <button
                type='button'
                className='btn btn-outline-info px-3'
                style={{ height: '38px' }}
                onClick={handleCloseTask}
                disabled={busy || !allIssued}
                title={!allIssued ? 'Generate the reference codes before closing the task.' : undefined}
              >
                <i className='fas fa-print me-1'></i>{' '}
                {task.busyAction === 'close' ? 'Processing...' : 'Close Task'}
              </button>
            </div>
          </div>

          <div className='d-flex flex-wrap gap-2 mt-3'>
            {letters.map(letter => (
              <span
                key={letter.docId}
                className={`badge border px-2 py-1 ${letter.reference ? 'bg-success-subtle text-success' : 'bg-light text-muted'}`}
              >
                {letter.name}: {letter.reference || 'Reference not generated'}
              </span>
            ))}
          </div>

          {previewOpen && (
            <div className='mt-3'>
              <ul className='nav nav-tabs mb-0'>
                {letters.map(letter => (
                  <li key={letter.docId} className='nav-item'>
                    <button
                      type='button'
                      className={`nav-link${activeDoc === letter.docId ? ' active' : ''}`}
                      onClick={() => setActiveDoc(letter.docId)}
                    >
                      {letter.name}
                    </button>
                  </li>
                ))}
              </ul>
              <div
                style={{ height: '60vh', minHeight: '420px', background: '#525659' }}
                className='border rounded-bottom overflow-hidden position-relative'
              >
                {pdfLoading ? (
                  <div className='d-flex justify-content-center align-items-center h-100 text-white'>
                    <div className='spinner-border me-2' role='status' />
                    <span>Loading Document...</span>
                  </div>
                ) : pdfError ? (
                  <div className='d-flex justify-content-center align-items-center h-100 text-light small px-3 text-center'>
                    {pdfError}
                  </div>
                ) : (
                  pdfUrl && (
                    <iframe
                      title='Letter Document'
                      className='w-100 h-100 border-0'
                      src={pdfUrl}
                    />
                  )
                )}
              </div>
              {!allIssued && (
                <div className='d-flex justify-content-between align-items-center mt-2'>
                  <small className='text-muted'>
                    Click <strong>Generate Reference Code</strong> to finalize
                    reference numbering.
                  </small>
                  <button
                    type='button'
                    className='btn btn-warning fw-bold text-dark'
                    onClick={handleGenerateReference}
                    disabled={busy}
                  >
                    {task.busyAction === 'reference'
                      ? 'Processing...'
                      : 'Generate Reference Code'}
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </ExitModalShell>
  )
}

export default ExitLetterModal
