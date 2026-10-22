import React, { useState, useEffect } from 'react'
import Swal from 'sweetalert2'
import axios from 'axios'

import {
  getTenureLetterDetails,
  generateTenureLetterReference,
  closeTenurePrintTask
} from '../../../hrms/services/tenureChangeService'
import '../../assets/css/tenureChange.css'
import SaveButton from '../../components/buttons/SaveButton'
import CancelButton from '../../components/buttons/CancelButton'

const TenureChangeLetterModal = ({
  config,
  show,
  record,
  onClose,
  onSuccess
}) => {
  // const modalCenterStyle = useTenureModalCenter(show);
  const [loading, setLoading] = useState(false)
  const [details, setDetails] = useState(null)
  const [staffType, setStaffType] = useState('')

  // Preview sub-modal state
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [pdfBlobUrl, setPdfBlobUrl] = useState('')
  const [pdfLoading, setPdfLoading] = useState(false)
  const [generatingRef, setGeneratingRef] = useState(false)

  // Embedded PDF state (when DOC_REF is already generated)
  const [embeddedPdfUrl, setEmbeddedPdfUrl] = useState('')
  const [embeddedLoading, setEmbeddedLoading] = useState(false)

  const empCode =
    record?.TRAN_CODE ||
    record?.REC_ID ||
    record?.EMP_CODE ||
    record?.EMP_CODE_FOR ||
    ''
  const taskId = record?.TASK_ID || ''
  const tenureChangeId = record?.TENURE_CHG_ID || ''

  // Reset or load details on open/close
  useEffect(() => {
    if (show) {
      if (empCode) {
        fetchDetails()
      } else {
        setLoading(false)
        Swal.fire({
          icon: 'error',
          title: 'Missing Information',
          text: 'Employee code (TRAN_CODE) is missing from the record.'
        })
      }
    } else {
      cleanupBlobUrls()
      setDetails(null)
      setStaffType('')
      setShowPreviewModal(false)
    }
  }, [show, empCode])

  // Load the embedded PDF whenever doc_ref is present on the record
  useEffect(() => {
    if (show && details?.doc_ref && empCode) {
      loadEmbeddedPdf()
    }
  }, [show, details?.doc_ref, empCode, staffType])

  // Clean up object URLs on component unmount
  useEffect(() => {
    return () => {
      cleanupBlobUrls()
    }
  }, [])

  const cleanupBlobUrls = () => {
    if (pdfBlobUrl) {
      URL.revokeObjectURL(pdfBlobUrl.split('#')[0])
      setPdfBlobUrl('')
    }
    if (embeddedPdfUrl) {
      URL.revokeObjectURL(embeddedPdfUrl.split('#')[0])
      setEmbeddedPdfUrl('')
    }
  }

  const fetchDetails = async () => {
    setLoading(true)
    try {
      const response = await getTenureLetterDetails({
        empCode,
        tenureChangeId,
        taskId
      })

      const resData = response?.data?.data ? response.data : response

      if (resData && (resData.status === true || resData.success === true)) {
        const data = resData.data
        setDetails(data)

        if (data?.etype_id) {
          setStaffType(mapEtypeIdToMode(data.etype_id))
        }

        if (data.salary_approved === false || data.int_sal === 0) {
          Swal.fire({
            title: 'Salary Approve!',
            text: 'Salary Approval pending at EPP system. Please get it approved, to print tenure change letter.',
            icon: 'warning',
            confirmButtonColor: '#d33',
            confirmButtonText: 'Close',
            allowOutsideClick: false
          })
        }
      } else {
        Swal.fire(
          'Error',
          resData?.message || 'Failed to load employee details.',
          'error'
        )
      }
    } catch (err) {
      console.error('Error fetching tenure letter details:', err)
      Swal.fire('Error', 'Error connecting to the server.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const mapEtypeIdToMode = etypeId => {
    switch (String(etypeId)) {
      case '1':
        return 'P'
      case '6':
        return 'E'
      case '2':
        return 'C'
      case '5':
        return 'Pro'
      default:
        return 'Prob'
    }
  }

  const resolveTemplateUrl = (selectedType, code) => {
    let script = 'confirmation_letter_revised.php'
    const typeStr = String(selectedType)

    if (typeStr === 'E' || typeStr === '6') {
      script = 'extension_letter_trainee.php'
    } else if (typeStr === 'C' || typeStr === '2') {
      script = 'extension_letter_contract.php'
    } else if (typeStr === 'Pro' || typeStr === '5') {
      script = 'extension_letter_probation.php'
    } else if (typeStr === 'Prob') {
      script = 'probation_letter.php'
    }

    const baseUrl = import.meta.env.VITE_BASE_URL || ''
    return `${baseUrl}/hrms/reports/pdfReport/${script}?EMP_CODE=${encodeURIComponent(
      code
    )}`
  }

  // Preview Button Handler (Modal popup)
  const handlePreviewTemplate = async () => {
    if (!staffType) {
      Swal.fire({
        icon: 'info',
        title: 'Please Select',
        text: 'Please select a letter template first.'
      })
      return
    }

    const url = resolveTemplateUrl(staffType, empCode)

    setPdfLoading(true)
    setShowPreviewModal(true)

    try {
      const response = await axios.get(url, {
        responseType: 'blob',
        withCredentials: true
      })

      if (pdfBlobUrl) {
        URL.revokeObjectURL(pdfBlobUrl.split('#')[0])
      }

      const file = new Blob([response.data], { type: 'application/pdf' })
      const rawUrl = URL.createObjectURL(file)
      setPdfBlobUrl(`${rawUrl}#toolbar=1&navpanes=0&zoom=page-width`)
    } catch (error) {
      console.error('PDF Preview Error:', error)
      Swal.fire(
        'Error',
        'Could not load the letter preview from server.',
        'error'
      )
      setShowPreviewModal(false)
    } finally {
      setPdfLoading(false)
    }
  }

  // Embedded PDF loader for when reference code exists
  const loadEmbeddedPdf = async () => {
    const url = resolveTemplateUrl(staffType || details?.etype_id, empCode)
    setEmbeddedLoading(true)
    try {
      const response = await axios.get(url, {
        responseType: 'blob',
        withCredentials: true
      })

      if (embeddedPdfUrl) {
        URL.revokeObjectURL(embeddedPdfUrl.split('#')[0])
      }

      const file = new Blob([response.data], { type: 'application/pdf' })
      const rawUrl = URL.createObjectURL(file)
      setEmbeddedPdfUrl(`${rawUrl}#toolbar=1&navpanes=0&zoom=page-width`)
    } catch (err) {
      console.error('Failed to load embedded PDF document:', err)
    } finally {
      setEmbeddedLoading(false)
    }
  }

  const handleGenerateRefCode = async () => {
    setGeneratingRef(true)
    try {
      const response = await generateTenureLetterReference({
        empCode,
        tenureChangeId: details?.tenure_chg_id || tenureChangeId
      })

      const isSuccess =
        response?.status === true ||
        response?.success === true ||
        response?.data?.status === true ||
        response?.data?.success === true

      const successMsg =
        response?.message ||
        response?.data?.message ||
        'Reference Code generated Successfully!'

      if (isSuccess) {
        Swal.fire({
          title: successMsg,
          icon: 'success',
          timer: 1800,
          showConfirmButton: false
        })

        setShowPreviewModal(false)
        fetchDetails()
        if (onSuccess) onSuccess()
      } else {
        Swal.fire(
          'Error',
          response?.message ||
            response?.data?.message ||
            'Failed to generate Reference Code.',
          'error'
        )
      }
    } catch (err) {
      console.error('Error generating reference code:', err)
      const serverMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Server error while generating reference code.'

      Swal.fire({
        icon: 'error',
        title: 'Reference Generation Failed',
        html: `<div style="text-align:left; font-size:13px; max-height:200px; overflow:auto;">
                 <b>Details:</b> ${serverMessage}
               </div>`
      })
    } finally {
      setGeneratingRef(false)
    }
  }

  const handleCloseTask = () => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to close this tenure print task?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, Close Task'
    }).then(async result => {
      if (result.isConfirmed) {
        try {
          const res = await closeTenurePrintTask({
            empCode,
            tenureChangeId: details?.tenure_chg_id || tenureChangeId,
            taskId,
            authId: record?.ID || ''
          })

          const isSuccess =
            res?.status === true ||
            res?.success === true ||
            res?.data?.success === true ||
            res?.data?.status === true

          const successMsg =
            res?.message ||
            res?.data?.message ||
            'Tenure change print task closed successfully.'

          if (isSuccess) {
            Swal.fire({
              icon: 'success',
              title: 'Success',
              text: successMsg,
              timer: 1500,
              showConfirmButton: false
            })
            onClose()
            if (onSuccess) onSuccess()
          } else {
            Swal.fire(
              'Error',
              res?.message || res?.data?.message || 'Failed to close task.',
              'error'
            )
          }
        } catch (error) {
          console.error('Error closing tenure print task:', error)
          const errMsg =
            error?.response?.data?.message ||
            error?.message ||
            'Server error while closing task.'
          Swal.fire('Error', errMsg, 'error')
        }
      }
    })
  }

  if (!show) return null

  return (
    <>
      {/* Primary Modal: Compact 3-Column Layout */}
      <div
        className='modal fade show d-block tenure-modal-backdrop'
        tabIndex='-1'
        role='dialog'
        aria-modal='true'
        aria-labelledby='tenure-letter-title'
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      >
        <div
          className='modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable'
          style={{ width: '92%', maxWidth: '1200px' }}
        >
          <div className='modal-content border-0 shadow-lg tenure-compact-modal'>
            {/* Header */}
            <div className='modal-header py-2 px-4 d-flex justify-content-between align-items-center border-bottom bg-white'>
              <div>
                <h5
                  className='modal-title font-weight-bold text-dark m-0'
                  id='tenure-letter-title'
                >
                  Print Tenure Change Letter
                </h5>
                <small className='text-muted'>
                  Employee Code: <strong>{details?.emp_code || empCode || '-'}</strong>
                  <span className='mx-2'>|</span>
                  Task ID: <strong>{record?.ID || '-'}</strong>
                  <span className='mx-2'>|</span>
                  Workflow Task: <strong>{record?.TASK_ID || config?.id || '-'}</strong>
                </small>
              </div>
              <button
                type='button'
                className='close'
                onClick={onClose}
                aria-label='Close'
              >
                <span aria-hidden='true'>&times;</span>
              </button>
            </div>

            {/* Body */}
            <div className='modal-body px-4 py-3 bg-white'>
              {loading ? (
                <div className='text-center py-4'>
                  <div
                    className='spinner-border text-primary spinner-border-sm'
                    role='status'
                  />
                  <span className='ms-2 text-muted fw-semibold small'>
                    Loading employee details...
                  </span>
                </div>
              ) : details ? (
                <>
                  <div className='row g-2 tenure-legacy-grid'>
                    <div className='col-md-4'>
                      <strong className='grid-label'>Employee : </strong>
                      <span className='grid-val'>
                        {details.emp_code} - {details.emp_name}
                      </span>
                    </div>
                    <div className='col-md-4'>
                      <strong className='grid-label'>Date Of Joining : </strong>
                      <span className='grid-val'>{details.doj || '-'}</span>
                    </div>
                    <div className='col-md-4'>
                      <strong className='grid-label'>Tenure Due Date : </strong>
                      <span className='grid-val text-dark'>
                        {details.tenure_due_date || '-'}
                      </span>
                    </div>

                    <div className='col-md-4'>
                      <strong className='grid-label'>Employee Type : </strong>
                      <span className='grid-val text-uppercase'>
                        {details.emp_type || '-'}
                      </span>
                    </div>
                    <div className='col-md-4'>
                      <strong className='grid-label'>Designation : </strong>
                      <span className='grid-val'>
                        {details.designation || '-'}
                      </span>
                    </div>
                    <div className='col-md-4'>
                      <strong className='grid-label'>Department : </strong>
                      <span className='grid-val'>
                        {details.department || '-'}
                      </span>
                    </div>

                    <div className='col-md-4'>
                      <strong className='grid-label'>Employee Period : </strong>
                      <span className='grid-val'>
                        {details.emp_period ?? '0'}
                      </span>
                    </div>
                    <div className='col-md-4'>
                      <strong className='grid-label'>Current CTC : </strong>
                      <span className='grid-val'>
                        ₹{' '}
                        {Number(details.curr_ctc || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className='col-md-4'>
                      <strong className='grid-label'>CTC Effective Date : </strong>
                      <span className='grid-val'>
                        {details.ctc_eff_from || '-'}
                      </span>
                    </div>

                    <div className='col-md-4'>
                      <strong className='grid-label'>Proposed CTC : </strong>
                      <span className='grid-val'>
                        ₹{' '}
                        {Number(details.prop_ctc || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className='col-md-4'>
                      <strong className='grid-label'>Location : </strong>
                      <span className='grid-val'>
                        {details.location || '-'}
                      </span>
                    </div>
                    <div className='col-md-4'>
                      <strong className='grid-label'>Remarks : </strong>
                      <span className='grid-val'>
                        {details.remarks || '-'}
                      </span>
                    </div>
                  </div>

                  {!details.doc_ref ? (
                    <div className='row align-items-center g-2 mt-3 pt-3 border-top'>
                      <div className='col-md-4 col-sm-6'>
                        <select
                          id='STAFF_TYPE'
                          className='form-select tenure-template-select'
                          value={staffType}
                          onChange={e => setStaffType(e.target.value)}
                        >
                          <option value=''>Please Select</option>
                          {details.template_options ? (
                            Object.entries(details.template_options).map(
                              ([key, label]) => (
                                <option key={key} value={key}>
                                  {label}
                                </option>
                              )
                            )
                          ) : (
                            <>
                              <option value='P'>Permanent</option>
                              <option value='E'>Trainee Extension</option>
                              <option value='C'>Contract Extension</option>
                              <option value='Pro'>Probation Extension</option>
                              <option value='Prob'>Probation</option>
                            </>
                          )}
                        </select>
                      </div>
                      <div className='col-auto'>
                        <button
                          type='button'
                          className='btn btn-warning fw-bold text-dark legacy-preview-btn'
                          onClick={handlePreviewTemplate}
                        >
                          Preview Template
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className='mt-3 pt-3 border-top'>
                      <div className='d-flex justify-content-between align-items-center mb-2'>
                        <span className='badge bg-success-subtle text-success border px-2 py-1'>
                          Reference Code: {details.doc_ref}
                        </span>
                        <button
                          className='btn btn-outline-info btn-sm px-3'
                          type='button'
                          onClick={handleCloseTask}
                        >
                          <i className='fas fa-print me-1'></i> Close Task
                        </button>
                      </div>

                      <div
                        style={{
                          height: '60vh',
                          minHeight: '420px',
                          background: '#525659'
                        }}
                        className='border rounded overflow-hidden position-relative'
                      >
                        {embeddedLoading ? (
                          <div className='d-flex justify-content-center align-items-center h-100 text-white'>
                            <div
                              className='spinner-border me-2'
                              role='status'
                            />
                            <span>Loading Document...</span>
                          </div>
                        ) : embeddedPdfUrl ? (
                          <iframe
                            title='Letter Document'
                            className='w-100 h-100 border-0'
                            src={embeddedPdfUrl}
                          />
                        ) : (
                          <div className='d-flex justify-content-center align-items-center h-100 text-light small'>
                            Unable to stream PDF letter document.
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className='alert alert-warning text-center py-2 m-0 small'>
                  Unable to load employee information.
                </div>
              )}
            </div>

            {/* Footer */}
            <div className='modal-footer py-2 px-4 bg-light border-top d-flex justify-content-end'>
              <CancelButton
                onClick={onClose}
                disabled={loading || generatingRef}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Enlarged PDF Preview Modal (98vw Width, 96vh Height) */}
      {showPreviewModal && (
        <div className='modal fade show d-block' tabIndex='-1' role='dialog'>
          <div
            className='modal-dialog modal-dialog-centered m-auto'
            role='document'
            style={{
              maxWidth: '98vw',
              width: '98vw',
              height: '96vh',
              margin: '2vh auto'
            }}
          >
            <div
              className='modal-content shadow-2xl border-0 rounded-3 overflow-hidden d-flex flex-column'
              style={{ height: '96vh', marginLeft: '7%', marginTop: '2%' }}
            >
              {/* Header */}
              <div className='modal-header py-2 px-3 bg-light border-bottom d-flex justify-content-between align-items-center flex-shrink-0'>
                <h5 className='modal-title font-weight-bold text-dark m-0 tenure-letter-preview-title'>
                  Letter Preview — {details?.emp_name || 'Employee'} ({empCode})
                </h5>
                <button
                  type='button'
                  className='close tenure-letter-preview-close'
                  aria-label='Close'
                  onClick={() => {
                    if (pdfBlobUrl)
                      URL.revokeObjectURL(pdfBlobUrl.split('#')[0])
                    setPdfBlobUrl('')
                    setShowPreviewModal(false)
                  }}
                >
                  <span aria-hidden='true'>&times;</span>
                </button>
              </div>

              {/* Body: Occupies remaining vertical height */}
              <div
                className='modal-body p-0 flex-grow-1'
                style={{
                  background: '#525659',
                  overflow: 'hidden'
                }}
              >
                {pdfLoading ? (
                  <div className='d-flex justify-content-center align-items-center h-100 text-white'>
                    <div className='spinner-border me-2' role='status'></div>
                    <span className='fw-semibold'>
                      Rendering Letter Preview...
                    </span>
                  </div>
                ) : (
                  pdfBlobUrl && (
                    <iframe
                      title='Letter Document'
                      src={pdfBlobUrl}
                      className='w-100 h-100 border-0 d-block'
                      style={{ minHeight: '100%' }}
                    />
                  )
                )}
              </div>

              {/* Footer */}
              <div className='modal-footer py-2 px-3 bg-light border-top d-flex justify-content-between align-items-center flex-shrink-0'>
                <span className='text-muted small'>
                  Click <strong>Generate Reference Code</strong> to finalize
                  reference numbering.
                </span>
                <div className='d-flex gap-2'>
                  <button
                    type='button'
                    className='btn btn-warning btn-sm px-3 fw-bold text-dark'
                    disabled={generatingRef || pdfLoading}
                    onClick={handleGenerateRefCode}
                  >
                    {generatingRef
                      ? 'Generating...'
                      : 'Generate Reference Code'}
                  </button>

                  <CancelButton
                    onClick={onClose}
                    disabled={loading || generatingRef}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default TenureChangeLetterModal
