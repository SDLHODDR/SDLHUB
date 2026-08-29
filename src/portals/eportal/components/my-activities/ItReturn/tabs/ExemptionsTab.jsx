import { useState, useEffect, useRef, useMemo } from 'react'

import {
  saveExemptions,
  getExemptionData,
  deleteExemptionData
} from '../../../../services/itReturnService'

import {
  notifySuccess,
  notifyError,
  confirmAction
} from '../../../../../../services/alertService'

import SDLDataTable from '../../../../../../components/datatable/SDLDataTable'
import SDLSearch from '../../../../../../components/datatable/SDLSearch'
import SDLCalendar from '../../../../../../components/calendar/SDLCalendar'

import { ITR_MESSAGES } from '../../../../constants/itrMessages'

const ExemptionsTab = ({ onDataSaved, editable }) => {
  /* =========================================================
     INITIAL FORM STATE
  ========================================================= */

  const initialFormState = {
    exemption_id: '',
    from: '',
    to: '',
    monthlyRent: '',
    annualRent: '',
    address: '',
    city: 'Non Metro',
    landlordHasPan: 'yes',
    landlordName: '',
    landlordAddress: '',
    landlordPan: '',
    panCopy: null,
    agreementCopy: null
  }

  /* =========================================================
     STATE
  ========================================================= */

  const [formData, setFormData] = useState(initialFormState)

  const [errors, setErrors] = useState({})

  const [exemptionList, setExemptionList] = useState([])

  const [loading, setLoading] = useState(false)

  const [saving, setSaving] = useState(false)

  const [searchQuery, setSearchQuery] = useState('')

  const isEditable = Boolean(editable)

  /* =========================================================
     PREVENT DUPLICATE INITIAL API CALL
  ========================================================= */

  const hasFetched = useRef(false)

  
  /* =========================================================
     DATE HELPERS
  ========================================================= */
  /**
 * API/Form date -> DD-Mon-YYYY
 *
 * Example:
 * 2026-04-01 -> 01-Apr-2026
 * 2027-03-31 -> 31-Mar-2027
 */
const formatDateForDisplay = value => {
  if (!value) {
    return ''
  }

  // Normalize API value to YYYY-MM-DD
  const formDate = parseApiDate(value)

  if (!formDate) {
    return ''
  }

  const match = formDate.match(
    /^(\d{4})-(\d{2})-(\d{2})$/
  )

  if (!match) {
    return ''
  }

  const [, year, month, day] = match

  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec'
  ]

  return `${day}-${months[Number(month) - 1]}-${year}`
}

  /**
   * JS Date -> YYYY-MM-DD
   *
   * Used internally by the form and API.
   */
  const formatDateForForm = date => {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      return ''
    }

    const year = date.getFullYear()

    const month = String(date.getMonth() + 1).padStart(2, '0')

    const day = String(date.getDate()).padStart(2, '0')

    return `${year}-${month}-${day}`
  }

  /**
   * API date -> YYYY-MM-DD
   *
   * Supports:
   *
   * 2026-01-02
   * 02-Jan-2026
   * 02-JAN-2026
   */
  const parseApiDate = value => {
    if (!value) {
      return ''
    }

    const dateValue = String(value).trim()

    // Already YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
      return dateValue
    }

    // DD-Mon-YYYY
    const match = dateValue.match(
      /^(\d{2})-([A-Za-z]{3})-(\d{4})$/
    )

    if (!match) {
      return ''
    }

    const [, day, monthName, year] = match

    const months = {
      Jan: '01',
      Feb: '02',
      Mar: '03',
      Apr: '04',
      May: '05',
      Jun: '06',
      Jul: '07',
      Aug: '08',
      Sep: '09',
      Oct: '10',
      Nov: '11',
      Dec: '12'
    }

    const normalizedMonth =
      monthName.charAt(0).toUpperCase() +
      monthName.slice(1).toLowerCase()

    const month = months[normalizedMonth]

    if (!month) {
      return ''
    }

    return `${year}-${month}-${day}`
  }

  /**
   * Form YYYY-MM-DD -> JS Date
   *
   * Used by SDLCalendar.
   */
  const formDateToJSDate = value => {
    if (!value) {
      return null
    }

    const match = String(value).match(
      /^(\d{4})-(\d{2})-(\d{2})$/
    )

    if (!match) {
      return null
    }

    const [, year, month, day] = match

    const date = new Date(
      Number(year),
      Number(month) - 1,
      Number(day)
    )

    return isNaN(date.getTime()) ? null : date
  }

  /* =========================================================
     SEARCH / FILTER
  ========================================================= */

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) {
      return exemptionList
    }

    const query = searchQuery.toLowerCase().trim()

    return exemptionList.filter(item =>
      [
        item.from,
        item.to,
        item.monthlyRent,
        item.annualRent,
        item.city,
        item.landlordName,
        item.landlordPan
      ]
        .join(' ')
        .toLowerCase()
        .includes(query)
    )
  }, [searchQuery, exemptionList])

  /* =========================================================
     TABLE ACTIONS
  ========================================================= */

  const actionBodyTemplate = rowData => (
    <div className='d-flex gap-2'>
      <button
        type='button'
        className='btn btn-icon btn-sm btn-primary'
        onClick={() => handleEdit(rowData)}
        disabled={saving}
        title='Edit'
      >
        <i className='ti ti-edit'></i>
      </button>

      <button
        type='button'
        className='btn btn-icon btn-sm btn-primary'
        onClick={() => handleDelete(rowData)}
        disabled={saving}
        title='Delete'
      >
        <i className='ti ti-trash'></i>
      </button>
    </div>
  )

  const serialBodyTemplate = (_, options) => {
    return options.rowIndex + 1
  }

  /* =========================================================
     TABLE COLUMNS
  ========================================================= */

  const columns = [
    {
      header: '#',
      body: serialBodyTemplate,
      style: {
        width: '60px',
        textAlign: 'center'
      }
    },

    {
      field: 'from',
      header: 'From',
      sortable: true,
      body: rowData => formatDateForDisplay(rowData.from),
      style: {
        width: '120px'
      }
    },

    {
      field: 'to',
      header: 'To',
      sortable: true,
      body: rowData => formatDateForDisplay(rowData.to),
      style: {
        width: '120px'
      }
    },

    {
      field: 'monthlyRent',
      header: 'Monthly Rent',
      sortable: true,
      style: {
        width: '150px',
        textAlign: 'right'
      }
    },

    {
      field: 'annualRent',
      header: 'Annual Rent',
      sortable: true,
      style: {
        width: '150px',
        textAlign: 'right'
      }
    },

    {
      field: 'city',
      header: 'City',
      sortable: true,
      style: {
        width: '140px'
      }
    },

    {
      field: 'landlordName',
      header: 'Landlord',
      sortable: true,
      style: {
        minWidth: '220px'
      }
    },

    {
      field: 'landlordPan',
      header: 'PAN',
      sortable: true,
      style: {
        width: '160px'
      }
    },

    ...(isEditable
      ? [
          {
            header: 'Action',
            body: actionBodyTemplate,
            style: {
              width: '150px',
              textAlign: 'center'
            }
          }
        ]
      : [])
  ]

  /* =========================================================
     NORMALIZE API DATA
  ========================================================= */

  const normalizeExemptionData = exemptions => {
    if (!Array.isArray(exemptions)) {
      return []
    }

    return exemptions.map(item => ({
      ...item,

      // ID
      exemption_id:
        item.exemption_id ||
        item.EXEMPTION_ID ||
        item.ID ||
        item.id ||
        '',

      // Dates
      from: parseApiDate(
        item.from ||
          item.FROM_MONTH ||
          item.from_month ||
          ''
      ),

      to: parseApiDate(
        item.to ||
          item.TO_MONTH ||
          item.to_month ||
          ''
      ),

      // Rent
      monthlyRent:
        item.monthlyRent ??
        item.MONTHLY_RENT ??
        item.monthly_rent ??
        '',

      annualRent:
        item.annualRent ??
        item.ANNUAL_RENT ??
        item.annual_rent ??
        '',

      // Address
      address:
        item.address ||
        item.ADDRESS ||
        '',

      // City
      city:
        item.city ||
        item.CITY ||
        'Non Metro',

      // Landlord PAN flag
      landlordHasPan:
        item.landlordHasPan ||
        item.LANDLORD_HAS_PAN ||
        item.landlord_has_pan ||
        'yes',

      // Landlord
      landlordName:
        item.landlordName ||
        item.LANDLORD_NAME ||
        '',

      landlordAddress:
        item.landlordAddress ||
        item.LANDLORD_ADDRESS ||
        '',

      landlordPan:
        item.landlordPan ||
        item.LANDLORD_PAN ||
        '',

      // Attachments
      panCopy:
        item.panCopy ||
        item.LANDLORD_PAN_ATTACH ||
        null,

      agreementCopy:
        item.agreementCopy ||
        item.AGREEMENT_ATTACH ||
        null
    }))
  }

  /* =========================================================
     FETCH EXEMPTION DATA
  ========================================================= */

  const fetchExemptionData = async () => {
    try {
      setLoading(true)

      const res = await getExemptionData()

      console.log('Exemption GET response:', res)

      if (res?.status) {
        const {
          exemptions = []
        } = res.data || {}

        const normalizedData =
          normalizeExemptionData(exemptions)

        setExemptionList(normalizedData)
      } else {
        setExemptionList([])
      }
    } catch (error) {
      console.error(
        'Fetch exemption error:',
        error
      )

      setExemptionList([])

      notifyError(
        ITR_MESSAGES.FAILED_LOAD_EXEMPTION
      )
    } finally {
      setLoading(false)
    }
  }

  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {
    if (hasFetched.current) {
      return
    }

    hasFetched.current = true

    fetchExemptionData()
  }, [])

  /* =========================================================
     VALIDATION
  ========================================================= */

  const validateForm = () => {
    const newErrors = {}

    /* =========================
       FROM DATE
    ========================= */

    if (!formData.from) {
      newErrors.from = 'From date is required'
    }

    /* =========================
       TO DATE
    ========================= */

    if (!formData.to) {
      newErrors.to = 'To date is required'
    }

    /* =========================
       DATE RANGE
    ========================= */

    if (formData.from && formData.to) {
      const fromDate = formDateToJSDate(
        formData.from
      )

      const toDate = formDateToJSDate(
        formData.to
      )

      if (
        fromDate &&
        toDate &&
        toDate < fromDate
      ) {
        newErrors.to =
          'To date cannot be earlier than From date'
      }
    }

    /* =========================
       MONTHLY RENT
    ========================= */

    if (
      formData.monthlyRent === '' ||
      formData.monthlyRent === null ||
      Number(formData.monthlyRent) <= 0
    ) {
      newErrors.monthlyRent =
        'Monthly rent is required'
    }

    /* =========================
       ANNUAL RENT
    ========================= */

    if (
      formData.annualRent === '' ||
      formData.annualRent === null ||
      Number(formData.annualRent) <= 0
    ) {
      newErrors.annualRent =
        'Total rent paid is required'
    }

    /* =========================
       TENANT ADDRESS
    ========================= */

    if (
      !String(formData.address || '').trim()
    ) {
      newErrors.address =
        'Address is required'
    }

    /* =========================
       LANDLORD NAME
    ========================= */

    if (
      !String(formData.landlordName || '').trim()
    ) {
      newErrors.landlordName =
        'Landlord name is required'
    }

    /* =========================
       LANDLORD ADDRESS
    ========================= */

    if (
      !String(
        formData.landlordAddress || ''
      ).trim()
    ) {
      newErrors.landlordAddress =
        'Landlord address is required'
    }

    /* =========================
       PAN VALIDATION
    ========================= */

    const annualRent = Number(
      formData.annualRent || 0
    )

    /*
     * PAN is mandatory when:
     *
     * 1. Landlord says PAN is available
     * OR
     * 2. Annual rent exceeds Rs. 1,00,000
     */
    const isPanMandatory =
      formData.landlordHasPan === 'yes' ||
      annualRent > 100000

    const landlordPan = String(
      formData.landlordPan || ''
    )
      .trim()
      .toUpperCase()

    if (isPanMandatory) {
      if (!landlordPan) {
        newErrors.landlordPan =
          annualRent > 100000
            ? 'Landlord PAN is required when annual rent exceeds Rs 1,00,000'
            : 'Landlord PAN is required'
      } else if (
        !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(
          landlordPan
        )
      ) {
        newErrors.landlordPan =
          'Enter valid PAN number'
      }
    } else if (landlordPan) {
      /*
       * PAN is optional, but if user enters it,
       * it still needs to be valid.
       */
      if (
        !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(
          landlordPan
        )
      ) {
        newErrors.landlordPan =
          'Enter valid PAN number'
      }
    }

    setErrors(newErrors)

    return Object.keys(newErrors).length === 0
  }

  /* =========================================================
     FROM DATE CHANGE
  ========================================================= */

  const handleFromDateChange = date => {
    const formattedDate =
      formatDateForForm(date)

    setFormData(prev => ({
      ...prev,
      from: formattedDate
    }))

    setErrors(prev => ({
      ...prev,
      from: ''
    }))

    /*
     * If selected From date becomes greater
     * than current To date, clear To date.
     */
    if (formattedDate && formData.to) {
      const fromDate =
        formDateToJSDate(formattedDate)

      const toDate =
        formDateToJSDate(formData.to)

      if (
        fromDate &&
        toDate &&
        toDate < fromDate
      ) {
        setFormData(prev => ({
          ...prev,
          from: formattedDate,
          to: ''
        }))

        setErrors(prev => ({
          ...prev,
          from: '',
          to: ''
        }))
      }
    }
  }

  /* =========================================================
     TO DATE CHANGE
  ========================================================= */

  const handleToDateChange = date => {
    const formattedDate =
      formatDateForForm(date)

    setFormData(prev => ({
      ...prev,
      to: formattedDate
    }))

    setErrors(prev => ({
      ...prev,
      to: ''
    }))
  }

  /* =========================================================
     HANDLE NORMAL INPUT CHANGE
  ========================================================= */

  const handleChange = e => {
    const {
      name,
      value,
      files,
      type
    } = e.target

    const newValue =
      type === 'file'
        ? files?.[0] || null
        : value

    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }))

    /*
     * Clear the current field error.
     */
    setErrors(prev => ({
      ...prev,
      [name]: ''
    }))

    /* =========================
       ANNUAL RENT
    ========================= */

    if (name === 'annualRent') {
      const annualRent = Number(
        value || 0
      )

      /*
       * When annual rent > 1 lakh,
       * PAN becomes mandatory immediately.
       */
      if (annualRent > 100000) {
        setErrors(prev => ({
          ...prev,
          landlordPan:
            formData.landlordPan?.trim()
              ? ''
              : 'Landlord PAN is required when annual rent exceeds Rs 1,00,000'
        }))
      } else {
        /*
         * Don't show the >1 lakh PAN error
         * if rent goes back below threshold.
         */
        setErrors(prev => ({
          ...prev,
          landlordPan: ''
        }))
      }
    }

    /* =========================
       LANDLORD PAN
    ========================= */

    if (name === 'landlordPan') {
      const pan = String(
        value || ''
      )
        .trim()
        .toUpperCase()

      /*
       * Store uppercase PAN.
       */
      setFormData(prev => ({
        ...prev,
        landlordPan: pan
      }))

      if (!pan) {
        /*
         * If PAN is mandatory, show required error.
         */
        const annualRent = Number(
          formData.annualRent || 0
        )

        const isPanMandatory =
          formData.landlordHasPan === 'yes' ||
          annualRent > 100000

        if (isPanMandatory) {
          setErrors(prev => ({
            ...prev,
            landlordPan:
              annualRent > 100000
                ? 'Landlord PAN is required when annual rent exceeds Rs 1,00,000'
                : 'Landlord PAN is required'
          }))
        }

        return
      }

      if (
        !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(
          pan
        )
      ) {
        setErrors(prev => ({
          ...prev,
          landlordPan:
            'Enter valid PAN number'
        }))
      } else {
        setErrors(prev => ({
          ...prev,
          landlordPan: ''
        }))
      }
    }

    /* =========================
       LANDLORD PAN RADIO
    ========================= */

    if (name === 'landlordHasPan') {
      if (value === 'yes') {
        if (!formData.landlordPan?.trim()) {
          setErrors(prev => ({
            ...prev,
            landlordPan:
              'Landlord PAN is required'
          }))
        }
      } else if (value === 'no') {
        /*
         * If landlord does not have PAN,
         * clear PAN validation here.
         *
         * However, validateForm will still
         * require PAN when annual rent > 1 lakh.
         */
        if (
          Number(formData.annualRent || 0) <=
          100000
        ) {
          setErrors(prev => ({
            ...prev,
            landlordPan: ''
          }))
        }
      }
    }
  }

  /* =========================================================
     EDIT RECORD
  ========================================================= */

  const handleEdit = row => {
    setErrors({})

    setFormData({
      exemption_id:
        row.exemption_id ||
        row.EXEMPTION_ID ||
        row.ID ||
        row.id ||
        '',

      from: parseApiDate(
        row.from ||
          row.FROM_MONTH ||
          ''
      ),

      to: parseApiDate(
        row.to ||
          row.TO_MONTH ||
          ''
      ),

      monthlyRent:
        row.monthlyRent ??
        row.MONTHLY_RENT ??
        '',

      annualRent:
        row.annualRent ??
        row.ANNUAL_RENT ??
        '',

      address:
        row.address ||
        row.ADDRESS ||
        '',

      city:
        row.city ||
        row.CITY ||
        'Non Metro',

      landlordHasPan:
        row.landlordHasPan ||
        row.LANDLORD_HAS_PAN ||
        'yes',

      landlordName:
        row.landlordName ||
        row.LANDLORD_NAME ||
        '',

      landlordAddress:
        row.landlordAddress ||
        row.LANDLORD_ADDRESS ||
        '',

      landlordPan:
        row.landlordPan ||
        row.LANDLORD_PAN ||
        '',

      panCopy: null,

      agreementCopy: null
    })

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  /* =========================================================
     RESET FORM
  ========================================================= */

  const resetForm = () => {
    if (saving) {
      return
    }

    setFormData(initialFormState)

    setErrors({})

    setSearchQuery('')
  }

  /* =========================================================
     SAVE / UPDATE
  ========================================================= */

  const handleSave = async () => {
    /*
     * Prevent multiple clicks.
     */
    if (saving) {
      return
    }

    /*
     * Validate before starting API call.
     */
    const isValid = validateForm()

    if (!isValid) {
      return
    }

    try {
      setSaving(true)

      const payload = new FormData()

      Object.keys(formData).forEach(key => {
        /*
         * Don't send null.
         */
        if (formData[key] !== null) {
          payload.append(
            key,
            formData[key]
          )
        }
      })

      console.log(
        'Saving exemption payload:',
        Object.fromEntries(payload.entries())
      )

      const res =
        await saveExemptions(payload)

      console.log(
        'Save exemption response:',
        res
      )

      if (res?.status) {
        notifySuccess(
          res.message ||
            ITR_MESSAGES.EXEMPTIONS_SAVED
        )

        /*
         * Reset form after successful save.
         */
        setFormData(initialFormState)

        setErrors({})

        /*
         * Reload table data.
         */
        await fetchExemptionData()

        /*
         * Notify parent.
         */
        onDataSaved?.()
      } else {
        notifyError(
          res?.message ||
            'Please fill all required fields'
        )
      }
    } catch (error) {
      console.error(
        'Save exemption error:',
        error
      )

      notifyError(
        ITR_MESSAGES.EXEMPTION_SERVER_ERROR
      )
    } finally {
      /*
       * Re-enable button regardless of
       * success or failure.
       */
      setSaving(false)
    }
  }

  /* =========================================================
     DELETE RECORD
  ========================================================= */

  const handleDelete = async row => {
    if (saving) {
      return
    }

    const exemptionId =
      row.exemption_id ||
      row.EXEMPTION_ID ||
      row.ID ||
      row.id ||
      ''

    if (!exemptionId) {
      notifyError(
        'Unable to identify the exemption record.'
      )

      return
    }

    const result =
      await confirmAction(
        'Are you sure you want to delete this exemption record?'
      )

    if (!result?.isConfirmed) {
      return
    }

    try {
      setSaving(true)

      const response =
        await deleteExemptionData(
          exemptionId
        )

      console.log(
        'Delete exemption response:',
        response
      )

      if (response?.status) {
        notifySuccess(
          response.message ||
            'Record deleted successfully'
        )

        /*
         * Clear form.
         */
        setFormData(initialFormState)

        setErrors({})

        /*
         * Reload table.
         */
        await fetchExemptionData()

        /*
         * Notify parent.
         */
        onDataSaved?.()
      } else {
        notifyError(
          response?.message ||
            'Unable to delete record'
        )
      }
    } catch (error) {
      console.error(
        'Delete exemption error:',
        error
      )

      notifyError(
        'Failed to delete record'
      )
    } finally {
      setSaving(false)
    }
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <>
      {/* =====================================================
          NON-EDITABLE MESSAGE
      ===================================================== */}

      {!isEditable && (
        <div className='alert alert-warning mb-3'>
          IT Return editing is allowed only on
          configured dates.
        </div>
      )}

      <div>
        {/* ===================================================
            FORM
        =================================================== */}

        <div className='alert alert-warning'>
          If annual rent paid exceeds Rs 1,00,000,
          landlord PAN is mandatory. If PAN is not
          provided, the rent will not be considered
          for taxation.
        </div>

        <div className='row'>
          {/* =================================================
              FROM
          ================================================= */}

          <div className='col-md-4 mb-3'>
            <label className='form-label'>
              From{' '}
              <span className='text-danger'>
                *
              </span>
            </label>

            <div
              className={
                errors.from
                  ? 'sdl-calendar-invalid'
                  : ''
              }
            >
            <SDLCalendar
              value={formDateToJSDate(formData.from)}
              onChange={handleFromDateChange}
              allowAllDates={true}
            />
            </div>

            {errors.from && (
              <div className='invalid-feedback d-block'>
                {errors.from}
              </div>
            )}
          </div>

          {/* =================================================
              TO
          ================================================= */}

          <div className='col-md-4 mb-3'>
            <label className='form-label'>
              To{' '}
              <span className='text-danger'>
                *
              </span>
            </label>

            <div
              className={
                errors.to
                  ? 'sdl-calendar-invalid'
                  : ''
              }
            >
              <SDLCalendar
                value={formDateToJSDate(formData.to)}
                onChange={handleToDateChange}
                minDate={
                  formData.from
                    ? formDateToJSDate(formData.from)
                    : undefined
                }
                allowAllDates={true}
              />
            </div>

            {errors.to && (
              <div className='invalid-feedback d-block'>
                {errors.to}
              </div>
            )}
          </div>

          {/* =================================================
              MONTHLY RENT
          ================================================= */}

          <div className='col-md-4 mb-3'>
            <label className='form-label'>
              Total Monthly Rent
              <span className='text-danger'>
                *
              </span>
            </label>

            <input
              type='number'
              name='monthlyRent'
              value={
                formData.monthlyRent
              }
              onChange={handleChange}
              min='0'
              className={`form-control ${
                errors.monthlyRent
                  ? 'is-invalid'
                  : ''
              }`}
            />

            {errors.monthlyRent && (
              <div className='invalid-feedback'>
                {errors.monthlyRent}
              </div>
            )}
          </div>

          {/* =================================================
              TOTAL RENT
          ================================================= */}

          <div className='col-md-4 mb-3'>
            <label className='form-label'>
              Total Rent Paid
              <span className='text-danger'>
                *
              </span>
            </label>

            <input
              type='number'
              name='annualRent'
              value={
                formData.annualRent
              }
              onChange={handleChange}
              min='0'
              className={`form-control ${
                errors.annualRent
                  ? 'is-invalid'
                  : ''
              }`}
            />

            {errors.annualRent && (
              <div className='invalid-feedback'>
                {errors.annualRent}
              </div>
            )}
          </div>

          {/* =================================================
              ADDRESS
          ================================================= */}

          <div className='col-md-4 mb-3'>
            <label className='form-label'>
              Address
              <span className='text-danger'>
                *
              </span>
            </label>

            <textarea
              name='address'
              rows='2'
              value={
                formData.address
              }
              onChange={handleChange}
              className={`form-control ${
                errors.address
                  ? 'is-invalid'
                  : ''
              }`}
            />

            {errors.address && (
              <div className='invalid-feedback'>
                {errors.address}
              </div>
            )}
          </div>

          {/* =================================================
              CITY
          ================================================= */}

          <div className='col-md-4 mb-3'>
            <label className='form-label'>
              City
            </label>

            <select
              name='city'
              value={
                formData.city
              }
              onChange={handleChange}
              className='form-control'
            >
              <option value='Non Metro'>
                Non Metro
              </option>

              <option value='Metro'>
                Metro
              </option>
            </select>
          </div>

          {/* =================================================
              LANDLORD HAS PAN
          ================================================= */}

          <div className='col-md-4 mb-3'>
            <label className='form-label'>
              Does your landlord have PAN?
            </label>

            <div className='mt-2'>
              <div className='form-check form-check-inline'>
                <input
                  type='radio'
                  name='landlordHasPan'
                  value='yes'
                  checked={
                    formData.landlordHasPan ===
                    'yes'
                  }
                  onChange={handleChange}
                  className='form-check-input'
                />

                <label className='form-check-label'>
                  Yes
                </label>
              </div>

              <div className='form-check form-check-inline'>
                <input
                  type='radio'
                  name='landlordHasPan'
                  value='no'
                  checked={
                    formData.landlordHasPan ===
                    'no'
                  }
                  onChange={handleChange}
                  className='form-check-input'
                />

                <label className='form-check-label'>
                  No
                </label>
              </div>
            </div>
          </div>

          {/* =================================================
              LANDLORD NAME
          ================================================= */}

          <div className='col-md-4 mb-3'>
            <label className='form-label'>
              Landlord Name
              <span className='text-danger'>
                *
              </span>
            </label>

            <input
              type='text'
              name='landlordName'
              value={
                formData.landlordName
              }
              onChange={handleChange}
              className={`form-control ${
                errors.landlordName
                  ? 'is-invalid'
                  : ''
              }`}
            />

            {errors.landlordName && (
              <div className='invalid-feedback'>
                {errors.landlordName}
              </div>
            )}
          </div>

          {/* =================================================
              LANDLORD ADDRESS
          ================================================= */}

          <div className='col-md-4 mb-3'>
            <label className='form-label'>
              Landlord Address
              <span className='text-danger'>
                *
              </span>
            </label>

            <textarea
              name='landlordAddress'
              rows='2'
              value={
                formData.landlordAddress
              }
              onChange={handleChange}
              className={`form-control ${
                errors.landlordAddress
                  ? 'is-invalid'
                  : ''
              }`}
            />

            {errors.landlordAddress && (
              <div className='invalid-feedback'>
                {
                  errors.landlordAddress
                }
              </div>
            )}
          </div>

          {/* =================================================
              LANDLORD PAN
          ================================================= */}

          <div className='col-md-4 mb-3'>
            <label className='form-label'>
              Landlord PAN

              {Number(
                formData.annualRent || 0
              ) > 100000 && (
                <span className='text-danger'>
                  {' '}
                  *
                </span>
              )}
            </label>

            <input
              type='text'
              name='landlordPan'
              value={
                formData.landlordPan
              }
              onChange={handleChange}
              maxLength={10}
              style={{
                textTransform:
                  'uppercase'
              }}
              className={`form-control ${
                errors.landlordPan
                  ? 'is-invalid'
                  : ''
              }`}
            />

            {errors.landlordPan && (
              <div className='invalid-feedback'>
                {
                  errors.landlordPan
                }
              </div>
            )}
          </div>

          {/* =================================================
              PAN CARD COPY
          ================================================= */}

          <div className='col-md-4 mb-3'>
            <label className='form-label'>
              Landlord PAN Card Copy
            </label>

            <input
              type='file'
              name='panCopy'
              onChange={handleChange}
              className={`form-control ${
                errors.panCopy
                  ? 'is-invalid'
                  : ''
              }`}
            />

            {errors.panCopy && (
              <div className='invalid-feedback'>
                {errors.panCopy}
              </div>
            )}
          </div>

          {/* =================================================
              AGREEMENT COPY
          ================================================= */}

          <div className='col-md-4 mb-3'>
            <label className='form-label'>
              Agreement Copy
            </label>

            <input
              type='file'
              name='agreementCopy'
              onChange={handleChange}
              className={`form-control ${
                errors.agreementCopy
                  ? 'is-invalid'
                  : ''
              }`}
            />

            {errors.agreementCopy && (
              <div className='invalid-feedback'>
                {
                  errors.agreementCopy
                }
              </div>
            )}
          </div>

          {/* =================================================
              BUTTONS
          ================================================= */}

          {isEditable && (
            <div className='text-center mt-3'>
              <button
                type='button'
                className='btn btn-primary me-2'
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <span
                      className='spinner-border spinner-border-sm me-2'
                      role='status'
                      aria-hidden='true'
                    ></span>

                    {formData.exemption_id
                      ? 'Updating...'
                      : 'Saving...'}
                  </>
                ) : (
                  <>
                    {formData.exemption_id
                      ? 'Update'
                      : 'Save'}
                  </>
                )}
              </button>

              <button
                type='button'
                className='btn btn-secondary'
                onClick={resetForm}
                disabled={saving}
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* ===================================================
            DATA TABLE
        =================================================== */}

        <div className='card mt-4'>
          <div className='card-header fw-bold'>
            Saved Exemption Records
          </div>

          <div className='card-body'>
            <div className='row mb-3'>
              <div className='col-lg-4 col-md-6 col-12'>
                <SDLSearch
                  value={searchQuery}
                  onChange={
                    setSearchQuery
                  }
                  placeholder='Search...'
                />
              </div>
            </div>

            <SDLDataTable
              data={filteredData}
              columns={columns}
              loading={loading}
              emptyMessage='No exemption records found'
              removableSort
              tableStyle={{
                minWidth: '1200px'
              }}
              className='exemption-grid'
            />
          </div>
        </div>
      </div>
    </>
  )
}

export default ExemptionsTab