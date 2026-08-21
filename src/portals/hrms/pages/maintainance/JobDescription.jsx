import { useMemo, useState, useEffect, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import Select from 'react-select'
import BreadcrumbNav from '../../components/breadcrumb-nav/BreadcrumbNav'
import { getPortalFromPath } from '../../../../config/portalConfig'
import SDLSearch from '../../../../components/datatable/SDLSearch'
import {
  getDepartmentMasterData,
  getDesignationsMaster
} from '../../services/departmentService'
import { getMasterData } from '../../services/masterDataService'
import {
  getJobDescriptions,
  getJobDescriptionById,
  saveJobDescription
  // getKRAList,
  // getQualificationList,
  // getSkillList,
  // getExpertiseLevelList,
  // getAllowanceList,
  // getFrequencyList,
  // getCTCHeadList,
  // getFormulaList,
  // getQuestionTemplateList,
  // getDivisionList,
  // getInductionList,
  // getOrganogramList
} from '../../services/jobDescriptionService'
import { notifySuccess, notifyError } from '../../../../services/alertService'
import { CKEditor } from '@ckeditor/ckeditor5-react'
import {
  ClassicEditor,
  Essentials,
  Paragraph,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Font,
  Link,
  Alignment,
  List,
  BlockQuote
} from 'ckeditor5'
import 'ckeditor5/ckeditor5.css'

const normalizeRecords = payload => {
  if (Array.isArray(payload)) return payload
  if (!payload || typeof payload !== 'object') return []

  for (const key of [
    'data',
    'records',
    'result',
    'items',
    'list',
    'rows',
    'jobDescriptions',
    'jobDescription',
    'departments',
    'designations',
    'masterData'
  ]) {
    if (Array.isArray(payload[key])) return payload[key]
    if (payload[key] && typeof payload[key] === 'object') {
      for (const subKey of [
        'data',
        'records',
        'result',
        'items',
        'list',
        'rows',
        'jobDescriptions',
        'departments',
        'designations',
        'masterData'
      ]) {
        if (Array.isArray(payload[key][subKey])) return payload[key][subKey]
      }
    }
  }

  return []
}

const getDisplayValue = (item, keys, fallback = '') => {
  if (!item || typeof item !== 'object') return fallback

  for (const key of keys) {
    const value = item[key]
    if (value !== undefined && value !== null && value !== '') {
      return value
    }
  }

  return fallback
}

const INITIAL_FORM_DATA = {
  id: '',
  SH_DESC: '',
  DESCR: '',
  DEPT_ID: '',
  DESIG_ID: '',
  LVL_ID: '',

  MIN_EXP: '',
  MAX_EXP: '',
  MIN_AGE: '',
  MAX_AGE: '',
  MIN_QUAL: '',
  MAX_QUAL: '',

  EXP: '',
  AGE_RANGE: '',
  MIN_SAL: '',
  MAX_SAL: '',
  REPT_JDID: '',

  RESPONSIBILITIES: '',
  KRA: [],

  // EDUCATION: {
  //   QUALIFICATION: '',
  //   COMMENTS: ''
  // },
  EDUCATION: {
    QUA_ID: '',
    COMMENTS: ''
  },

  SKILLS: [],
  ALLOWANCES: [],
  CTC_HEADS: [],

  QUESTION_TEMPLATE: [],
  DEPT_REFERENCES: [],
  DIVISION_MAPPING: [],

  // INDUCTION: {
  //   INDUCTION: '',
  //   ORGANOGRAM: '',
  //   SEQUENCE: ''
  // },
  INDUCTION: {
    INDUC_ID: '',
    ORG_ID: '',
    ORG_LOC_ID: '',
    DISP_SEQ: ''
  },

  UPLOAD_DOC: null
}

const JobDescription = () => {
  const location = useLocation()
  const portal = getPortalFromPath(location.pathname)
  const portalHome = `/${portal.key}/dashboard`

  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [jobData, setJobData] = useState([])
  const [departments, setDepartments] = useState([])
  const [designations, setDesignations] = useState([])
  const [levels, setLevels] = useState([])
  const [selectedJobId, setSelectedJobId] = useState('')
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})
  const [formData, setFormData] = useState(INITIAL_FORM_DATA)
  // const [formData, setFormData] = useState({
  //   id: "",
  //   SH_DESC: "",
  //   DESCR: "",
  //   DEPT_ID: "",
  //   DESIG_ID: "",
  //   LVL_ID: "",
  //   MIN_EXP: "",
  //   MAX_EXP: "",
  //   MIN_AGE: "",
  //   MAX_AGE: "",
  //   MIN_QUAL: "",
  //   MAX_QUAL: "",
  //   EXP: "",
  //   AGE_RANGE: "",
  //   MIN_SAL: "",
  //   MAX_SAL: "",
  //   REPT_JDID: "",

  //   // Additional tab data
  //   RESPONSIBILITIES: "",
  //   KRA: "",
  //   EDUCATION: { QUALIFICATION: "", COMMENTS: "" },
  //   SKILLS: [], // { code, details, level }
  //   ALLOWANCES: [], // { listing, appliedLocation }
  //   CTC_HEADS: [], // { head, formula, value, from, to }
  //   QUESTION_TEMPLATE: "",
  //   DEPT_REFERENCES: "",
  //   DIVISION_MAPPING: "",
  //   INDUCTION: { INDUCTION: "", ORGANOGRAM: "", SEQUENCE: "" },

  //   UPLOAD_DOC: null,
  // });

  const [activeTab, setActiveTab] = useState('basic')
  const [kraList, setKraList] = useState([])
  const [qualificationList, setQualificationList] = useState([])
  const [skillList, setSkillList] = useState([])
  const [skillLevelList, setSkillLevelList] = useState([])
  const [allowanceList, setAllowanceList] = useState([])
  const [frequencyList, setFrequencyList] = useState([])
  const [ctcHeadList, setCtcHeadList] = useState([])
  const [formulaList, setFormulaList] = useState([])
  const [questionGroups, setQuestionGroups] = useState([])
  const [questionSubGroups, setQuestionSubGroups] = useState([])
  const [questionList, setQuestionList] = useState([])
  const [departmentReferenceList, setDepartmentReferenceList] = useState([])
  const [divisionList, setDivisionList] = useState([])
  const [inductionList, setInductionList] = useState([])
  const [organogramList, setOrganogramList] = useState([])

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const [
        jobsResponse,
        departmentsResponse,
        designationsResponse,
        levelsResponse
      ] = await Promise.all([
        getJobDescriptions(),
        getDepartmentMasterData(),
        getDesignationsMaster(),
        getMasterData('HR_ORG_LEVEL')
      ])

      setJobData(normalizeRecords(jobsResponse))
      setDepartments(normalizeRecords(departmentsResponse))
      setDesignations(normalizeRecords(designationsResponse))
      setLevels(normalizeRecords(levelsResponse))
    } catch (error) {
      console.error('Error loading job descriptions page data:', error)
      notifyError(error?.message || 'Unable to load job description data.')
    } finally {
      setLoading(false)
    }
  }, [])

  // const loadData = useCallback(async () => {
  //   try {
  //     setLoading(true)

  //     // const [
  //     //   jobsResponse,
  //     //   departmentsResponse,
  //     //   designationsResponse,
  //     //   levelsResponse,
  //     //   mastersResponse
  //     // ] = await Promise.all([
  //     //   getJobDescriptions(),
  //     //   getDepartmentMasterData(),
  //     //   getDesignationsMaster(),
  //     //   getMasterData('HR_ORG_LEVEL'),
  //     //   getJobDescriptionMasters()
  //     // ])

  //     const [
  //       jobsResponse,
  //       departmentsResponse,
  //       designationsResponse,
  //       levelsResponse,
  //       kraResponse,
  //       qualificationResponse,
  //       skillResponse,
  //       expertiseResponse,
  //       allowanceResponse,
  //       frequencyResponse,
  //       ctcHeadResponse,
  //       formulaResponse,
  //       questionTemplateResponse,
  //       divisionResponse,
  //       inductionResponse,
  //       organogramResponse
  //     ] = await Promise.all([
  //       getJobDescriptions(),
  //       getDepartmentMasterData(),
  //       getDesignationsMaster(),
  //       getMasterData('HR_ORG_LEVEL'),
  //       getKRAList(),
  //       getQualificationList(),
  //       getSkillList(),
  //       getExpertiseLevelList(),
  //       getAllowanceList(),
  //       getFrequencyList(),
  //       getCTCHeadList(),
  //       getFormulaList(),
  //       getQuestionTemplateList(),
  //       getDivisionList(),
  //       getInductionList(),
  //       getOrganogramList()
  //     ])

  //     setJobData(normalizeRecords(jobsResponse))
  //     setDepartments(normalizeRecords(departmentsResponse))
  //     setDesignations(normalizeRecords(designationsResponse))
  //     setLevels(normalizeRecords(levelsResponse))

  //     // setKraList(normalizeRecords(mastersResponse?.kra))
  //     // setQualificationList(normalizeRecords(mastersResponse?.qualifications))
  //     // setSkillList(normalizeRecords(mastersResponse?.skills))
  //     // setSkillLevelList(normalizeRecords(mastersResponse?.skillLevels))
  //     // setAllowanceList(normalizeRecords(mastersResponse?.allowances))
  //     // setFrequencyList(normalizeRecords(mastersResponse?.frequencies))
  //     // setCtcHeadList(normalizeRecords(mastersResponse?.ctcHeads))
  //     // setFormulaList(normalizeRecords(mastersResponse?.formulas))
  //     // setQuestionGroups(normalizeRecords(mastersResponse?.questionGroups))
  //     // setQuestionSubGroups(normalizeRecords(mastersResponse?.questionSubGroups))
  //     // setQuestionList(normalizeRecords(mastersResponse?.questions))
  //     // setDepartmentReferenceList(normalizeRecords(mastersResponse?.departments))
  //     // setDivisionList(normalizeRecords(mastersResponse?.divisions))
  //     // setInductionList(normalizeRecords(mastersResponse?.inductions))
  //     // setOrganogramList(normalizeRecords(mastersResponse?.organograms))
  //     setKraList(normalizeRecords(kraResponse))
  //     setQualificationList(normalizeRecords(qualificationResponse))
  //     setSkillList(normalizeRecords(skillResponse))
  //     setExpertiseLevelList(normalizeRecords(expertiseResponse))
  //     setAllowanceList(normalizeRecords(allowanceResponse))
  //     setFrequencyList(normalizeRecords(frequencyResponse))
  //     setCtcHeadList(normalizeRecords(ctcHeadResponse))
  //     setFormulaList(normalizeRecords(formulaResponse))
  //     setQuestionTemplateList(normalizeRecords(questionTemplateResponse))
  //     setDivisionList(normalizeRecords(divisionResponse))
  //     setInductionList(normalizeRecords(inductionResponse))
  //     setOrganogramList(normalizeRecords(organogramResponse))
  //   } catch (error) {
  //     console.error('Error loading job descriptions page data:', error)
  //     notifyError(error?.message || 'Unable to load job description data.')
  //   } finally {
  //     setLoading(false)
  //   }
  // }, [])

  useEffect(() => {
    void loadData() // eslint-disable-line react-hooks/set-state-in-effect
  }, [loadData])

  const jobList = useMemo(() => {
    return normalizeRecords(jobData).map((item, index) => ({
      ID: item.ID ?? item.id ?? index + 1,
      SH_DESC: getDisplayValue(item, ['SH_DESC', 'sh_desc', 'label'], ''),
      DESCR: getDisplayValue(item, ['DESCR', 'descr', 'description'], ''),
      DEPT_ID: item.DEPT_ID ?? item.dept_id ?? '',
      DEPT_NAME: getDisplayValue(
        item,
        ['DEPT_NAME', 'dept_name', 'DEPT_DESC', 'department'],
        ''
      ),
      DESIG_ID: item.DESIG_ID ?? item.desig_id ?? '',
      DESIG_NAME: getDisplayValue(
        item,
        ['DESIG_NAME', 'desig_name', 'designation'],
        ''
      ),
      LVL_ID: item.LVL_ID ?? item.lvl_id ?? '',
      LVL_DESC: getDisplayValue(item, ['LVL_DESC', 'lvl_desc', 'name'], ''),
      MIN_SAL: item.MIN_SAL ?? item.min_sal ?? item.minSal ?? '',
      MAX_SAL: item.MAX_SAL ?? item.max_sal ?? item.maxSal ?? '',
      AGE_RANGE: getDisplayValue(
        item,
        ['AGE_RANGE', 'age_range', 'AGE_RANGE'],
        ''
      ),
      EXP: getDisplayValue(item, ['EXP', 'exp'], ''),
      REPT_JDID: item.REPT_JDID ?? item.rep_jdid ?? item.reporting_id ?? '',
      REPORTS_TO: getDisplayValue(
        item,
        ['REPORTS_TO', 'reports_to', 'REPORTS_TO_LABEL'],
        ''
      ),
      STATUS: item.STATUS ?? item.status ?? ''
    }))
  }, [jobData])

  const filteredList = useMemo(() => {
    if (!searchQuery.trim()) return jobList
    const q = searchQuery.trim().toLowerCase()
    return jobList.filter(
      item =>
        item.SH_DESC.toLowerCase().includes(q) ||
        item.DEPT_NAME.toLowerCase().includes(q) ||
        item.DESIG_NAME.toLowerCase().includes(q)
    )
  }, [jobList, searchQuery])

  const departmentOptions = useMemo(
    () =>
      normalizeRecords(departments).map((item, index) => ({
        // value: getDisplayValue(
        //   item,
        //   ['DEPT_CODE', 'dept_code', 'DEPT_ID', 'id'],
        //   String(index + 1)
        // ),
        value: getDisplayValue(
          item,
          ['DEPT_ID', 'dept_id', 'id'],
          String(index + 1)
        ),
        label: getDisplayValue(
          item,
          ['DEPT_DESC', 'dept_desc', 'DEPT_NAME', 'name'],
          ''
        )
      })),
    [departments]
  )

  const designationOptions = useMemo(
    () =>
      normalizeRecords(designations).map((item, index) => ({
        value: getDisplayValue(
          item,
          ['DESI_ID', 'desi_id', 'DESIG_ID', 'id'],
          String(index + 1)
        ),
        label: getDisplayValue(
          item,
          ['DESI_DESC', 'desi_desc', 'DESIG_NAME', 'name'],
          ''
        )
      })),
    [designations]
  )

  const levelOptions = useMemo(
    () =>
      normalizeRecords(levels).map((item, index) => ({
        value: getDisplayValue(
          item,
          ['OLVL_ID', 'olvl_id', 'LVL_ID', 'id'],
          String(index + 1)
        ),
        label: getDisplayValue(
          item,
          ['OLVL_DESC', 'olvl_desc', 'LVL_DESC', 'name'],
          ''
        )
      })),
    [levels]
  )

  const reportingOptions = useMemo(
    () =>
      jobList
        .filter(item => String(item.ID) !== String(selectedJobId))
        .map(item => ({
          value: String(item.ID),
          label: `${item.SH_DESC}${
            item.DEPT_NAME
              ? ` (${item.DEPT_NAME}${
                  item.DESIG_NAME ? ` - ${item.DESIG_NAME}` : ''
                })`
              : ''
          }`
        })),
    [jobList, selectedJobId]
  )

  const kraOptions = useMemo(
    () =>
      kraList.map(item => ({
        value: item.KRA_ID ?? item.kra_id,
        label: item.KRA_DESC ?? item.kra_desc
      })),
    [kraList]
  )

  const qualificationOptions = useMemo(
    () =>
      qualificationList.map(item => ({
        value: item.QUA_ID ?? item.qua_id,
        label: item.QUA_DESC ?? item.qua_desc
      })),
    [qualificationList]
  )

  const skillOptions = useMemo(
    () =>
      skillList.map(item => ({
        value: item.CAPA_ID ?? item.capa_id,
        label: `${item.CAPA_CODE ?? item.capa_code} - ${
          item.CAPA_DESC ?? item.capa_desc
        }`
      })),
    [skillList]
  )

  const skillLevelOptions = useMemo(
    () =>
      skillLevelList.map(item => ({
        value: item.CAPALVL_ID ?? item.capalvl_id,
        label: item.CAPALVL_DESC ?? item.capalvl_desc
      })),
    [skillLevelList]
  )

  const allowanceOptions = useMemo(
    () =>
      allowanceList.map(item => ({
        value: item.ALLOW_ID ?? item.allow_id,
        label: item.ALLOW_DESC ?? item.allow_desc
      })),
    [allowanceList]
  )

  const divisionOptions = useMemo(
    () =>
      divisionList.map(item => ({
        value: item.DIVSN_ID ?? item.divsn_id,
        label: item.DIVSN_DESC ?? item.divsn_desc
      })),
    [divisionList]
  )

  const inductionOptions = useMemo(
    () =>
      inductionList.map(item => ({
        value: item.INDUC_ID ?? item.induc_id,
        label: item.INDUC_DESC ?? item.induc_desc
      })),
    [inductionList]
  )

  // const resetForm = () => {
  //   setSelectedJobId("");
  //   setIsCreatingNew(false);
  //   setFormData({
  //     id: "",
  //     SH_DESC: "",
  //     DESCR: "",
  //     DEPT_ID: "",
  //     DESIG_ID: "",
  //     LVL_ID: "",
  //     EXP: "",
  //     AGE_RANGE: "",
  //     MIN_SAL: "",
  //     MAX_SAL: "",
  //     REPT_JDID: "",
  //   });
  //   setErrors({});
  // };

  const resetForm = () => {
    setSelectedJobId('')
    setFormData({
      ...INITIAL_FORM_DATA,
      EDUCATION: {
        ...INITIAL_FORM_DATA.EDUCATION
      },
      INDUCTION: {
        ...INITIAL_FORM_DATA.INDUCTION
      }
    })
    setActiveTab('basic')
    setErrors({})
  }

  const startNewJob = () => {
    resetForm()

    setSelectedJobId('')

    setActiveTab('basic')

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  // const startEditJob = job => {
  //   setSelectedJobId(job.ID)

  //   setFormData({
  //     ...INITIAL_FORM_DATA,

  //     id: job.ID,
  //     SH_DESC: job.SH_DESC || '',
  //     DESCR: job.DESCR || '',
  //     DEPT_ID: job.DEPT_ID || '',
  //     DESIG_ID: job.DESIG_ID || '',
  //     LVL_ID: job.LVL_ID || '',

  //     EXP: job.EXP || '',
  //     AGE_RANGE: job.AGE_RANGE || '',

  //     MIN_SAL: job.MIN_SAL || '',
  //     MAX_SAL: job.MAX_SAL || '',

  //     REPT_JDID: job.REPT_JDID || '',

  //     // Keep nested objects initialized
  //     EDUCATION: {
  //       ...INITIAL_FORM_DATA.EDUCATION
  //     },

  //     INDUCTION: {
  //       ...INITIAL_FORM_DATA.INDUCTION
  //     }
  //   })

  //   setActiveTab('basic')
  //   setErrors({})

  //   window.scrollTo({
  //     top: 0,
  //     behavior: 'smooth'
  //   })
  // }

  const startEditJob = async job => {
    try {
      setLoading(true)

      // First select the job
      setSelectedJobId(job.ID)

      // Fetch complete job description details from DB
      const response = await getJobDescriptionById(job.ID)

      console.log('Selected Job Description response:', response)

      const selectedJob =
        response?.data?.jobDescription || response?.jobDescription || null

      if (!selectedJob) {
        notifyError('Unable to fetch job description details.')
        return
      }

      // Put DB values into form
      setFormData({
        ...INITIAL_FORM_DATA,

        id: selectedJob.ID || '',

        SH_DESC: selectedJob.SH_DESC || '',
        DESCR: selectedJob.DESCR || '',

        DEPT_ID: selectedJob.DEPT_ID || '',
        DESIG_ID: selectedJob.DESIG_ID || '',
        LVL_ID: selectedJob.LVL_ID || '',

        MIN_EXP: selectedJob.MIN_EXP || '',
        MAX_EXP: selectedJob.MAX_EXP || '',

        MIN_AGE: selectedJob.MIN_AGE || '',
        MAX_AGE: selectedJob.MAX_AGE || '',

        MIN_QUAL: selectedJob.MIN_QUALI || '',
        MAX_QUAL: selectedJob.MAX_QUALI || '',

        EXP: selectedJob.EXP || '',
        AGE_RANGE: selectedJob.AGE_RANGE || '',

        MIN_SAL: selectedJob.MIN_SAL || '',
        MAX_SAL: selectedJob.MAX_SAL || '',

        REPT_JDID: selectedJob.REPT_JDID || '',

        // Keep other tabs initialized
        // EDUCATION: {
        //   ...INITIAL_FORM_DATA.EDUCATION
        // },

        // INDUCTION: {
        //   ...INITIAL_FORM_DATA.INDUCTION
        // },

        // SKILLS: [],
        // ALLOWANCES: [],
        // CTC_HEADS: []
        EDUCATION: selectedJob.EDUCATION_LIST?.[0]
          ? {
              QUA_ID: selectedJob.EDUCATION_LIST[0].QUA_ID || '',
              COMMENTS: selectedJob.EDUCATION_LIST[0].COMMENTS || ''
            }
          : {
              ...INITIAL_FORM_DATA.EDUCATION
            },

        SKILLS: selectedJob.SKILLS_LIST || [],

        ALLOWANCES: selectedJob.ALLOWANCES_LIST || [],

        CTC_HEADS: selectedJob.CTC_HEADS_LIST || [],

        INDUCTION: selectedJob.INDUCTION_LIST?.[0]
          ? {
              INDUC_ID: selectedJob.INDUCTION_LIST[0].INDUC_ID || '',
              ORG_ID: selectedJob.INDUCTION_LIST[0].ORG_ID || '',
              ORG_LOC_ID: selectedJob.INDUCTION_LIST[0].ORG_LOC_ID || '',
              DISP_SEQ: selectedJob.INDUCTION_LIST[0].DISP_SEQ || ''
            }
          : {
              ...INITIAL_FORM_DATA.INDUCTION
            },

        KRA: selectedJob.KRA_LIST || [],

        QUESTION_TEMPLATE: selectedJob.QUESTION_TEMPLATE_LIST || [],

        DEPT_REFERENCES: selectedJob.DEPT_REFERENCE_LIST || [],

        DIVISION_MAPPING: selectedJob.DIVISION_MAPPING_LIST || []
      })

      // Always open Basic Details first
      setActiveTab('basic')

      setErrors({})

      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      })
    } catch (error) {
      console.error('Error loading job description:', error)

      notifyError(error?.message || 'Unable to load job description details.')
    } finally {
      setLoading(false)
    }
  }

  const loadJobDescription = async jobId => {
    if (!jobId) return

    try {
      setLoading(true)

      const response = await getJobDescriptionById(jobId)

      if (!response?.status) {
        notifyError(response?.message || 'Unable to fetch job description.')
        return
      }

      const job = response?.data?.jobDescription

      if (!job) {
        notifyError('Job description data not found.')
        return
      }

      setSelectedJobId(job.ID)

      setFormData(prev => ({
        ...prev,

        id: job.ID ?? '',

        SH_DESC: job.SH_DESC ?? '',
        DESCR: job.DESCR ?? '',

        DEPT_ID: job.DEPT_ID ?? '',
        DESIG_ID: job.DESIG_ID ?? '',
        LVL_ID: job.LVL_ID ?? '',

        MIN_EXP: job.MIN_EXP ?? '',
        MAX_EXP: job.MAX_EXP ?? '',

        MIN_AGE: job.MIN_AGE ?? '',
        MAX_AGE: job.MAX_AGE ?? '',

        MIN_SAL: job.MIN_SAL ?? '',
        MAX_SAL: job.MAX_SAL ?? '',

        MIN_QUAL: job.MIN_QUALI ?? '',
        MAX_QUAL: job.MAX_QUALI ?? '',

        REPT_JDID: job.REPT_JDID ?? '',

        JD_DOC_PATH: job.JD_DOC_PATH ?? ''
      }))

      // Existing JD selected → show all tabs
      setShowTabs(true)
    } catch (error) {
      console.error('Error loading job description:', error)

      notifyError(error?.message || 'Unable to load job description.')
    } finally {
      setLoading(false)
    }
  }

  const handleFieldChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setErrors(prev => ({ ...prev, [name]: '' }))
  }

  // array helpers for dynamic tab rows
  const addArrayItem = (key, item) => {
    setFormData(prev => ({ ...prev, [key]: [...(prev[key] || []), item] }))
  }

  const removeArrayItem = (key, idx) => {
    setFormData(prev => ({
      ...prev,
      [key]: (prev[key] || []).filter((_, i) => i !== idx)
    }))
  }

  const updateArrayField = (key, idx, field, value) => {
    setFormData(prev => {
      const arr = Array.isArray(prev[key]) ? [...prev[key]] : []
      arr[idx] = { ...(arr[idx] || {}), [field]: value }
      return { ...prev, [key]: arr }
    })
  }

  const validateForm = () => {
    const newErrors = {}

    if (!String(formData.SH_DESC || '').trim()) {
      newErrors.SH_DESC = 'JD Label is required'
    }
    if (!String(formData.DEPT_ID || '').trim()) {
      newErrors.DEPT_ID = 'Department is required'
    }
    if (!String(formData.DESIG_ID || '').trim()) {
      newErrors.DESIG_ID = 'Designation is required'
    }
    if (!String(formData.LVL_ID || '').trim()) {
      newErrors.LVL_ID = 'Band/Level is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async event => {
    event.preventDefault && event.preventDefault()
    if (!validateForm()) return

    setSaving(true)

    try {
      // include tab data in payload; arrays are stringified for backend compatibility
      const payload = {
        id: formData.id,
        shdesc: formData.SH_DESC,
        desc: formData.DESCR,
        deptid: formData.DEPT_ID,
        desigid: formData.DESIG_ID,
        lvlid: formData.LVL_ID,
        minexp: formData.MIN_EXP,
        maxexp: formData.MAX_EXP,
        minage: formData.MIN_AGE,
        maxage: formData.MAX_AGE,
        minqual: formData.MIN_QUAL,
        maxqual: formData.MAX_QUAL,
        exp: formData.EXP,
        Age_Range: formData.AGE_RANGE,
        minsal: formData.MIN_SAL,
        maxsal: formData.MAX_SAL,
        rep_jdid: formData.REPT_JDID,

        responsibilities: formData.RESPONSIBILITIES,
        kra: formData.KRA,
        education: JSON.stringify(formData.EDUCATION || {}),
        skills: JSON.stringify(formData.SKILLS || []),
        allowances: JSON.stringify(formData.ALLOWANCES || []),
        ctc_heads: JSON.stringify(formData.CTC_HEADS || []),
        question_template: formData.QUESTION_TEMPLATE,
        dept_references: formData.DEPT_REFERENCES,
        division_mapping: formData.DIVISION_MAPPING,
        induction: JSON.stringify(formData.INDUCTION || {})
      }

      const response = await saveJobDescription(payload)

      if (response?.status) {
        notifySuccess(
          response?.message || 'Job description saved successfully.'
        )
        await loadData()
        if (response?.data?.id) {
          setSelectedJobId(response.data.id)
        }
      } else {
        notifyError(response?.message || 'Unable to save job description.')
      }
    } catch (error) {
      console.error('Save job description error:', error)
      notifyError(error?.message || 'Unable to save job description.')
    } finally {
      setSaving(false)
    }
  }

  // const showForm = isCreatingNew || Boolean(selectedJobId);
  const showForm = true
  const showAllTabs = Boolean(selectedJobId)

  const tabs = [
    ['basic', 'Basic Details'],
    ['responsibilities', 'Responsibilities'],
    ['kra', 'KRA'],
    ['education', 'Education'],
    ['skills', 'Skills'],
    ['allowances', 'Allowances/Reimbursement'],
    ['ctc', 'CTC Heads'],
    ['questions', 'Question Template'],
    ['deptref', 'Department Reference'],
    ['division', 'Division Mapping'],
    ['induction', 'Induction']
  ]

  const visibleTabs = showAllTabs
    ? tabs
    : tabs.filter(([key]) => key === 'basic')

  const jdStyles = {
    card: {
      border: '1px solid #e1e5eb',
      borderRadius: '8px',
      background: '#fff'
    },

    tabContainer: {
      background: '#155e7a',
      borderRadius: '4px 4px 0 0',
      padding: '0 12px'
    },

    tabButton: {
      border: 'none',
      background: 'transparent',
      color: '#fff',
      padding: '10px 14px',
      fontSize: '14px',
      fontWeight: 500,
      whiteSpace: 'nowrap'
    },

    activeTabButton: {
      background: '#fff',
      color: '#17324d',
      borderRadius: '4px 4px 0 0'
    },

    label: {
      fontSize: '13px',
      fontWeight: 600,
      color: '#1f1f1f',
      marginBottom: '6px'
    },

    required: {
      color: '#e53935'
    },

    field: {
      minHeight: '38px'
    },

    sectionBody: {
      padding: '20px 16px 12px'
    }
  }

  return (
    <>
      <style>
        {`
        .ck-editor__editable {
          min-height: 300px;
          max-height: 500px;
        }
      `}
      </style>
      {/* ============================
        PAGE HEADER
        ============================ */}
      <div className='page-header'>
        <div className='add-item d-flex'>
          <div className='page-title'>
            <h4>Job Description</h4>
          </div>
        </div>

        <BreadcrumbNav
          items={[
            {
              text: 'Home',
              link: portalHome
            },
            {
              text: 'Job Description'
            }
          ]}
        />
      </div>

      {/* ============================
        MAIN CARD
        ============================ */}
      <div className='row'>
        <div className='col-12'>
          <div className='card' style={jdStyles.card}>
            <div className='card-body'>
              {/* ============================
                JOB DESCRIPTION SELECT
                ============================ */}
              <div className='row align-items-end mb-3'>
                <div className='col-lg-6 col-md-8'>
                  <label style={jdStyles.label}>Job Description</label>

                  <Select
                    options={jobList.map(item => ({
                      value: item.ID,
                      label: `${item.ID} - ${item.SH_DESC}${
                        item.DEPT_NAME
                          ? ` (${item.DEPT_NAME}${
                              item.DESIG_NAME ? ` - ${item.DESIG_NAME}` : ''
                            })`
                          : ''
                      }`
                    }))}
                    value={
                      selectedJobId
                        ? jobList
                            .map(item => ({
                              value: item.ID,
                              label: `${item.ID} - ${item.SH_DESC}${
                                item.DEPT_NAME
                                  ? ` (${item.DEPT_NAME}${
                                      item.DESIG_NAME
                                        ? ` - ${item.DESIG_NAME}`
                                        : ''
                                    })`
                                  : ''
                              }`
                            }))
                            .find(
                              option =>
                                String(option.value) === String(selectedJobId)
                            ) || null
                        : null
                    }
                    onChange={option => {
                      if (!option) {
                        resetForm()
                        return
                      }

                      const selectedJob = jobList.find(
                        item => String(item.ID) === String(option.value)
                      )

                      if (selectedJob) {
                        startEditJob(selectedJob)
                      }
                    }}
                    placeholder='Select Job Description'
                    isSearchable
                    isClearable
                    isLoading={loading}
                  />
                </div>
              </div>

              {/* ============================
                FORM
                ============================ */}
              {showForm && (
                <form onSubmit={handleSave}>
                  {/* ============================
                    TABS
                    ============================ */}
                  <div
                    style={jdStyles.tabContainer}
                    className='d-flex flex-wrap'
                  >
                    {visibleTabs.map(([key, label]) => (
                      <button
                        key={key}
                        type='button'
                        onClick={() => setActiveTab(key)}
                        style={{
                          ...jdStyles.tabButton,
                          ...(activeTab === key ? jdStyles.activeTabButton : {})
                        }}
                      >
                        {label}
                      </button>
                    ))}
                  </div>

                  {/* ============================
                    TAB CONTENT
                    ============================ */}
                  <div
                    style={{
                      ...jdStyles.sectionBody,
                      border: '1px solid #e1e5eb',
                      borderTop: 'none'
                    }}
                  >
                    {/* ==========================================
                      BASIC DETAILS
                      ========================================== */}
                    {activeTab === 'basic' && (
                      <div className='row'>
                        {/* JD LABEL */}
                        <div className='col-lg-4 col-md-6 mb-3'>
                          <label style={jdStyles.label}>
                            JD Label
                            <span style={jdStyles.required}>*</span>
                          </label>

                          <input
                            type='text'
                            className={`form-control ${
                              errors.SH_DESC ? 'is-invalid' : ''
                            }`}
                            value={formData.SH_DESC}
                            onChange={e =>
                              handleFieldChange('SH_DESC', e.target.value)
                            }
                            maxLength={100}
                          />

                          {errors.SH_DESC && (
                            <div className='invalid-feedback'>
                              {errors.SH_DESC}
                            </div>
                          )}
                        </div>

                        {/* DEPARTMENT */}
                        <div className='col-lg-4 col-md-6 mb-3'>
                          <label style={jdStyles.label}>
                            Department
                            <span style={jdStyles.required}>*</span>
                          </label>

                          <Select
                            options={departmentOptions}
                            value={
                              departmentOptions.find(
                                o =>
                                  String(o.value) === String(formData.DEPT_ID)
                              ) || null
                            }
                            onChange={option =>
                              handleFieldChange('DEPT_ID', option?.value || '')
                            }
                            isSearchable
                            isClearable
                            placeholder='Select Department'
                          />

                          {errors.DEPT_ID && (
                            <div className='text-danger small mt-1'>
                              {errors.DEPT_ID}
                            </div>
                          )}
                        </div>

                        {/* DESIGNATION */}
                        <div className='col-lg-4 col-md-6 mb-3'>
                          <label style={jdStyles.label}>
                            Designation
                            <span style={jdStyles.required}>*</span>
                          </label>

                          <Select
                            options={designationOptions}
                            value={
                              designationOptions.find(
                                o =>
                                  String(o.value) === String(formData.DESIG_ID)
                              ) || null
                            }
                            onChange={option =>
                              handleFieldChange('DESIG_ID', option?.value || '')
                            }
                            isSearchable
                            isClearable
                            placeholder='Select Designation'
                          />

                          {errors.DESIG_ID && (
                            <div className='text-danger small mt-1'>
                              {errors.DESIG_ID}
                            </div>
                          )}
                        </div>

                        {/* EMPLOYEE LEVEL */}
                        <div className='col-lg-4 col-md-6 mb-3'>
                          <label style={jdStyles.label}>
                            Employee Level
                            <span style={jdStyles.required}>*</span>
                          </label>

                          <Select
                            options={levelOptions}
                            value={
                              levelOptions.find(
                                o => String(o.value) === String(formData.LVL_ID)
                              ) || null
                            }
                            onChange={option =>
                              handleFieldChange('LVL_ID', option?.value || '')
                            }
                            isSearchable
                            isClearable
                            placeholder='Select Employee Level'
                          />

                          {errors.LVL_ID && (
                            <div className='text-danger small mt-1'>
                              {errors.LVL_ID}
                            </div>
                          )}
                        </div>

                        {/* MIN EXPERIENCE */}
                        <div className='col-lg-3 col-md-6 mb-3'>
                          <label style={jdStyles.label}>
                            Minimum Experience
                            <span style={jdStyles.required}>*</span>
                          </label>

                          <input
                            type='number'
                            className='form-control'
                            value={formData.MIN_EXP}
                            onChange={e =>
                              handleFieldChange('MIN_EXP', e.target.value)
                            }
                            min={0}
                          />
                        </div>

                        {/* MAX EXPERIENCE */}
                        <div className='col-lg-3 col-md-6 mb-3'>
                          <label style={jdStyles.label}>
                            Maximum Experience
                            <span style={jdStyles.required}>*</span>
                          </label>

                          <input
                            type='number'
                            className='form-control'
                            value={formData.MAX_EXP}
                            onChange={e =>
                              handleFieldChange('MAX_EXP', e.target.value)
                            }
                            min={0}
                          />
                        </div>

                        {/* MIN AGE */}
                        <div className='col-lg-3 col-md-6 mb-3'>
                          <label style={jdStyles.label}>
                            Minimum Age
                            <span style={jdStyles.required}>*</span>
                          </label>

                          <input
                            type='number'
                            className='form-control'
                            value={formData.MIN_AGE}
                            onChange={e =>
                              handleFieldChange('MIN_AGE', e.target.value)
                            }
                            min={0}
                          />
                        </div>

                        {/* MAX AGE */}
                        <div className='col-lg-3 col-md-6 mb-3'>
                          <label style={jdStyles.label}>
                            Maximum Age
                            <span style={jdStyles.required}>*</span>
                          </label>

                          <input
                            type='number'
                            className='form-control'
                            value={formData.MAX_AGE}
                            onChange={e =>
                              handleFieldChange('MAX_AGE', e.target.value)
                            }
                            min={0}
                          />
                        </div>

                        {/* MIN CTC */}
                        <div className='col-lg-3 col-md-6 mb-3'>
                          <label style={jdStyles.label}>
                            Minimum CTC
                            <span style={jdStyles.required}>*</span>
                          </label>

                          <input
                            type='number'
                            className='form-control'
                            value={formData.MIN_SAL}
                            onChange={e =>
                              handleFieldChange('MIN_SAL', e.target.value)
                            }
                            min={0}
                          />
                        </div>

                        {/* MAX CTC */}
                        <div className='col-lg-3 col-md-6 mb-3'>
                          <label style={jdStyles.label}>
                            Maximum CTC
                            <span style={jdStyles.required}>*</span>
                          </label>

                          <input
                            type='number'
                            className='form-control'
                            value={formData.MAX_SAL}
                            onChange={e =>
                              handleFieldChange('MAX_SAL', e.target.value)
                            }
                            min={0}
                          />
                        </div>

                        {/* MIN QUALIFICATION */}
                        <div className='col-lg-3 col-md-6 mb-3'>
                          <label style={jdStyles.label}>
                            Minimum Qualification
                            <span style={jdStyles.required}>*</span>
                          </label>

                          <Select
                            options={qualificationOptions}
                            value={
                              qualificationOptions.find(
                                o =>
                                  String(o.value) === String(formData.MIN_QUAL)
                              ) || null
                            }
                            onChange={option =>
                              handleFieldChange('MIN_QUAL', option?.value || '')
                            }
                            isSearchable
                            isClearable
                            placeholder='Select Qualification'
                          />

                          {errors.MIN_QUAL && (
                            <div className='text-danger small mt-1'>
                              {errors.MIN_QUAL}
                            </div>
                          )}
                        </div>

                        {/* MAX QUALIFICATION */}
                        <div className='col-lg-3 col-md-6 mb-3'>
                          <label style={jdStyles.label}>
                            Maximum Qualification
                            <span style={jdStyles.required}>*</span>
                          </label>

                          <Select
                            options={qualificationOptions}
                            value={
                              qualificationOptions.find(
                                o =>
                                  String(o.value) === String(formData.MAX_QUAL)
                              ) || null
                            }
                            onChange={option =>
                              handleFieldChange('MAX_QUAL', option?.value || '')
                            }
                            isSearchable
                            isClearable
                            placeholder='Select Qualification'
                          />

                          {errors.MAX_QUAL && (
                            <div className='text-danger small mt-1'>
                              {errors.MAX_QUAL}
                            </div>
                          )}
                        </div>

                        {/* SHORT DESCRIPTION */}
                        <div className='col-lg-8 mb-3'>
                          <label style={jdStyles.label}>
                            Short Desc About Role
                            <span style={jdStyles.required}>*</span>
                          </label>

                          <textarea
                            className='form-control'
                            rows={5}
                            value={formData.DESCR}
                            onChange={e =>
                              handleFieldChange('DESCR', e.target.value)
                            }
                          />
                        </div>

                        {/* UPLOAD DOCUMENT */}
                        <div className='col-lg-4 mb-3'>
                          <label style={jdStyles.label}>Upload Document</label>

                          <input
                            type='file'
                            className='form-control'
                            onChange={e =>
                              handleFieldChange(
                                'UPLOAD_DOC',
                                e.target.files?.[0] || null
                              )
                            }
                          />
                        </div>
                      </div>
                    )}

                    {/* ==========================================
                      RESPONSIBILITIES
                      ========================================== */}
                    {showAllTabs && activeTab === 'responsibilities' && (
                      <div>
                        <label style={jdStyles.label}>Responsibilities</label>

                        <CKEditor
                          editor={ClassicEditor}
                          data={formData.RESPONSIBILITIES || ''}
                          config={{
                            licenseKey: 'GPL',
                            plugins: [
                              Essentials,
                              Paragraph,
                              Bold,
                              Italic,
                              Underline,
                              Strikethrough,
                              Font,
                              Link,
                              Alignment,
                              List,
                              BlockQuote
                            ],
                            toolbar: [
                              'undo',
                              'redo',
                              '|',
                              'bold',
                              'italic',
                              'underline',
                              'strikethrough',
                              '|',
                              'fontSize',
                              'fontFamily',
                              'fontColor',
                              'fontBackgroundColor',
                              '|',
                              'link',
                              '|',
                              'alignment',
                              '|',
                              'bulletedList',
                              'numberedList',
                              '|',
                              'blockQuote'
                            ]
                          }}
                          onChange={(event, editor) => {
                            handleFieldChange(
                              'RESPONSIBILITIES',
                              editor.getData()
                            )
                          }}
                        />
                      </div>
                    )}

                    {/* ==========================================
                      KRA
                      ========================================== */}
                    {showAllTabs && activeTab === 'kra' && (
                      <div>
                        <div className='mb-3'>
                          <label className='form-label'>KRA*</label>

                          <Select
                            options={kraOptions}
                            value={
                              kraOptions.find(
                                option =>
                                  String(option.value) === String(formData.KRA)
                              ) || null
                            }
                            onChange={option =>
                              handleFieldChange('KRA', option?.value || '')
                            }
                            isSearchable
                            isClearable
                            placeholder='Select KRA'
                          />
                        </div>
                      </div>
                    )}

                    {/* ==========================================
                      EDUCATION
                      ========================================== */}
                    {showAllTabs && activeTab === 'education' && (
                      <div className='row'>
                        <div className='col-lg-6 mb-3'>
                          <label style={jdStyles.label}>
                            Qualification
                            <span style={jdStyles.required}>*</span>
                          </label>

                          {/* <input
                            type='text'
                            className='form-control'
                            value={formData.EDUCATION?.QUALIFICATION || ''}
                            onChange={e =>
                              setFormData(prev => ({
                                ...prev,
                                EDUCATION: {
                                  ...prev.EDUCATION,
                                  QUALIFICATION: e.target.value
                                }
                              }))
                            }
                          /> */}

                          <Select
                            options={qualificationOptions}
                            value={
                              qualificationOptions.find(
                                option =>
                                  String(option.value) ===
                                  String(formData.EDUCATION.QUALIFICATION)
                              ) || null
                            }
                            onChange={option =>
                              setFormData(prev => ({
                                ...prev,
                                EDUCATION: {
                                  ...prev.EDUCATION,
                                  QUALIFICATION: option?.value || ''
                                }
                              }))
                            }
                            isSearchable
                            isClearable
                            placeholder='Select Qualification'
                          />
                        </div>

                        <div className='col-lg-6 mb-3'>
                          <label style={jdStyles.label}>
                            Comments
                            <span style={jdStyles.required}>*</span>
                          </label>

                          <input
                            type='text'
                            className='form-control'
                            value={formData.EDUCATION?.COMMENTS || ''}
                            onChange={e =>
                              setFormData(prev => ({
                                ...prev,
                                EDUCATION: {
                                  ...prev.EDUCATION,
                                  COMMENTS: e.target.value
                                }
                              }))
                            }
                          />
                        </div>
                      </div>
                    )}

                    {/* ==========================================
                      SKILLS
                      ========================================== */}
                    {showAllTabs && activeTab === 'skills' && (
                      <div>
                        <label style={jdStyles.label}>Skills</label>

                        {(formData.SKILLS || []).map((skill, idx) => (
                          <div className='row align-items-end mb-2' key={idx}>
                            <div className='col-md-3'>
                              {/* <input
                                className='form-control'
                                placeholder='Skill Code'
                                value={skill.code}
                                onChange={e =>
                                  updateArrayField(
                                    'SKILLS',
                                    idx,
                                    'code',
                                    e.target.value
                                  )
                                }
                              /> */}
                              <Select
                                options={skillOptions}
                                value={
                                  skillOptions.find(
                                    option =>
                                      String(option.value) === String(s.code)
                                  ) || null
                                }
                                onChange={option =>
                                  updateArrayField(
                                    'SKILLS',
                                    idx,
                                    'code',
                                    option?.value || ''
                                  )
                                }
                                isSearchable
                                isClearable
                                placeholder='Select Skill'
                              />
                            </div>

                            <div className='col-md-5'>
                              <input
                                className='form-control'
                                placeholder='Skill Details'
                                value={skill.details}
                                onChange={e =>
                                  updateArrayField(
                                    'SKILLS',
                                    idx,
                                    'details',
                                    e.target.value
                                  )
                                }
                              />
                            </div>

                            <div className='col-md-3'>
                              {/* <input
                                className='form-control'
                                placeholder='Expertise Level'
                                value={skill.level}
                                onChange={e =>
                                  updateArrayField(
                                    'SKILLS',
                                    idx,
                                    'level',
                                    e.target.value
                                  )
                                }
                              /> */}
                              <Select
                                options={skillLevelOptions}
                                value={
                                  skillLevelOptions.find(
                                    option =>
                                      String(option.value) === String(s.level)
                                  ) || null
                                }
                                onChange={option =>
                                  updateArrayField(
                                    'SKILLS',
                                    idx,
                                    'level',
                                    option?.value || ''
                                  )
                                }
                                isSearchable
                                isClearable
                                placeholder='Expertise Level'
                              />
                            </div>

                            <div className='col-md-1'>
                              <button
                                type='button'
                                className='btn btn-sm btn-danger'
                                onClick={() => removeArrayItem('SKILLS', idx)}
                              >
                                ×
                              </button>
                            </div>
                          </div>
                        ))}

                        <button
                          type='button'
                          className='btn btn-sm btn-outline-primary mt-2'
                          onClick={() =>
                            addArrayItem('SKILLS', {
                              code: '',
                              details: '',
                              level: ''
                            })
                          }
                        >
                          Add Skill
                        </button>
                      </div>
                    )}

                    {/* ==========================================
                      ALLOWANCES
                      ========================================== */}
                    {showAllTabs && activeTab === 'allowances' && (
                      <div>
                        <label style={jdStyles.label}>
                          Allowances / Reimbursements
                        </label>

                        {(formData.ALLOWANCES || []).map((item, idx) => (
                          <div className='row align-items-end mb-2' key={idx}>
                            <div className='col-md-6'>
                              {/* <input
                                className='form-control'
                                placeholder='Listing'
                                value={item.listing}
                                onChange={e =>
                                  updateArrayField(
                                    'ALLOWANCES',
                                    idx,
                                    'listing',
                                    e.target.value
                                  )
                                }
                              /> */}
                              <Select
                                options={allowanceOptions}
                                value={
                                  allowanceOptions.find(
                                    option =>
                                      String(option.value) ===
                                      String(item.listing)
                                  ) || null
                                }
                                onChange={option =>
                                  updateArrayField(
                                    'ALLOWANCES',
                                    idx,
                                    'listing',
                                    option?.value || ''
                                  )
                                }
                                isSearchable
                                isClearable
                                placeholder='Select Allowance'
                              />
                            </div>

                            <div className='col-md-5'>
                              <input
                                className='form-control'
                                placeholder='Applied Location'
                                value={item.appliedLocation}
                                onChange={e =>
                                  updateArrayField(
                                    'ALLOWANCES',
                                    idx,
                                    'appliedLocation',
                                    e.target.value
                                  )
                                }
                              />
                            </div>

                            <div className='col-md-1'>
                              <button
                                type='button'
                                className='btn btn-sm btn-danger'
                                onClick={() =>
                                  removeArrayItem('ALLOWANCES', idx)
                                }
                              >
                                ×
                              </button>
                            </div>
                          </div>
                        ))}

                        <button
                          type='button'
                          className='btn btn-sm btn-outline-primary mt-2'
                          onClick={() =>
                            addArrayItem('ALLOWANCES', {
                              listing: '',
                              appliedLocation: ''
                            })
                          }
                        >
                          Add Row
                        </button>
                      </div>
                    )}

                    {/* ==========================================
                      CTC HEADS
                      ========================================== */}
                    {showAllTabs && activeTab === 'ctc' && (
                      <div>
                        <label style={jdStyles.label}>CTC Heads</label>

                        {(formData.CTC_HEADS || []).map((item, idx) => (
                          <div className='row align-items-end mb-2' key={idx}>
                            <div className='col-md-3'>
                              <input
                                className='form-control'
                                placeholder='CTC Head'
                                value={item.head}
                                onChange={e =>
                                  updateArrayField(
                                    'CTC_HEADS',
                                    idx,
                                    'head',
                                    e.target.value
                                  )
                                }
                              />
                            </div>

                            <div className='col-md-3'>
                              <input
                                className='form-control'
                                placeholder='Formula'
                                value={item.formula}
                                onChange={e =>
                                  updateArrayField(
                                    'CTC_HEADS',
                                    idx,
                                    'formula',
                                    e.target.value
                                  )
                                }
                              />
                            </div>

                            <div className='col-md-2'>
                              <input
                                className='form-control'
                                placeholder='Value'
                                value={item.value}
                                onChange={e =>
                                  updateArrayField(
                                    'CTC_HEADS',
                                    idx,
                                    'value',
                                    e.target.value
                                  )
                                }
                              />
                            </div>

                            <div className='col-md-1'>
                              <input
                                type='date'
                                className='form-control'
                                value={item.from}
                                onChange={e =>
                                  updateArrayField(
                                    'CTC_HEADS',
                                    idx,
                                    'from',
                                    e.target.value
                                  )
                                }
                              />
                            </div>

                            <div className='col-md-1'>
                              <input
                                type='date'
                                className='form-control'
                                value={item.to}
                                onChange={e =>
                                  updateArrayField(
                                    'CTC_HEADS',
                                    idx,
                                    'to',
                                    e.target.value
                                  )
                                }
                              />
                            </div>

                            <div className='col-md-2'>
                              <button
                                type='button'
                                className='btn btn-sm btn-danger'
                                onClick={() =>
                                  removeArrayItem('CTC_HEADS', idx)
                                }
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        ))}

                        <button
                          type='button'
                          className='btn btn-sm btn-outline-primary mt-2'
                          onClick={() =>
                            addArrayItem('CTC_HEADS', {
                              head: '',
                              formula: '',
                              value: '',
                              from: '',
                              to: ''
                            })
                          }
                        >
                          Add Row
                        </button>
                      </div>
                    )}

                    {/* ==========================================
                      QUESTION TEMPLATE
                      ========================================== */}
                    {showAllTabs && activeTab === 'questions' && (
                      <div>
                        <label style={jdStyles.label}>Question Template</label>

                        {/* <textarea
                          className='form-control'
                          rows={8}
                          value={formData.QUESTION_TEMPLATE}
                          onChange={e =>
                            handleFieldChange(
                              'QUESTION_TEMPLATE',
                              e.target.value
                            )
                          }
                        /> */}
                        <table className='table table-bordered'>
                          <thead className='table-light'>
                            <tr>
                              <th>Group</th>
                              <th>Sub Group</th>
                              <th>Question</th>
                              <th>Sequence</th>
                              <th>Action</th>
                            </tr>
                          </thead>

                          <tbody>
                            {(formData.QUESTION_TEMPLATE || []).map(
                              (q, idx) => (
                                <tr key={idx}>
                                  <td>{q.groupName}</td>
                                  <td>{q.subGroupName}</td>
                                  <td>{q.question}</td>
                                  <td>{q.sequence}</td>
                                  <td>
                                    <button
                                      type='button'
                                      className='btn btn-sm btn-danger'
                                      onClick={() =>
                                        removeArrayItem(
                                          'QUESTION_TEMPLATE',
                                          idx
                                        )
                                      }
                                    >
                                      ×
                                    </button>
                                  </td>
                                </tr>
                              )
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* ==========================================
                      DEPARTMENT REFERENCE
                      ========================================== */}
                    {activeTab === 'deptref' && (
                      <div>
                        <label style={jdStyles.label}>
                          Department Reference
                        </label>

                        {/* <textarea
                          className='form-control'
                          rows={6}
                          value={formData.DEPT_REFERENCES}
                          onChange={e =>
                            handleFieldChange('DEPT_REFERENCES', e.target.value)
                          }
                        /> */}
                        <Select
                          options={departmentOptions}
                          value={null}
                          onChange={option => {
                            if (!option) return

                            addArrayItem('DEPT_REFERENCES', {
                              deptId: option.value,
                              deptName: option.label
                            })
                          }}
                          isSearchable
                          isClearable
                          placeholder='Select Department'
                        />

                        {(formData.DEPT_REFERENCES || []).map((dept, idx) => (
                          <div
                            key={idx}
                            className='d-flex align-items-center mb-2'
                          >
                            <span className='me-2'>{dept.deptName}</span>

                            <button
                              type='button'
                              className='btn btn-sm btn-danger'
                              onClick={() =>
                                removeArrayItem('DEPT_REFERENCES', idx)
                              }
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* ==========================================
                      DIVISION MAPPING
                      ========================================== */}
                    {showAllTabs && activeTab === 'division' && (
                      <div>
                        <label style={jdStyles.label}>Division Mapping</label>

                        {/* <textarea
                          className='form-control'
                          rows={6}
                          value={formData.DIVISION_MAPPING}
                          onChange={e =>
                            handleFieldChange(
                              'DIVISION_MAPPING',
                              e.target.value
                            )
                          }
                        /> */}
                        <Select
                          options={divisionOptions}
                          value={
                            divisionOptions.find(
                              option =>
                                String(option.value) ===
                                String(formData.DIVISION_MAPPING)
                            ) || null
                          }
                          onChange={option =>
                            handleFieldChange(
                              'DIVISION_MAPPING',
                              option?.value || ''
                            )
                          }
                          isSearchable
                          isClearable
                          placeholder='Select Division'
                        />
                      </div>
                    )}

                    {/* ==========================================
                      INDUCTION
                      ========================================== */}
                    {showAllTabs && activeTab === 'induction' && (
                      <div className='row'>
                        <div className='col-lg-4 mb-3'>
                          <label style={jdStyles.label}>
                            Induction
                            <span style={jdStyles.required}>*</span>
                          </label>

                          {/* <input
                            className='form-control'
                            value={formData.INDUCTION?.INDUCTION || ''}
                            onChange={e =>
                              setFormData(prev => ({
                                ...prev,
                                INDUCTION: {
                                  ...prev.INDUCTION,
                                  INDUCTION: e.target.value
                                }
                              }))
                            }
                          /> */}
                          <Select
                            options={inductionOptions}
                            value={
                              inductionOptions.find(
                                option =>
                                  String(option.value) ===
                                  String(formData.INDUCTION.INDUCTION)
                              ) || null
                            }
                            onChange={option =>
                              setFormData(prev => ({
                                ...prev,
                                INDUCTION: {
                                  ...prev.INDUCTION,
                                  INDUCTION: option?.value || ''
                                }
                              }))
                            }
                            isSearchable
                            isClearable
                            placeholder='Select Induction'
                          />
                        </div>

                        <div className='col-lg-4 mb-3'>
                          <label style={jdStyles.label}>
                            Organogram
                            <span style={jdStyles.required}>*</span>
                          </label>

                          <input
                            className='form-control'
                            value={formData.INDUCTION?.ORGANOGRAM || ''}
                            onChange={e =>
                              setFormData(prev => ({
                                ...prev,
                                INDUCTION: {
                                  ...prev.INDUCTION,
                                  ORGANOGRAM: e.target.value
                                }
                              }))
                            }
                          />
                        </div>

                        <div className='col-lg-4 mb-3'>
                          <label style={jdStyles.label}>
                            Sequence
                            <span style={jdStyles.required}>*</span>
                          </label>

                          <input
                            className='form-control'
                            value={formData.INDUCTION?.SEQUENCE || ''}
                            onChange={e =>
                              setFormData(prev => ({
                                ...prev,
                                INDUCTION: {
                                  ...prev.INDUCTION,
                                  SEQUENCE: e.target.value
                                }
                              }))
                            }
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ============================
                    ACTION BUTTONS
                    ============================ */}
                  <div className='d-flex justify-content-end mt-3'>
                    <button
                      className='btn btn-secondary me-2'
                      type='button'
                      onClick={resetForm}
                      disabled={saving}
                    >
                      Cancel
                    </button>

                    <button
                      className='btn btn-primary'
                      type='submit'
                      disabled={saving}
                    >
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default JobDescription
