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
  saveJobDescription,
  getEducationLevelList,
  getKRAList,
  getQualificationList,
  getSkillList,
  getExpertiseLevelList,
  getAllowanceList,
  getExpenseTypeList,
  getFrequencyList,
  getCTCHeadList,
  // getFormulaList
  getQuestionTemplateList,
  getQuestionGroupList,
  getDivisionList,
  getInductionList,
  getOrganogramList
} from '../../services/jobDescriptionService'
import { notifySuccess, notifyError } from '../../../../services/alertService'
import SDLtextEditor from '../../../../components/editor/SDLtextEditor'
import '../../assets/jobDescription.css'
import { MultiSelect } from 'primereact/multiselect'

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
  // ALLOWANCES: [],
  ALLOWANCES: [
    {
      listing: '',
      amount: '',
      frequency: '',
      expenseType: '',
      fromDate: null,
      toDate: ''
    }
  ],
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
  const [activeTab, setActiveTab] = useState('basic')
  const [kraList, setKraList] = useState([])
  const [qualificationList, setQualificationList] = useState([])
  const [educationLevelList, setEducationLevelList] = useState([])
  const [skillList, setSkillList] = useState([])
  const [expertiseLevelList, setExpertiseLevelList] = useState([])
  const [skillLevelList, setSkillLevelList] = useState([])
  const [allowanceList, setAllowanceList] = useState([])
  const [expenseTypeList, setExpenseTypeList] = useState([])
  const [frequencyList, setFrequencyList] = useState([])
  const [ctcHeadList, setCtcHeadList] = useState([])
  const [formulaList, setFormulaList] = useState([])
  const [questionTemplateList, setQuestionTemplateList] = useState([])
  const [questionGroupList, setQuestionGroupList] = useState([])
  const [selectedQuestionGroup, setSelectedQuestionGroup] = useState('')
  const [questionCurrentPage, setQuestionCurrentPage] = useState(1)
  const QUESTION_PAGE_SIZE = 10
  const [departmentReferenceList, setDepartmentReferenceList] = useState([])
  const [divisionList, setDivisionList] = useState([])
  const [inductionList, setInductionList] = useState([])
  const [inductionDataList, setInductionDataList] = useState([])
  const [organogramList, setOrganogramList] = useState([])

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const [
        jobsResponse,
        departmentsResponse,
        designationsResponse,
        levelsResponse,
        educationLevelResponse,
        kraResponse,
        qualificationResponse,
        skillResponse,
        expertiseResponse,
        allowanceResponse,
        expenseTypeResponse,
        frequencyResponse,
        ctcHeadResponse,
        questionTemplateResponse,
        questionGroupResponse,
        divisionResponse,
        inductionResponse,
        organogramResponse
        // formulaResponse
      ] = await Promise.all([
        getJobDescriptions(),
        getDepartmentMasterData(),
        getDesignationsMaster(),
        getMasterData('HR_ORG_LEVEL'),
        getEducationLevelList(),
        getKRAList(),
        getQualificationList(),
        getSkillList(),
        getExpertiseLevelList(),
        getAllowanceList(),
        getExpenseTypeList(),
        getFrequencyList(),
        getCTCHeadList(),
        getQuestionTemplateList(),
        getQuestionGroupList(),
        getDivisionList(),
        getInductionList(),
        getOrganogramList()
        // getFormulaList()
      ])

      console.log('INDUCTION MASTER:', inductionList)
      console.log('ORGANOGRAM MASTER:', organogramList)
      setJobData(normalizeRecords(jobsResponse))
      setDepartments(normalizeRecords(departmentsResponse))
      setDesignations(normalizeRecords(designationsResponse))
      setLevels(normalizeRecords(levelsResponse))
      setEducationLevelList(normalizeRecords(educationLevelResponse))
      setKraList(normalizeRecords(kraResponse))
      setQualificationList(normalizeRecords(qualificationResponse))
      setSkillList(normalizeRecords(skillResponse))
      setExpertiseLevelList(normalizeRecords(expertiseResponse))
      setAllowanceList(normalizeRecords(allowanceResponse))
      setExpenseTypeList(normalizeRecords(expenseTypeResponse))
      setFrequencyList(normalizeRecords(frequencyResponse))
      setCtcHeadList(normalizeRecords(ctcHeadResponse))
      setQuestionTemplateList(normalizeRecords(questionTemplateResponse))
      setQuestionGroupList(normalizeRecords(questionGroupResponse))
      setDivisionList(normalizeRecords(divisionResponse))
      setInductionList(normalizeRecords(inductionResponse))
      setOrganogramList(normalizeRecords(organogramResponse))
      // setFormulaList(normalizeRecords(formulaResponse))
    } catch (error) {
      console.error('Error loading job descriptions page data:', error)
      notifyError(error?.message || 'Unable to load job description data.')
    } finally {
      setLoading(false)
    }
  }, [])

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
          ['OLVL_DESC', 'olvl_desc', 'LVL_DESC', 'description', 'name'],
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

  const educationLevelOptions = useMemo(
    () =>
      educationLevelList.map(item => ({
        value: item.EDU_LEVEL ?? item.edu_level,
        label: item.EDU_DESC ?? item.edu_desc
      })),
    [educationLevelList]
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
      expertiseLevelList.map(item => ({
        value: item.CAPALVL_ID ?? item.capalvl_id,
        label: item.CAPALVL_DESC ?? item.capalvl_desc
      })),
    [expertiseLevelList]
  )

  const allowanceOptions = useMemo(
    () =>
      allowanceList.map(item => ({
        value: item.ALLOW_ID ?? item.allow_id,
        label: item.ALLOW_DESC ?? item.allow_desc
      })),
    [allowanceList]
  )

  const expenseTypeOptions = useMemo(
    () =>
      expenseTypeList.map(item => ({
        value: item.EXP_TYPE ?? item.exp_type,
        label: item.EXP_TYPE ?? item.exp_type
      })),
    [expenseTypeList]
  )

  const frequencyOptions = useMemo(
    () =>
      frequencyList.map(item => ({
        value: item.FREQUENCY ?? item.frequency,
        label: item.FREQUENCY ?? item.frequency
      })),
    [frequencyList]
  )

  const ctcHeadOptions = useMemo(
    () =>
      ctcHeadList.map(item => ({
        value: item.AD_ID ?? item.ad_id,
        label:
          item.DESCR ??
          item.descr ??
          `${item.AD_CODE ?? item.ad_code ?? ''} (${
            item.SH_DESCR ?? item.sh_descr ?? ''
          })`
      })),
    [ctcHeadList]
  )

  const formulaOptions = [
    { value: 'F', label: 'Fixed' },
    { value: 'C', label: '% of CTC' },
    { value: 'B', label: '% of Basic' },
    { value: 'V', label: 'Variable' }
  ]

  const questionGroupOptions = useMemo(
    () =>
      normalizeRecords(questionGroupList)
        .map(item => ({
          value: item.QGRP_ID,
          label: item.QGRP_DESC
        }))
        .filter(item => item.value && item.label),
    [questionGroupList]
  )

  const questionTemplateQuestions = useMemo(() => {
    const records = normalizeRecords(questionTemplateList)

    const grouped = new Map()

    records.forEach(item => {
      const questionId = String(item.QUESTION_ID ?? '')

      if (!questionId) return

      if (!grouped.has(questionId)) {
        grouped.set(questionId, {
          QUESTION_ID: questionId,
          QUESTION: item.QUESTION ?? '',
          RATING_TYPE: item.RATING_TYPE ?? '',
          QGRP_ID: item.QGRP_ID ?? '',
          QGRP_DESC: item.QGRP_DESC ?? '',
          QGRP_TYPE: item.QGRP_TYPE ?? '',
          QSGRP_ID: item.QSGRP_ID ?? '',
          QSGRP_DESC: item.QSGRP_DESC ?? '',
          OPTIONS: []
        })
      }

      if (item.OPTION_ID && item.OPTS_TEXT) {
        grouped.get(questionId).OPTIONS.push({
          OPTION_ID: item.OPTION_ID,
          OPTS_TEXT: item.OPTS_TEXT,
          OPTS_SEQ: item.OPTS_SEQ
        })
      }
    })

    return Array.from(grouped.values())
  }, [questionTemplateList])

  const questionOptionsMap = useMemo(() => {
    const map = {}

    normalizeRecords(questionTemplateList).forEach(item => {
      const questionId = String(item.QUESTION_ID ?? '')

      if (!questionId) return

      if (!map[questionId]) {
        map[questionId] = []
      }

      if (
        item.OPTS_TEXT !== undefined &&
        item.OPTS_TEXT !== null &&
        String(item.OPTS_TEXT).trim() !== ''
      ) {
        const optionText = String(item.OPTS_TEXT).trim()

        if (!map[questionId].includes(optionText)) {
          map[questionId].push(optionText)
        }
      }
    })

    return map
  }, [questionTemplateList])

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

  //   const organogramOptions = useMemo(
  //   () =>
  //     normalizeRecords(organogramList)
  //       .map(item => ({
  //         value: item.ORG_ID ?? item.org_id ?? '',
  //         label: item.LABEL ?? item.label ?? ''
  //       }))
  //       .filter(item => item.value && item.label),
  //   [organogramList]
  // )

  const organogramOptions = useMemo(() => {
    const divisionMap = new Map(
      divisionList.map(item => [
        String(item.DIVSN_ID ?? item.divsn_id),
        item.DIVSN_DESC ?? item.divsn_desc ?? ''
      ])
    )

    const departmentMap = new Map(
      normalizeRecords(departments).map(item => [
        String(item.DEPT_ID ?? item.dept_id ?? item.id),
        item.DEPT_DESC ?? item.dept_desc ?? item.DEPT_NAME ?? item.name ?? ''
      ])
    )

    const designationMap = new Map(
      normalizeRecords(designations).map(item => [
        String(item.DESI_ID ?? item.desi_id ?? item.DESIG_ID ?? item.id),
        item.DESI_DESC ?? item.desi_desc ?? item.DESIG_NAME ?? item.name ?? ''
      ])
    )

    return normalizeRecords(organogramList)
      .map(item => {
        const divisionName = divisionMap.get(String(item.DIVSN_ID ?? '')) || ''

        const departmentName =
          departmentMap.get(String(item.DEPT_ID ?? '')) || ''

        const designationName =
          designationMap.get(String(item.DESI_ID ?? '')) || ''

        const parts = [
          'SDL',
          divisionName,
          departmentName,
          designationName
        ].filter(Boolean)

        return {
          value: item.ORG_ID ?? item.org_id ?? '',
          label: parts.join(' - ')
        }
      })
      .filter(item => item.value && item.label)
  }, [organogramList, divisionList, departments, designations])

  const filteredQuestionTemplateQuestions = useMemo(() => {
    const questions = questionTemplateQuestions || []

    if (!selectedQuestionGroup) {
      return questions
    }

    return questions.filter(
      item => String(item.QGRP_ID) === String(selectedQuestionGroup)
    )
  }, [questionTemplateQuestions, selectedQuestionGroup])

  const questionTotalPages = Math.ceil(
    filteredQuestionTemplateQuestions.length / QUESTION_PAGE_SIZE
  )

  const paginatedQuestionTemplateQuestions = useMemo(() => {
    const startIndex = (questionCurrentPage - 1) * QUESTION_PAGE_SIZE

    return filteredQuestionTemplateQuestions.slice(
      startIndex,
      startIndex + QUESTION_PAGE_SIZE
    )
  }, [filteredQuestionTemplateQuestions, questionCurrentPage])

  useEffect(() => {
    setQuestionCurrentPage(1)
  }, [selectedQuestionGroup])

  const resetForm = () => {
    setSelectedJobId('')
    setSelectedQuestionGroup('')
    setQuestionCurrentPage(1)
    setInductionDataList([])
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

  const startEditJob = async job => {
    try {
      setLoading(true)

      // First select the job
      setSelectedJobId(job.ID)

      // Fetch complete job description details from DB
      const response = await getJobDescriptionById(job.ID)

      const selectedJob =
        response?.data?.jobDescription || response?.jobDescription || null

      if (!selectedJob) {
        notifyError('Unable to fetch job description details.')
        return
      }

      setInductionDataList(selectedJob.INDUCTION_LIST || [])

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

        EDUCATION: selectedJob.EDUCATION_LIST?.[0]
          ? {
              QUA_ID: selectedJob.EDUCATION_LIST[0].QUA_ID || '',
              COMMENTS: selectedJob.EDUCATION_LIST[0].COMMENTS || ''
            }
          : {
              ...INITIAL_FORM_DATA.EDUCATION
            },

        SKILLS: Array.isArray(selectedJob.SKILLS_LIST)
          ? selectedJob.SKILLS_LIST.map(item => ({
              code: item.CAPA_ID ?? item.capa_id ?? '',
              details: item.CAPA_DESC ?? item.capa_desc ?? '',
              level: item.CAPALVL_ID ?? item.capalvl_id ?? ''
            }))
          : [],

        ALLOWANCES: Array.isArray(selectedJob.ALLOWANCES_LIST)
          ? selectedJob.ALLOWANCES_LIST.map(item => ({
              listing: item.ALLOW_ID ?? item.allow_id ?? '',
              amount: item.ALLOW_AMOUNT ?? item.allow_amount ?? '',
              // frequency: item.EXP_TYPE ?? item.exp_type ?? '',
              frequency: item.ADD_INFO ?? item.add_info ?? '',
              expenseType: item.EXP_TYPE ?? item.exp_type ?? '',
              fromDate: item.FROMDT ? new Date(item.FROMDT) : null,
              toDate: item.TODT ? new Date(item.TODT) : null
            }))
          : [
              {
                listing: '',
                amount: '',
                frequency: '',
                expenseType: '',
                fromDate: '',
                toDate: ''
              }
            ],

        CTC_HEADS: (selectedJob.CTC_HEADS_LIST || []).map(ctc => ({
          head: ctc.AD_ID ?? '',
          formula: ctc.KEY ?? '',
          value: ctc.VAL ?? '',
          from: ctc.EFFEC_FROM ?? '',
          to: ctc.EFFEC_TO ?? ''
        })),

        KRA: Array.isArray(selectedJob.KRA_LIST)
          ? selectedJob.KRA_LIST.map(item => item.KRA_ID)
          : [],

        QUESTION_TEMPLATE: Array.isArray(selectedJob.QUESTION_TEMPLATE_LIST)
          ? selectedJob.QUESTION_TEMPLATE_LIST.map(item => ({
              ID: item.ID ?? '',
              JD_ID: item.JD_ID ?? '',
              QGRP_ID: item.QGRP_ID ?? '',
              QGRP_DESC: item.QGRP_DESC ?? '',
              QGRP_TYPE: item.QGRP_TYPE ?? '',
              QSGRP_ID: item.QSGRP_ID ?? '',
              QSGRP_DESC: item.QSGRP_DESC ?? '',
              QUESTION_ID: item.QUESTION_ID ?? '',
              QUESTION: item.QUESTION ?? '',
              RATING_TYPE: item.RATING_TYPE ?? '',
              DISP_SEQ: item.DISP_SEQ ?? '',
              EFF_FROM: item.EFF_FROM ?? '',
              EFF_TO: item.EFF_TO ?? ''
            }))
          : [],

        DEPT_REFERENCES: Array.isArray(selectedJob.DEPT_REFERENCE_LIST)
          ? selectedJob.DEPT_REFERENCE_LIST.map(item => ({
              deptId: item.DEPT_ID ?? '',
              deptName: item.DEPT_DESC ?? ''
            }))
          : [],

        // DIVISION_MAPPING: selectedJob.DIVISION_MAPPING_LIST || []
        DIVISION_MAPPING: Array.isArray(selectedJob.DIVISION_MAPPING_LIST)
          ? selectedJob.DIVISION_MAPPING_LIST.map(
              item => item.DIVSN_ID ?? item.divsn_id ?? item.value
            )
          : [],

        INDUCTION: selectedJob.INDUCTION_LIST?.[0]
          ? {
              INDUC_ID: selectedJob.INDUCTION_LIST[0].INDUC_ID || '',
              ORG_ID: selectedJob.INDUCTION_LIST[0].ORG_ID || '',
              ORG_LOC_ID: selectedJob.INDUCTION_LIST[0].ORG_LOC_ID || '',
              DISP_SEQ: selectedJob.INDUCTION_LIST[0].DISP_SEQ || ''
            }
          : {
              ...INITIAL_FORM_DATA.INDUCTION
            }
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

        JD_DOC_PATH: job.JD_DOC_PATH ?? '',

        KRA: Array.isArray(job.KRA_LIST)
          ? job.KRA_LIST.map(item => item.KRA_ID)
          : [],

        SKILLS: Array.isArray(job.SKILLS_LIST)
          ? job.SKILLS_LIST.map(item => ({
              code: item.CAPA_ID ?? item.capa_id ?? '',
              details: item.CAPA_DESC ?? item.capa_desc ?? '',
              level: item.CAPALVL_ID ?? item.capalvl_id ?? ''
            }))
          : []
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
        dept_references: JSON.stringify(formData.DEPT_REFERENCES || []),
        // division_mapping: formData.DIVISION_MAPPING,
        division_mapping: JSON.stringify(formData.DIVISION_MAPPING || []),
        induction: JSON.stringify(formData.INDUCTION || {})
      }

      console.log(
        'DEPARTMENT REFERENCES BEING SAVED:',
        formData.DEPT_REFERENCES
      )
      console.log('SAVE PAYLOAD DEPT REFERENCES:', payload.dept_references)

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
    <div className='job-description'>
      <style>
        {`
        .ck-editor__editable {
          min-height: 300px;
          max-height: 500px;
        }

        .division-multiselect {
      min-height: 50px;
    }

    .division-multiselect .p-multiselect-label {
      min-height: 50px;
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 4px;
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

                  <ul className='nav nav-tabs nav-tabs-bottom mb-3 profile-tabs'>
                    {visibleTabs.map(([key, label]) => (
                      <li className='nav-item' key={key}>
                        <button
                          type='button'
                          className={`nav-link ${
                            activeTab === key ? 'active' : ''
                          }`}
                          // onClick={() => setActiveTab(key)}
                          onClick={() => {
                            setActiveTab(key)

                            if (
                              key === 'skills' &&
                              !(formData.SKILLS || []).length
                            ) {
                              setFormData(prev => ({
                                ...prev,
                                SKILLS: [
                                  {
                                    code: '',
                                    details: '',
                                    level: ''
                                  }
                                ]
                              }))
                            }

                            if (
                              key === 'allowances' &&
                              !(formData.ALLOWANCES || []).length
                            ) {
                              setFormData(prev => ({
                                ...prev,
                                ALLOWANCES: [
                                  {
                                    listing: '',
                                    appliedLocation: ''
                                  }
                                ]
                              }))
                            }
                          }}
                        >
                          {label}
                        </button>
                      </li>
                    ))}
                  </ul>

                  {/* ============================
                    TAB CONTENT
                    ============================ */}
                  <div className='job-description-tab-content'>
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
                            // options={qualificationOptions}
                            options={educationLevelOptions}
                            value={
                              // qualificationOptions.find(
                              educationLevelOptions.find(
                                o =>
                                  String(o.value) === String(formData.MIN_QUAL)
                              ) || null
                            }
                            onChange={option =>
                              handleFieldChange('MIN_QUAL', option?.value || '')
                            }
                            isSearchable
                            isClearable
                            placeholder='Select Minimum Qualification'
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
                            // options={qualificationOptions}
                            options={educationLevelOptions}
                            value={
                              // qualificationOptions.find(
                              educationLevelOptions.find(
                                o =>
                                  String(o.value) === String(formData.MAX_QUAL)
                              ) || null
                            }
                            onChange={option =>
                              handleFieldChange('MAX_QUAL', option?.value || '')
                            }
                            isSearchable
                            isClearable
                            placeholder='Select Maximum Qualification'
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
                            rows={8}
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
                        <SDLtextEditor
                          value={formData.RESPONSIBILITIES || ''}
                          onChange={e =>
                            handleFieldChange(
                              'RESPONSIBILITIES',
                              e.target.value
                            )
                          }
                          placeholder='Enter responsibilities'
                          containerProps={{
                            style: {
                              minHeight: '300px'
                            }
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
                          <MultiSelect
                            value={formData.KRA || []}
                            options={kraOptions}
                            onChange={e => handleFieldChange('KRA', e.value)}
                            optionLabel='label'
                            optionValue='value'
                            placeholder='Select KRA(s)'
                            className='w-100'
                            display='chip'
                            filter
                            filterBy='label'
                            showClear
                            emptyMessage='No KRA available'
                            emptyFilterMessage='No KRA found'
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

                          <Select
                            options={qualificationOptions}
                            value={
                              qualificationOptions.find(
                                option =>
                                  String(option.value) ===
                                  String(formData.EDUCATION?.QUA_ID)
                              ) || null
                            }
                            onChange={option =>
                              setFormData(prev => ({
                                ...prev,
                                EDUCATION: {
                                  ...prev.EDUCATION,
                                  QUA_ID: option?.value || ''
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
                            {/* Skill */}
                            <div className='col-md-3'>
                              <Select
                                options={skillOptions}
                                value={
                                  skillOptions.find(
                                    option =>
                                      String(option.value) ===
                                      String(skill.code)
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

                            {/* Skill Details */}
                            <div className='col-md-5'>
                              <input
                                className='form-control'
                                placeholder='Skill Details'
                                value={skill.details || ''}
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

                            {/* Expertise Level */}
                            <div className='col-md-3'>
                              <Select
                                options={skillLevelOptions}
                                value={
                                  skillLevelOptions.find(
                                    option =>
                                      String(option.value) ===
                                      String(skill.level)
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

                            {/* Remove */}
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

                        <div className='d-flex justify-content-end mt-3'>
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
                      </div>
                    )}

                    {/* ==========================================
                      ALLOWANCES / REIMBURSEMENTS
                      ========================================== */}

                    {showAllTabs && activeTab === 'allowances' && (
                      <div>
                        <label style={jdStyles.label}>
                          Allowances / Reimbursements
                        </label>

                        {(formData.ALLOWANCES || []).map((item, idx) => (
                          <div className='row align-items-end mb-3' key={idx}>
                            {/* Allowance */}
                            <div className='col-lg-3 col-md-6 mb-2'>
                              <label style={jdStyles.label}>
                                Allowance
                                <span style={jdStyles.required}>*</span>
                              </label>

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

                            {/* Amount */}
                            <div className='col-lg-2 col-md-6 mb-2'>
                              <label style={jdStyles.label}>
                                Amount
                                <span style={jdStyles.required}>*</span>
                              </label>

                              <input
                                type='number'
                                className='form-control'
                                placeholder='Enter Amount'
                                value={item.amount || ''}
                                onChange={e =>
                                  updateArrayField(
                                    'ALLOWANCES',
                                    idx,
                                    'amount',
                                    e.target.value
                                  )
                                }
                              />
                            </div>

                            {/* Frequency */}
                            <div className='col-lg-3 col-md-6 mb-2'>
                              <label style={jdStyles.label}>
                                Frequency
                                <span style={jdStyles.required}>*</span>
                              </label>

                              <Select
                                options={frequencyOptions}
                                value={
                                  frequencyOptions.find(
                                    option =>
                                      String(option.value) ===
                                      String(item.frequency)
                                  ) || null
                                }
                                onChange={option =>
                                  updateArrayField(
                                    'ALLOWANCES',
                                    idx,
                                    'frequency',
                                    option?.value || ''
                                  )
                                }
                                isSearchable
                                isClearable
                                placeholder='Select Frequency'
                              />
                            </div>

                            {/* Expense Type */}
                            <div className='col-lg-3 col-md-6 mb-2'>
                              <label style={jdStyles.label}>
                                Expense Type
                                <span style={jdStyles.required}>*</span>
                              </label>

                              <Select
                                options={expenseTypeOptions}
                                value={
                                  expenseTypeOptions.find(
                                    option =>
                                      String(option.value) ===
                                      String(item.expenseType)
                                  ) || null
                                }
                                onChange={option =>
                                  updateArrayField(
                                    'ALLOWANCES',
                                    idx,
                                    'expenseType',
                                    option?.value || ''
                                  )
                                }
                                isSearchable
                                isClearable
                                placeholder='Select Expense Type'
                              />
                            </div>

                            {/* Remove */}
                            <div className='col-lg-1 col-md-6 mb-3'>
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

                            {/* From Date */}
                            <div className='col-lg-5 col-md-6 mb-2'>
                              <label style={jdStyles.label}>
                                From Date
                                <span style={jdStyles.required}>*</span>
                              </label>

                              <input
                                type='date'
                                className='form-control'
                                value={item.fromDate || ''}
                                onChange={e =>
                                  updateArrayField(
                                    'ALLOWANCES',
                                    idx,
                                    'fromDate',
                                    e.target.value
                                  )
                                }
                              />
                            </div>

                            {/* To Date */}
                            <div className='col-lg-5 col-md-6 mb-2'>
                              <label style={jdStyles.label}>
                                To Date
                                <span style={jdStyles.required}>*</span>
                              </label>

                              <input
                                type='date'
                                className='form-control'
                                value={item.toDate || ''}
                                onChange={e =>
                                  updateArrayField(
                                    'ALLOWANCES',
                                    idx,
                                    'toDate',
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                          </div>
                        ))}

                        {/* Add Row */}
                        <button
                          type='button'
                          className='btn btn-sm btn-outline-primary mt-2'
                          onClick={() =>
                            addArrayItem('ALLOWANCES', {
                              listing: '',
                              amount: '',
                              frequency: '',
                              expenseType: '',
                              fromDate: null,
                              toDate: ''
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
                          <div className='row align-items-end mb-4' key={idx}>
                            {/* CTC HEAD */}
                            <div className='col-md-3'>
                              <label style={jdStyles.label}>
                                CTC Head
                                <span style={jdStyles.required}>*</span>
                              </label>
                              <Select
                                options={ctcHeadOptions}
                                value={
                                  ctcHeadOptions.find(
                                    option =>
                                      String(option.value) === String(item.head)
                                  ) || null
                                }
                                onChange={option =>
                                  updateArrayField(
                                    'CTC_HEADS',
                                    idx,
                                    'head',
                                    option?.value || ''
                                  )
                                }
                                isSearchable
                                isClearable
                                placeholder='Select CTC Head'
                              />
                            </div>

                            {/* FORMULA */}
                            <div className='col-md-2'>
                              <label style={jdStyles.label}>
                                Formula
                                <span style={jdStyles.required}>*</span>
                              </label>
                              <Select
                                options={formulaOptions}
                                value={
                                  formulaOptions.find(
                                    option =>
                                      String(option.value) ===
                                      String(item.formula)
                                  ) || null
                                }
                                onChange={option =>
                                  updateArrayField(
                                    'CTC_HEADS',
                                    idx,
                                    'formula',
                                    option?.value || ''
                                  )
                                }
                                isSearchable
                                isClearable
                                placeholder='Select Formula'
                              />
                            </div>

                            {/* VALUE */}
                            <div className='col-md-2'>
                              <label style={jdStyles.label}>
                                Value
                                <span style={jdStyles.required}>*</span>
                              </label>
                              <input
                                type='number'
                                className='form-control'
                                placeholder='Value'
                                value={item.value || ''}
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

                            {/* EFFECTIVE FROM */}
                            <div className='col-md-2'>
                              <label style={jdStyles.label}>
                                Effective From
                                <span style={jdStyles.required}>*</span>
                              </label>
                              <input
                                type='date'
                                className='form-control'
                                value={item.from || ''}
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

                            {/* EFFECTIVE TO */}
                            <div className='col-md-2'>
                              <label style={jdStyles.label}>
                                Effective To
                                <span style={jdStyles.required}>*</span>
                              </label>
                              <input
                                type='date'
                                className='form-control'
                                value={item.to || ''}
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

                            {/* REMOVE */}
                            <div className='col-md-1'>
                              <button
                                type='button'
                                className='btn btn-sm btn-danger'
                                onClick={() =>
                                  removeArrayItem('CTC_HEADS', idx)
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
                            addArrayItem('CTC_HEADS', {
                              head: '',
                              formula: '',
                              value: '',
                              from: '',
                              to: ''
                            })
                          }
                        >
                          Add CTC Head
                        </button>
                      </div>
                    )}

                    {/* ==========================================
                        QUESTION TEMPLATE
                        ========================================== */}
                    {showAllTabs && activeTab === 'questions' && (
                      <div>
                        <div className='row align-items-end mb-3'>
                          {/* QUESTION GROUP */}
                          <div className='col-lg-4 col-md-6'>
                            <label style={jdStyles.label}>Question Group</label>

                            <Select
                              options={questionGroupOptions}
                              value={
                                questionGroupOptions.find(
                                  option =>
                                    String(option.value) ===
                                    String(selectedQuestionGroup)
                                ) || null
                              }
                              onChange={option => {
                                setSelectedQuestionGroup(option?.value || '')
                                setQuestionCurrentPage(1)
                              }}
                              isSearchable
                              isClearable
                              placeholder='Select Question Group'
                            />
                          </div>
                        </div>

                        {/* QUESTIONS TABLE */}
                        <div className='table-responsive'>
                          <table className='table table-bordered table-hover'>
                            <thead className='table-light'>
                              <tr>
                                <th style={{ width: '50px' }}></th>
                                <th style={{ width: '15%' }}>Group</th>
                                <th>Question</th>
                                <th style={{ width: '25%' }}>Options</th>
                                <th style={{ width: '100px' }}>Sequence</th>
                                <th style={{ width: '100px' }}>Sequence</th>
                              </tr>
                            </thead>

                            <tbody>
                              {paginatedQuestionTemplateQuestions.length > 0 ? (
                                paginatedQuestionTemplateQuestions.map(
                                  (question, idx) => {
                                    const questionId =
                                      question.QUESTION_ID ??
                                      question.question_id ??
                                      question.ID ??
                                      question.id

                                    const groupId =
                                      question.QGRP_ID ?? question.qgrp_id ?? ''

                                    const subGroupId =
                                      question.QSGRP_ID ??
                                      question.qsgrp_id ??
                                      ''

                                    const groupName =
                                      question.QGRP_DESC ??
                                      question.qgrp_desc ??
                                      ''

                                    const subGroupName =
                                      question.QSGRP_DESC ??
                                      question.qsgrp_desc ??
                                      ''

                                    const questionText =
                                      question.QUESTION ??
                                      question.question ??
                                      question.QUES_DESCR ??
                                      ''

                                    const existingQuestion = (
                                      formData.QUESTION_TEMPLATE || []
                                    ).find(
                                      item =>
                                        String(
                                          item.QUESTION_ID ??
                                            item.question_id ??
                                            item.questionId
                                        ) === String(questionId)
                                    )

                                    return (
                                      <tr
                                        key={`${groupId}-${subGroupId}-${questionId}`}
                                      >
                                        {/* CHECKBOX */}
                                        <td className='text-center'>
                                          <input
                                            type='checkbox'
                                            checked={Boolean(existingQuestion)}
                                            onChange={e => {
                                              if (e.target.checked) {
                                                addArrayItem(
                                                  'QUESTION_TEMPLATE',
                                                  {
                                                    QGRP_ID: groupId,
                                                    QGRP_TYPE:
                                                      question.QGRP_TYPE ??
                                                      question.qgrp_type ??
                                                      '',
                                                    QSGRP_ID: subGroupId,
                                                    QUESTION_ID: questionId,
                                                    DISP_SEQ:
                                                      question.DISP_SEQ ??
                                                      question.disp_seq ??
                                                      ''
                                                  }
                                                )
                                              } else {
                                                setFormData(prev => ({
                                                  ...prev,
                                                  QUESTION_TEMPLATE: (
                                                    prev.QUESTION_TEMPLATE || []
                                                  ).filter(
                                                    item =>
                                                      String(
                                                        item.QUESTION_ID ??
                                                          item.question_id ??
                                                          item.questionId
                                                      ) !== String(questionId)
                                                  )
                                                }))
                                              }
                                            }}
                                          />
                                        </td>

                                        {/* GROUP */}

                                        <td>{subGroupName || '-'}</td>

                                        {/* QUESTION */}
                                        <td>{questionText || '-'}</td>

                                        {/* OPTIONS */}
                                        {/* <td>
                                          {question.OPTIONS?.length > 0
                                            ? question.OPTIONS.map(
                                                option => option.OPTS_TEXT
                                              ).join(', ')
                                            : '-'}
                                        </td> */}

                                        {/* OPTIONS */}
                                        <td>
                                          {question.OPTIONS?.length > 0
                                            ? question.OPTIONS.map(
                                                option => option.OPTS_TEXT
                                              ).join(',')
                                            : '-'}
                                        </td>

                                        {/* SEQUENCE */}
                                        <td>
                                          {existingQuestion?.DISP_SEQ ??
                                            question.DISP_SEQ ??
                                            '-'}
                                        </td>
                                      </tr>
                                    )
                                  }
                                )
                              ) : (
                                <tr>
                                  <td colSpan='6' className='text-center'>
                                    No questions found
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>

                        {/* PAGINATION */}
                        {questionTotalPages > 1 && (
                          <div className='d-flex justify-content-between align-items-center mt-3'>
                            <div className='text-muted small'>
                              Showing{' '}
                              {(questionCurrentPage - 1) * QUESTION_PAGE_SIZE +
                                1}
                              {' - '}
                              {Math.min(
                                questionCurrentPage * QUESTION_PAGE_SIZE,
                                filteredQuestionTemplateQuestions.length
                              )}{' '}
                              of {filteredQuestionTemplateQuestions.length}{' '}
                              questions
                            </div>

                            <nav>
                              <ul className='pagination mb-0'>
                                {/* PREVIOUS */}
                                <li
                                  className={`page-item ${
                                    questionCurrentPage === 1 ? 'disabled' : ''
                                  }`}
                                >
                                  <button
                                    type='button'
                                    className='page-link'
                                    disabled={questionCurrentPage === 1}
                                    onClick={() =>
                                      setQuestionCurrentPage(prev =>
                                        Math.max(prev - 1, 1)
                                      )
                                    }
                                  >
                                    Previous
                                  </button>
                                </li>

                                {/* PAGE NUMBERS */}
                                {Array.from(
                                  { length: questionTotalPages },
                                  (_, index) => index + 1
                                ).map(page => (
                                  <li
                                    key={page}
                                    className={`page-item ${
                                      questionCurrentPage === page
                                        ? 'active'
                                        : ''
                                    }`}
                                  >
                                    <button
                                      type='button'
                                      className='page-link'
                                      onClick={() =>
                                        setQuestionCurrentPage(page)
                                      }
                                    >
                                      {page}
                                    </button>
                                  </li>
                                ))}

                                {/* NEXT */}
                                <li
                                  className={`page-item ${
                                    questionCurrentPage === questionTotalPages
                                      ? 'disabled'
                                      : ''
                                  }`}
                                >
                                  <button
                                    type='button'
                                    className='page-link'
                                    disabled={
                                      questionCurrentPage === questionTotalPages
                                    }
                                    onClick={() =>
                                      setQuestionCurrentPage(prev =>
                                        Math.min(prev + 1, questionTotalPages)
                                      )
                                    }
                                  >
                                    Next
                                  </button>
                                </li>
                              </ul>
                            </nav>
                          </div>
                        )}
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

                        <div className='row'>
                          {departmentOptions.map(dept => {
                            //         console.log('departmentOptions:', departmentOptions)
                            // console.log('DEPT_REFERENCES:', formData.DEPT_REFERENCES)
                            const isChecked = (
                              formData.DEPT_REFERENCES || []
                            ).some(
                              item => String(item.deptId) === String(dept.value)
                            )

                            return (
                              <div className='col-md-3 mb-2' key={dept.value}>
                                <div className='form-check'>
                                  <input
                                    type='checkbox'
                                    className='form-check-input'
                                    id={`dept-${dept.value}`}
                                    checked={isChecked}
                                    onChange={e => {
                                      if (e.target.checked) {
                                        setFormData(prev => ({
                                          ...prev,
                                          DEPT_REFERENCES: [
                                            ...(prev.DEPT_REFERENCES || []),
                                            {
                                              deptId: dept.value,
                                              deptName: dept.label
                                            }
                                          ]
                                        }))
                                      } else {
                                        setFormData(prev => ({
                                          ...prev,
                                          DEPT_REFERENCES: (
                                            prev.DEPT_REFERENCES || []
                                          ).filter(
                                            item =>
                                              String(item.deptId) !==
                                              String(dept.value)
                                          )
                                        }))
                                      }
                                    }}
                                  />

                                  <label
                                    className='form-check-label'
                                    htmlFor={`dept-${dept.value}`}
                                  >
                                    {dept.label}
                                  </label>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* ==========================================
                      DIVISION MAPPING
                      ========================================== */}
                    {showAllTabs && activeTab === 'division' && (
                      <div>
                        <label style={jdStyles.label}>Division Mapping</label>
                        <MultiSelect
                          value={formData.DIVISION_MAPPING || []}
                          options={divisionOptions}
                          onChange={e =>
                            handleFieldChange('DIVISION_MAPPING', e.value)
                          }
                          optionLabel='label'
                          optionValue='value'
                          placeholder='Select Division(s)'
                          className='w-100 division-multiselect'
                          display='chip'
                          filter
                          filterBy='label'
                          showClear
                          emptyMessage='No divisions available'
                          emptyFilterMessage='No divisions found'
                        />
                      </div>
                    )}

                    {/* ==========================================
                      INDUCTION
                      ========================================== */}
                    {showAllTabs && activeTab === 'induction' && (
                      <div>
                        {/* JD LABEL */}
                        <div className='mb-4'>
                          <strong>JD Label: </strong>
                          {formData.SH_DESC || '-'}
                        </div>

                        <div className='row'>
                          {/* INDUCTION */}
                          <div className='col-lg-4 mb-3'>
                            <label style={jdStyles.label}>
                              Induction
                              {/* <span style={jdStyles.required}>*</span> */}
                            </label>

                            <Select
                              options={inductionOptions}
                              value={
                                inductionOptions.find(
                                  option =>
                                    String(option.value) ===
                                    String(formData.INDUCTION?.INDUC_ID)
                                ) || null
                              }
                              onChange={option =>
                                setFormData(prev => ({
                                  ...prev,
                                  INDUCTION: {
                                    ...prev.INDUCTION,
                                    INDUC_ID: option?.value || ''
                                  }
                                }))
                              }
                              isSearchable
                              isClearable
                              placeholder='Select Induction'
                            />
                          </div>

                          {/* ORGANOGRAM */}
                          <div className='col-lg-4 mb-3'>
                            <label style={jdStyles.label}>
                              Organogram
                              <span style={jdStyles.required}>*</span>
                            </label>

                            <Select
                              options={organogramOptions}
                              value={
                                organogramOptions.find(
                                  option =>
                                    String(option.value) ===
                                    String(formData.INDUCTION?.ORG_ID)
                                ) || null
                              }
                              onChange={option =>
                                setFormData(prev => ({
                                  ...prev,
                                  INDUCTION: {
                                    ...prev.INDUCTION,
                                    ORG_ID: option?.value || ''
                                  }
                                }))
                              }
                              isSearchable
                              isClearable
                              placeholder='Select Organogram'
                            />
                          </div>

                          {/* SEQUENCE */}
                          <div className='col-lg-4 mb-3'>
                            <label style={jdStyles.label}>
                              Sequence
                              <span style={jdStyles.required}>*</span>
                            </label>

                            <input
                              type='number'
                              className='form-control'
                              value={formData.INDUCTION?.DISP_SEQ || ''}
                              onChange={e =>
                                setFormData(prev => ({
                                  ...prev,
                                  INDUCTION: {
                                    ...prev.INDUCTION,
                                    DISP_SEQ: e.target.value
                                  }
                                }))
                              }
                            />
                          </div>
                        </div>

                        {/* INDUCTION TABLE */}
                        <div className='table-responsive mt-4'>
                          <table className='table table-bordered table-hover'>
                            <thead>
                              <tr>
                                <th>Induction</th>
                                <th>Organogram</th>
                                <th>Sequence</th>
                                <th>Delete</th>
                              </tr>
                            </thead>

                            <tbody>
                              {inductionDataList.length > 0 ? (
                                inductionDataList.map((item, index) => (
                                  <tr key={item.ID ?? index}>
                                    <td>
                                      {item.INDUC_DESC ||
                                        inductionOptions.find(
                                          option =>
                                            String(option.value) ===
                                            String(item.INDUC_ID)
                                        )?.label ||
                                        '-'}
                                    </td>

                                    <td>
                                      {item.ORG_LABEL ||
                                        organogramOptions.find(
                                          option =>
                                            String(option.value) ===
                                            String(item.ORG_ID)
                                        )?.label ||
                                        '-'}
                                    </td>

                                    <td>{item.DISP_SEQ || '-'}</td>

                                    <td>
                                      <button
                                        type='button'
                                        className='btn btn-sm btn-danger'
                                        onClick={() => {
                                          // Delete handling can be added with the backend
                                          // delete API when we implement it.
                                        }}
                                      >
                                        Delete
                                      </button>
                                    </td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan='4' className='text-center'>
                                    No data found
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ============================
                    ACTION BUTTONS
                    ============================ */}
                  <div className='d-flex justify-content-end mt-3'>
                    <button
                      className='btn btn-primary me-2'
                      type='submit'
                      disabled={saving}
                    >
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      className='btn btn-secondary'
                      type='button'
                      onClick={resetForm}
                      disabled={saving}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default JobDescription
