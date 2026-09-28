import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  getFinEntities,
  getCompanies,
  getDepartments,
  getDesignations,
  getJDLabels,
  getDivisions,
  getEmployeeLevels,
  getOrganogramLevels,
  getOrganogramDetails,
  getOrganogramLocations,
  getOrganogramApprLevels,
  getOrgLocReportingRows,
  saveOrganogram,
} from "../services/orgonogramService";
import { notifyError, notifySuccess } from "../../../services/alertService";
import { normalizeOrganogramStatus } from "./organogramStatus";

const INITIAL_FORM_STATE = {
  FIN_ENTITY_ID: "",
  COMPANY_ID: "",
  DEPARTMENT_ID: "",
  DESIGNATION_ID: "",
  JD_LABEL_ID: "",
  DIVISION_ID: "",
  EMP_LEVEL_ID: "",
  ORG_LEVEL_ID: "",
  POSITION_COUNT: "",
  POSITION_OCCUPIED: "",
  STATUS: "N",
};

// Maps the raw HR_ORGANOGRAM row (from $res in the old PHP) onto our formData shape.
// NOTE: confirm DESI_ID / JD field names against the actual HR_ORGANOGRAM columns —
// they weren't in the sample row you shared, so update these two keys if they differ.
const mapOrganogramRowToFormData = (row = {}) => ({
  FIN_ENTITY_ID: row.FINENT ?? "",
  COMPANY_ID: row.COMPANY ?? "",
  DEPARTMENT_ID: row.DEPT_ID ?? "",
  DESIGNATION_ID: row.DESI_ID ?? "",
  JD_LABEL_ID: row.JD_ID ?? "",
  DIVISION_ID: row.DIVSN_ID ?? "",
  EMP_LEVEL_ID: row.EMP_LEVEL ?? "",
  ORG_LEVEL_ID: row.OLVL_ID ?? "",
  POSITION_COUNT: row.POSI_COUNT ?? "",
  POSITION_OCCUPIED: row.FILL_COUNT || "0",
  STATUS: normalizeOrganogramStatus(row.STATUS ?? row.status),
});

const mapToOptions = (list = [], labelKey = 'LABEL', valueKey = 'ID') =>
  Array.isArray(list)
    ? list.map(item => ({ label: item[labelKey] ?? '', value: item[valueKey] }))
    : []

const useOrganogramFormHandler = (organogramId, onOrganogramSaved) => {
  const [formData, setFormData] = useState(INITIAL_FORM_STATE)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [loadingDetails, setLoadingDetails] = useState(false)

  const [finEntityOptions, setFinEntityOptions] = useState([])
  const [companyOptions, setCompanyOptions] = useState([])
  const [departmentOptions, setDepartmentOptions] = useState([])
  const [designationOptions, setDesignationOptions] = useState([])
  const [jdLabelOptions, setJdLabelOptions] = useState([])
  const [divisionOptions, setDivisionOptions] = useState([])
  const [empLevelOptions, setEmpLevelOptions] = useState([])
  const [orgLevelOptions, setOrgLevelOptions] = useState([])

  const [loadingMasters, setLoadingMasters] = useState(false)
  const [loadingDesignations, setLoadingDesignations] = useState(false)
  const [loadingJdLabels, setLoadingJdLabels] = useState(false)

  const isEditMode = !!organogramId

  /* ==========================================================
      INITIAL MASTER DATA LOAD (unchanged)
  ========================================================== */
  useEffect(() => {
    const loadMasters = async () => {
      try {
        setLoadingMasters(true)
        const [
          finEntityRes,
          companyRes,
          departmentRes,
          divisionRes,
          empLevelRes,
          orgLevelRes
        ] = await Promise.all([
          getFinEntities(),
          getCompanies(),
          getDepartments(),
          getDivisions(),
          getEmployeeLevels(),
          getOrganogramLevels()
        ])

        setFinEntityOptions(
          mapToOptions(finEntityRes?.data, 'FINDESC', 'FIN_ENTITY')
        )
        setCompanyOptions(
          mapToOptions(companyRes?.data, 'COMP_DESC', 'COMP_ID')
        )
        setDepartmentOptions(
          mapToOptions(departmentRes?.data, 'DEPT_DESC', 'DEPT_ID')
        )
        setDivisionOptions(
          mapToOptions(divisionRes?.data, 'DIVSN_DESC', 'DIVSN_ID')
        )
        setEmpLevelOptions(mapToOptions(empLevelRes?.data, 'LEVL_DESC', 'LEVL'))
        setOrgLevelOptions(
          mapToOptions(orgLevelRes?.data, 'OLVL_DESC', 'OLVL_ID')
        )
      } catch (error) {
        console.error('Load organogram masters error:', error)
        notifyError(error?.message || 'Unable to load master data.')
      } finally {
        setLoadingMasters(false)
      }
    }

    loadMasters()
  }, [])

  /* ==========================================================
      LOAD DETAILS WHEN TOP "Select Orgonogram" DROPDOWN CHANGES
  ========================================================== */
  useEffect(() => {
    if (!organogramId) {
      setFormData(INITIAL_FORM_STATE)
      setErrors({})
      return
    }

    const loadDetails = async () => {
      try {
        setLoadingDetails(true)
        const res = await getOrganogramDetails({ ID: organogramId })

        if (res?.status) {
          setFormData(mapOrganogramRowToFormData(res.data))
          setErrors({})
        } else {
          notifyError(res?.message || 'Unable to load organogram details.')
        }
      } catch (error) {
        console.error('Load organogram details error:', error)
        notifyError(error?.message || 'Unable to load organogram details.')
      } finally {
        setLoadingDetails(false)
      }
    }

    loadDetails()
  }, [organogramId])

  /* ==========================================================
      CASCADE: DEPARTMENT -> DESIGNATION
      (fires both on manual selection AND after details load,
       since formData.DEPARTMENT_ID changes either way)
  ========================================================== */
  useEffect(() => {
    if (!formData.DEPARTMENT_ID) {
      setDesignationOptions([])
      return
    }

    const loadDesignations = async () => {
      try {
        setLoadingDesignations(true)
        const res = await getDesignations({
          DEPARTMENT_ID: formData.DEPARTMENT_ID
        })
        setDesignationOptions(mapToOptions(res?.data, 'LABEL', 'ID'))
      } catch (error) {
        console.error('Load designations error:', error)
        notifyError(error?.message || 'Unable to load designations.')
      } finally {
        setLoadingDesignations(false)
      }
    }

    loadDesignations()
  }, [formData.DEPARTMENT_ID])

  /* ==========================================================
      CASCADE: DESIGNATION -> JD LABEL
  ========================================================== */
  useEffect(() => {
    if (!formData.DESIGNATION_ID) {
      setJdLabelOptions([])
      return
    }

    const loadJdLabels = async () => {
      try {
        setLoadingJdLabels(true)
        const res = await getJDLabels({
          DEPARTMENT_ID: formData.DEPARTMENT_ID,
          DESIGNATION_ID: formData.DESIGNATION_ID
        })
        setJdLabelOptions(mapToOptions(res?.data, 'LABEL', 'ID'))
      } catch (error) {
        console.error('Load JD labels error:', error)
        notifyError(error?.message || 'Unable to load JD labels.')
      } finally {
        setLoadingJdLabels(false)
      }
    }

    loadJdLabels()
  }, [formData.DEPARTMENT_ID, formData.DESIGNATION_ID])

  /* ==========================================================
      FIELD CHANGE (resets dependent fields — manual edits only)
  ========================================================== */
  const handleFieldChange = useCallback((field, value) => {
    let updatedValue = value
    let error = ''

    if (field === 'POSITION_COUNT' || field === 'POSITION_OCCUPIED') {
      if (!/^\d*$/.test(value)) {
        updatedValue = value.replace(/\D/g, '')
        error = 'Only numbers are allowed'
      }

      if (updatedValue.length > 3) {
        updatedValue = updatedValue.slice(0, 3)
        error = 'Maximum 3 digits are allowed'
      }
    }

    setFormData(prev => {
      const next = { ...prev, [field]: value }
      if (field === 'DEPARTMENT_ID') {
        next.DESIGNATION_ID = ''
        next.JD_LABEL_ID = ''
      }
      if (field === 'DESIGNATION_ID') {
        next.JD_LABEL_ID = ''
      }
      return next
    })

    // setErrors((prev) => {
    //   if (!prev[field]) return prev;
    //   const next = { ...prev };
    //   delete next[field];
    //   return next;
    // });

    setErrors(prev => {
      const next = { ...prev }

      if (error) {
        next[field] = error
      } else {
        delete next[field]
      }

      return next
    })
  }, [])

  /* ==========================================================
      VALIDATION / SAVE / CANCEL (unchanged from before)
  ========================================================== */
  const validate = useCallback(() => {
    const newErrors = {}
    const required = [
      'FIN_ENTITY_ID',
      'COMPANY_ID',
      'DEPARTMENT_ID',
      'DIVISION_ID',
      'EMP_LEVEL_ID',
      'ORG_LEVEL_ID'
    ]
    required.forEach(field => {
      if (!formData[field]) newErrors[field] = 'This field is required.'
    })
    if (formData.POSITION_COUNT !== '') {
      if (!/^\d{1,3}$/.test(formData.POSITION_COUNT)) {
        newErrors.POSITION_COUNT =
          'Position Count must be a whole number with maximum 3 digits.'
      }
    }

    if (formData.POSITION_OCCUPIED !== '') {
      if (!/^\d{1,3}$/.test(formData.POSITION_OCCUPIED)) {
        newErrors.POSITION_OCCUPIED =
          'Position Occupied must be a whole number with maximum 3 digits.'
      }
    }
    if (formData.POSITION_OCCUPIED > formData.POSITION_COUNT) {
      newErrors.POSITION_OCCUPIED =
        'Position occupied must be less than Position count.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData])

  const handleSave = useCallback(
    async (sendForAuth = false) => {
      if (!validate()) return
      try {
        setSaving(true)
        const payload = {
          ...formData,
          ...(organogramId && { ID: organogramId }),
          mode: isEditMode ? 'edit' : 'add',
          sendForAuth // true when "Save & Send for Auth" clicked
        }
        const res = await saveOrganogram(payload)

        if (res?.status) {
          // Edit mode already knows its ID. Add mode needs it back from the API.
          // TODO: confirm the actual key your backend returns the new ID under —
          // assuming res.data.ID below; change if it's e.g. res.data.ORGANOGRAM_ID.
          const savedId = organogramId ?? res?.data?.ID ?? res?.data?.id ?? null

          notifySuccess(
            res?.message ||
              (sendForAuth
                ? 'Organogram saved and sent for authorization.'
                : 'Organogram saved successfully.'),
            { onClose: () => onOrganogramSaved?.(savedId) }
          )
        } else {
          notifyError(res?.message || 'Unable to save organogram.', {
            onClose: onOrganogramSaved
          })
        }
      } catch (error) {
        console.error('Save organogram error:', error)
        notifyError(error?.message || 'Unable to save organogram.', {
          onClose: onOrganogramSaved
        })
      } finally {
        setSaving(false)
      }
    },
    [formData, validate, organogramId, onOrganogramSaved, isEditMode]
  )

  const handleCancel = useCallback(() => {
    setFormData(organogramId ? INITIAL_FORM_STATE : INITIAL_FORM_STATE)
    setErrors({})
  }, [organogramId])

  // status values are examples — match these to your actual enum
  const canSendForAuth = useMemo(() => {
    const status = normalizeOrganogramStatus(formData?.STATUS);
    return status === "N" || status === "R" || status === "REJECTED";
  }, [formData?.STATUS]);

  return {
    formData,
    errors,
    saving,
    loadingDetails,
    handleFieldChange,
    handleSave,
    handleCancel,
    finEntityOptions,
    companyOptions,
    departmentOptions,
    designationOptions,
    jdLabelOptions,
    divisionOptions,
    empLevelOptions,
    orgLevelOptions,
    loadingMasters,
    loadingDesignations,
    loadingJdLabels,
    isEditMode,
    canSendForAuth
  }
}

export default useOrganogramFormHandler
