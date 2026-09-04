import { useState, useMemo, useEffect, useRef } from 'react'

import SDLDataTable from '../components/datatable/SDLDataTable'
import SDLSearch from '../components/datatable/SDLSearch'

import { STOREIMAGES } from '../assets/assets'
import {
  getProfile,
  uploadProfileImage,
  saveFamilyMember,
  deleteFamilyMember,
  saveBankDetails,
  sendPersonalDetailsOtp,
  verifyPersonalDetailsOtp
} from '../services/profileService'

import {
  notifySuccess,
  notifyError,
  notifyWarning,
  confirmAction
} from '../services/alertService'

import {
  PROFILE_MESSAGES,
  FAMILY_RELATIONS,
  FAMILY_DEPENDENT
} from '../constants/profileMessages'

const MyProfile = () => {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const [searchQuery, setSearchQuery] = useState('')

  /* ================= FAMILY FLAGS ================= */
  // hide add/edit/delete buttons
  const canManageFamily = profile?.permissions?.can_manage_family || false

  const [showFamilyForm, setShowFamilyForm] = useState(false)
  const [editingMember, setEditingMember] = useState(null)

  const [familyForm, setFamilyForm] = useState({
    id: '',
    name: '',
    relation: '',
    dependent: '',
    dob: '',
    occupation: '',
    aadhaar: ''
  })

  const [personalErrors, setPersonalErrors] = useState({
    cell: '',
    per_email: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    m_status: '',
    blood_grp: '',
    address_proof: ''
  })

  /* ================= BANK DETAILS ================= */

  const [showBankForm, setShowBankForm] = useState(false)
  const [bankSaving, setBankSaving] = useState(false)

  const [bankForm, setBankForm] = useState({
    bank_name: '',
    bank_branch: '',
    bank_ifsc: '',
    bank_acno: '',
    bank_nominee: ''
  })

  const [originalBankForm, setOriginalBankForm] = useState({
    bank_name: '',
    bank_branch: '',
    bank_ifsc: '',
    bank_acno: '',
    bank_nominee: ''
  })
  
  /* =========================================================
   PERSONAL DETAILS UPDATE
   ========================================================= */

const [showPersonalForm, setShowPersonalForm] = useState(false)
const [showPersonalOtp, setShowPersonalOtp] = useState(false)

const [personalSaving, setPersonalSaving] = useState(false)
const [personalOtpVerifying, setPersonalOtpVerifying] = useState(false)

const [personalOtp, setPersonalOtp] = useState([
  '',
  '',
  '',
  '',
  '',
  ''
])

const personalOtpRefs = useRef([])

const [personalForm, setPersonalForm] = useState({
  cell: '',
  per_email: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
  m_status: '',
  blood_grp: '',
  address_proof: null
})

const [originalPersonalForm, setOriginalPersonalForm] = useState({
  cell: '',
  per_email: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
  m_status: '',
  blood_grp: ''
})

  /* ================= LOAD PROFILE ================= */

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await getProfile()

        if (res?.status) {
          const data = res.data || {}
          const emp = data.employee || {}

          setProfile({
            ...data,
            employee: {
              ...emp,
              profile_image:
                typeof emp.PROFILE_IMAGE === 'string'
                  ? emp.PROFILE_IMAGE
                  : emp.PROFILE_IMAGE?.image || null
            }
          })
        } else {
          notifyError(res?.message || 'Unable to load profile.')
        }
      } catch (err) {
        console.error(err)
        notifyError('Unable to load profile.')
      } finally {
        setLoading(false)
      }
    }

    /* ================= INITIAL LOAD ================= */
    loadProfile()

    /* ================= AUTO REFRESH FLAG ================= */
    const interval = setInterval(() => {
      loadProfile()
    }, 30000) // every 30 seconds

    /* ================= CLEANUP ================= */
    return () => clearInterval(interval)
  }, [])

  /* ================= HELPERS ================= */

  const formatDOB = dob => {
    if (!dob) return ''

    const [day, mon, year] = dob.split('-')
    const monthIndex = new Date(`${mon} 1, 2000`).getMonth()
    const date = new Date(year, monthIndex, day)

    const weekday = date.toLocaleDateString('en-IN', { weekday: 'long' })
    const month = date.toLocaleDateString('en-IN', { month: 'long' })

    const getOrdinal = d => {
      if (d > 3 && d < 21) return 'th'
      switch (d % 10) {
        case 1:
          return 'st'
        case 2:
          return 'nd'
        case 3:
          return 'rd'
        default:
          return 'th'
      }
    }

    return `${weekday}, ${day}${getOrdinal(Number(day))} ${month} ${year}`
  }

  const getMaritalStatus = m => (Number(m) === 1 ? 'Married' : 'Single')
  const getGender = g => (Number(g) === 1 ? 'Male' : 'Female')

  const getFullName = emp =>
    `${emp?.FNAME || ''} ${emp?.MNAME || ''} ${emp?.LNAME || ''}`
      .replace(/\s+/g, ' ')
      .trim()

  /* ================= SAFE DATA ================= */
  const emp = profile?.employee || {}
  const spouse = profile?.spouse || {}
  const children = profile?.children || []
  const mother = profile?.mother || {}
  const father = profile?.father || {}

  /* ================= MEMO HOOKS (ALWAYS RUN) ================= */

  const familyData = useMemo(() => {
    let list = []

    const pushMember = (member, defaultRelation = '') => {
      if (member?.FM_NAME) {
        list.push({
          id: member.ID,
          name: member.FM_NAME,
          relation: member.FM_RELATION || defaultRelation,
          age: member.AGE || '',
          dob: member.DOB || '',
          dependent: member.FM_DEP || '',
          occupation: member.OCCUPATION || member.FM_OCCUPATION || '',
          aadhaar: member.AADHAAR || ''
        })
      }
    }

    // spouse
    pushMember(spouse, 'Spouse')

    // mother
    pushMember(mother, 'Mother')

    // father
    pushMember(father, 'Father')

    // children
    children.forEach(child => {
      pushMember(child, 'Child')
    })

    return list
  }, [spouse, mother, father, children])

  const filteredFamilyData = useMemo(() => {
    return familyData.filter(item => {
      const q = searchQuery.toLowerCase()

      const matchesSearch =
        !searchQuery ||
        item.name?.toLowerCase().includes(q) ||
        item.relation?.toLowerCase().includes(q) ||
        String(item.age || '').includes(q) ||
        item.dob?.toLowerCase().includes(q)

      return matchesSearch
    })
  }, [familyData, searchQuery])

  /* ================= FAMILY ACTIONS ================= */
  const handleAddFamily = () => {
    if (!canManageFamily) {
      notifyWarning(PROFILE_MESSAGES.FAMILY_UPDATE_CLOSED)
      return
    }

    setEditingMember(null)
    setFamilyForm({
      id: '',
      name: '',
      relation: FAMILY_RELATIONS.WIFE,
      dependent: FAMILY_DEPENDENT.DEPENDANT,
      dob: '',
      occupation: '',
      aadhaar: ''
    })
    setShowFamilyForm(true)
  }

  const handleEditFamily = row => {
    if (!canManageFamily) {
      notifyWarning(PROFILE_MESSAGES.FAMILY_UPDATE_CLOSED)
      return
    }

    let formattedDOB = ''

    if (row.dob) {
      const parsedDate = new Date(row.dob)

      if (!isNaN(parsedDate)) {
        const year = parsedDate.getFullYear()
        const month = String(parsedDate.getMonth() + 1).padStart(2, '0')
        const day = String(parsedDate.getDate()).padStart(2, '0')

        formattedDOB = `${year}-${month}-${day}`
      }
    }

    setEditingMember(row)
    setFamilyForm({
      id: row.id,
      name: row.name || '',
      relation: row.relation || '',
      dependent: row.dependent || 'Dependant',
      dob: formattedDOB,
      occupation: row.occupation || '',
      aadhaar: row.aadhaar || ''
    })
    setShowFamilyForm(true)
  }

  const handleDeleteFamily = async row => {
    if (!canManageFamily) {
      notifyWarning(PROFILE_MESSAGES.FAMILY_UPDATE_CLOSED)
      return
    }

    const result = await confirmAction(
      PROFILE_MESSAGES.DELETE_FAMILY_TITLE,
      PROFILE_MESSAGES.DELETE_FAMILY_MESSAGE(row.name)
    )

    if (!result.isConfirmed) {
      return;
    }

    try {
      const res = await deleteFamilyMember({
        id: row.id
      })

      if (res?.status) {
        let updatedChildren = [...children]
        let updatedSpouse = { ...spouse }
        let updatedMother = { ...mother }
        let updatedFather = { ...father }

        /* ================= REMOVE MEMBER ================= */

        if (
          [FAMILY_RELATIONS.WIFE, FAMILY_RELATIONS.HUSBAND].includes(
            row.relation
          )
        ) {
          updatedSpouse = {}
        } else if (row.relation === FAMILY_RELATIONS.MOTHER) {
          updatedMother = {}
        } else if (row.relation === FAMILY_RELATIONS.FATHER) {
          updatedFather = {}
        } else {
          updatedChildren = children.filter(
            item => String(item.ID) !== String(row.id)
          )
        }

        /* ================= UPDATE PROFILE ================= */

        setProfile(prev => ({
          ...prev,
          spouse: updatedSpouse,
          mother: updatedMother,
          father: updatedFather,
          children: updatedChildren
        }))

        notifySuccess(PROFILE_MESSAGES.FAMILY_DELETED)
      } else {
        notifyError(res?.message || PROFILE_MESSAGES.FAMILY_DELETE_FAILED)
      }
    } catch (error) {
      console.error(error)
      notifyError(PROFILE_MESSAGES.FAMILY_DELETE_ERROR)
    }
  }

  const handleFamilyInputChange = e => {
    const { name, value } = e.target

    setFamilyForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  /* ================= CALCULATE AGE ================= */
  const calculateAge = dob => {
    if (!dob) return ''

    const birthDate = new Date(dob)

    if (isNaN(birthDate)) return ''

    const today = new Date()

    let age = today.getFullYear() - birthDate.getFullYear()

    const monthDiff = today.getMonth() - birthDate.getMonth()

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--
    }

    return age
  }

  const handleSaveFamily = async () => {
    if (!canManageFamily) {
      notifyWarning(PROFILE_MESSAGES.FAMILY_UPDATE_CLOSED)
      return
    }

    if (!familyForm.name || !familyForm.relation) {
      notifyError(PROFILE_MESSAGES.FAMILY_REQUIRED_FIELDS)
      return
    }

    /* ================= AADHAAR VALIDATION ================= */

    const aadhaar = familyForm.aadhaar?.trim()
    if (aadhaar) {
      // only digits allowed
      if (!/^\d+$/.test(aadhaar)) {
        notifyError(PROFILE_MESSAGES.AADHAAR_DIGITS_ONLY)
        return
      }

      // must be 12 digits
      if (aadhaar.length !== 12) {
        notifyError(PROFILE_MESSAGES.AADHAAR_LENGTH)
        return
      }

      // should not start with 0 or 1
      if (/^[01]/.test(aadhaar)) {
        notifyError(PROFILE_MESSAGES.AADHAAR_INVALID)
        return
      }
    }

    /* ================= DUPLICATE VALIDATION ================= */

    const isDuplicate = familyData.some(member => {
      // ignore current row while editing
      if (editingMember && String(member.id) === String(familyForm.id)) {
        return false
      }

      return (
        member.name?.trim().toLowerCase() ===
          familyForm.name?.trim().toLowerCase() &&
        member.relation?.trim().toLowerCase() ===
          familyForm.relation?.trim().toLowerCase()
      )
    })

    if (isDuplicate) {
      notifyError(PROFILE_MESSAGES.DUPLICATE_FAMILY)
      return
    }

    /* ================= DOB formatting ================= */

    let formattedDOB = familyForm.dob

    if (familyForm.dob) {
      const date = new Date(familyForm.dob)

      if (!isNaN(date)) {
        const day = String(date.getDate()).padStart(2, '0')
        const month = date.toLocaleString('en-IN', {
          month: 'short'
        })
        const year = date.getFullYear()

        formattedDOB = `${day}-${month}-${year}`
      }
    }

    const payload = {
      id: editingMember ? familyForm.id : null,
      name: familyForm.name,
      relation: familyForm.relation,
      dependent: familyForm.dependent || 'Dependant',
      dob: formattedDOB,
      occupation: familyForm.occupation,
      aadhaar: familyForm.aadhaar
    }

    //console.log("SAVE PAYLOAD:", payload);

    try {
      const res = await saveFamilyMember(payload)

      //console.log("SAVE RESPONSE:", res);

      if (res?.status) {
        let updatedChildren = [...children]
        let updatedSpouse = { ...spouse }
        let updatedMother = { ...mother }
        let updatedFather = { ...father }

        const updatedMemberData = {
          ID: familyForm.id || Date.now(),
          FM_NAME: familyForm.name,
          FM_RELATION: familyForm.relation,
          FM_DEP: familyForm.dependent || 'Dependant',
          DOB: formattedDOB,
          OCCUPATION: familyForm.occupation,
          AADHAAR: familyForm.aadhaar,
          AGE: calculateAge(familyForm.dob)
        }

        /* ================= UPDATE ================= */
        if (editingMember) {
          if (String(spouse?.ID) === String(familyForm.id)) {
            updatedSpouse = {
              ...updatedSpouse,
              ...updatedMemberData
            }
          } else if (String(mother?.ID) === String(familyForm.id)) {
            updatedMother = {
              ...updatedMother,
              ...updatedMemberData
            }
          } else if (String(father?.ID) === String(familyForm.id)) {
            updatedFather = {
              ...updatedFather,
              ...updatedMemberData
            }
          } else {
            updatedChildren = updatedChildren.map(item =>
              String(item.ID) === String(familyForm.id)
                ? {
                    ...item,
                    ...updatedMemberData
                  }
                : item
            )
          }
        } else {
          /* ================= INSERT ================= */
          if (['Wife', 'Husband'].includes(familyForm.relation)) {
            updatedSpouse = updatedMemberData
          } else if (familyForm.relation === 'Mother') {
            updatedMother = updatedMemberData
          } else if (familyForm.relation === 'Father') {
            updatedFather = updatedMemberData
          } else {
            updatedChildren.push(updatedMemberData)
          }
        }

        setProfile(prev => ({
          ...prev,
          spouse: updatedSpouse,
          mother: updatedMother,
          father: updatedFather,
          children: updatedChildren
        }))

        setShowFamilyForm(false)
        setEditingMember(null)

        notifySuccess(
          editingMember
            ? PROFILE_MESSAGES.FAMILY_UPDATED
            : PROFILE_MESSAGES.FAMILY_ADDED
        )
      } else {
        notifyError(res?.message || PROFILE_MESSAGES.FAMILY_SAVE_FAILED)
      }
    } catch (error) {
      console.error(error)
      notifyError(PROFILE_MESSAGES.FAMILY_SAVE_ERROR)
    }
  }
  /* ================= image upload ================= */

  const fileInputRef = useRef(null)

  const handleImageClick = () => {
    fileInputRef.current.click()
  }

  /*const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("profile_image", file);

        const res = await uploadProfileImage(formData);

        if (res?.status) {
            setProfile(prev => ({
                ...prev,
                employee: {
                    ...prev.employee,
                    profile_image: res.image // must be FULL URL from backend
                }
            }));

             // HEADER / GLOBAL USER
            setUser(prev => ({
                ...prev,
                profile_image: res.image
            }));
        }
    };*/

  const handleImageUpload = async e => {
    const file = e.target.files[0]
    if (!file) return

    const formData = new FormData()
    formData.append('profile_image', file)

    const res = await uploadProfileImage(formData)

    if (res?.status) {
      const updatedImage = res?.data?.image || ''

      // PROFILE PAGE
      setProfile(prev => ({
        ...prev,
        employee: {
          ...prev.employee,
          profile_image: updatedImage
        }
      }))

      // HEADER / GLOBAL USER
      setUser(prev => ({
        ...prev,
        profile_image: updatedImage
      }))

      notifySuccess('Profile image updated successfully')
    }
  }

  const DEFAULT_PROFILE_IMAGE = STOREIMAGES.PROFILE.AVATAR_1
  const [imgSrc, setImgSrc] = useState(DEFAULT_PROFILE_IMAGE)

  useEffect(() => {
    if (emp?.profile_image && typeof emp.profile_image === 'string') {
      setImgSrc(emp.profile_image)
    } else {
      setImgSrc(DEFAULT_PROFILE_IMAGE)
    }
  }, [emp?.profile_image])

  /* ================= CONDITIONAL RENDER (AFTER HOOKS) ================= */

  if (loading) return <div>{PROFILE_MESSAGES.LOADING_PROFILE}</div>
  if (!profile || !profile.employee)
    return <div>{PROFILE_MESSAGES.NO_PROFILE_DATA}</div>

  const actionBody = rowData => (
    <div className='d-flex align-items-center gap-3'>
      <a
        href='#'
        title={PROFILE_MESSAGES.EDIT_FAMILY_TITLE}
        className='text-primary'
        style={{ fontSize: '20px' }}
        onClick={e => {
          e.preventDefault()
          handleEditFamily(rowData)
        }}
      >
        <button type='button' className='btn btn-icon btn-sm btn-primary'>
          <i className='ti ti-edit'></i>
        </button>
      </a>

      <a
        href='#'
        title={PROFILE_MESSAGES.DELETE_FAMILY_TOOLTIP}
        className='text-danger'
        style={{ fontSize: '20px' }}
        onClick={e => {
          e.preventDefault()
          handleDeleteFamily(rowData)
        }}
      >
        <button type='button' className='btn btn-icon btn-sm btn-primary'>
          <i className='ti ti-trash'></i>
        </button>
      </a>
    </div>
  )

  const familyColumns = [
    {
      field: 'name',
      header: 'Name',
      sortable: true
    },
    {
      field: 'relation',
      header: 'Relation',
      sortable: true
    },
    {
      field: 'age',
      header: 'Age',
      sortable: true
    },
    {
      field: 'dob',
      header: 'DOB',
      sortable: true
    },
    {
      field: 'aadhaar',
      header: 'Aadhaar',
      sortable: true
    },
    {
      field: 'dependent',
      header: 'Dependent',
      sortable: true
    },
    ...(canManageFamily
      ? [
          {
            header: 'Actions',
            body: actionBody,
            exportable: false,
            style: {
              width: '120px',
              textAlign: 'center'
            }
          }
        ]
      : [])
  ]
  /* ================= RENDER ================= */


/* ================= BANK DETAILS ACTIONS ================= */

const normalizeBankValue = value => {
  return String(value ?? '')
    .trim()
    .replace(/\s+/g, ' ')
}

const normalizeBankName = value => {
  return normalizeBankValue(value).toUpperCase()
}

const normalizeBankBranch = value => {
  return normalizeBankValue(value).toUpperCase()
}

const normalizeBankIfsc = value => {
  return String(value ?? '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
}

const normalizeBankAccount = value => {
  return String(value ?? '')
    .trim()
    .replace(/\D/g, '')
}

const normalizeBankNominee = value => {
  return normalizeBankValue(value)
}


const handleEditBank = () => {

  const currentBank = {
    bank_name: normalizeBankName(emp?.BANK_NAME),
    bank_branch: normalizeBankBranch(emp?.AC_BRANCH_NAME),
    bank_ifsc: normalizeBankIfsc(emp?.AC_IFSC_NO),
    bank_acno: normalizeBankAccount(emp?.BANK_ACCT),
    bank_nominee: normalizeBankNominee(emp?.BANK_NOMINEE)
  }

  setBankForm(currentBank)

  setOriginalBankForm(currentBank)

  setShowBankForm(true)
}

const handleBankInputChange = e => {

  const { name, value } = e.target

  setBankForm(prev => ({
    ...prev,
    [name]: value
  }))
}

const handleSaveBank = async () => {

  /* ==========================================================
     NORMALIZE FORM VALUES
     ========================================================== */

  const currentBank = {
    bank_name: normalizeBankName(bankForm.bank_name),
    bank_branch: normalizeBankBranch(bankForm.bank_branch),
    bank_ifsc: normalizeBankIfsc(bankForm.bank_ifsc),
    bank_acno: normalizeBankAccount(bankForm.bank_acno),
    bank_nominee: normalizeBankNominee(bankForm.bank_nominee)
  }


  /* ==========================================================
     REQUIRED VALIDATION
     ========================================================== */

  if (!currentBank.bank_name) {
    notifyError('Please enter Bank Name.')
    return
  }


  if (!currentBank.bank_branch) {
    notifyError('Please enter Bank Branch.')
    return
  }


  if (!currentBank.bank_ifsc) {
    notifyError('Please enter IFSC.')
    return
  }


  if (!currentBank.bank_acno) {
    notifyError('Please enter Account Number.')
    return
  }


  /* ==========================================================
     IFSC VALIDATION
     ========================================================== */

  if (!/^[A-Z0-9]+$/.test(currentBank.bank_ifsc)) {

    notifyError(
      'Please enter a valid IFSC.'
    )

    return
  }


  /* ==========================================================
     ACCOUNT NUMBER VALIDATION
     ========================================================== */

  if (!/^\d+$/.test(currentBank.bank_acno)) {

    notifyError(
      'Account Number should contain digits only.'
    )

    return
  }


  /* ==========================================================
     CHECK CHANGES ON CLIENT
     ========================================================== */

  const originalBank = {
    bank_name: normalizeBankName(
      originalBankForm.bank_name
    ),

    bank_branch: normalizeBankBranch(
      originalBankForm.bank_branch
    ),

    bank_ifsc: normalizeBankIfsc(
      originalBankForm.bank_ifsc
    ),

    bank_acno: normalizeBankAccount(
      originalBankForm.bank_acno
    ),

    bank_nominee: normalizeBankNominee(
      originalBankForm.bank_nominee
    )
  }


  const hasChanges =
    currentBank.bank_name !== originalBank.bank_name ||
    currentBank.bank_branch !== originalBank.bank_branch ||
    currentBank.bank_ifsc !== originalBank.bank_ifsc ||
    currentBank.bank_acno !== originalBank.bank_acno ||
    currentBank.bank_nominee !== originalBank.bank_nominee


  if (!hasChanges) {

    notifyError(
      'No changes found in bank details.'
    )

    return
  }


  /* ==========================================================
     SUBMIT
     ========================================================== */

  setBankSaving(true)


  try {

    const payload = {
      bank_name: currentBank.bank_name,
      bank_branch: currentBank.bank_branch,
      bank_ifsc: currentBank.bank_ifsc,
      bank_acno: currentBank.bank_acno,
      bank_nominee: currentBank.bank_nominee
    }


    console.log(
      'BANK UPDATE PAYLOAD:',
      payload
    )


    const res = await saveBankDetails(payload)


    /* ========================================================
       SUCCESS
       ======================================================== */

    if (res?.status) {

      setShowBankForm(false)

      /*
       * Do not directly change emp bank details here.
       *
       * They should remain unchanged until authorization.
       */

      notifySuccess(
        res?.message ||
          'Bank details update request submitted successfully for authorization.'
      )

      return
    }


    /* ========================================================
       API ERROR
       ======================================================== */

    notifyError(
      res?.message ||
        'Unable to submit bank details update request.'
    )


  } catch (error) {

    console.error(
      'BANK UPDATE ERROR:',
      error
    )

    notifyError(
      error?.response?.data?.message ||
        error?.message ||
        'Unable to submit bank details update request.'
    )


  } finally {

    setBankSaving(false)
  }
}

// personal details update
const handleEditPersonal = () => {

  const currentData = {
    cell: String(emp?.CELL || '').trim(),

    per_email: String(
      emp?.PER_EMAIL || ''
    ).trim(),

    address: String(
      emp?.ADDRESS || ''
    ).trim(),

    city: String(
      emp?.CITY || ''
    ).trim(),

    state: String(
      emp?.STATE || ''
    ).trim(),

    pincode: String(
      emp?.PINCODE || ''
    ).trim(),

    m_status:
      String(
        emp?.M_STATUS ?? '0'
      ),

    blood_grp:
      String(
        emp?.BLOOD_GRP || ''
      )
        .trim()
        .toUpperCase(),

    address_proof: null
  }

  setPersonalForm(currentData)

  setOriginalPersonalForm({
    cell: currentData.cell,
    per_email: currentData.per_email,
    address: currentData.address,
    city: currentData.city,
    state: currentData.state,
    pincode: currentData.pincode,
    m_status: currentData.m_status,
    blood_grp: currentData.blood_grp
  })

  setPersonalErrors({
    cell: '',
    per_email: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    m_status: '',
    blood_grp: '',
    address_proof: ''
  })

  setPersonalOtp([
    '',
    '',
    '',
    '',
    '',
    ''
  ])

  setShowPersonalForm(true)
}

const handlePersonalInputChange = e => {

  const {
    name,
    value
  } = e.target

  setPersonalForm(prev => ({
    ...prev,
    [name]: value
  }))

  const error = validatePersonalField(name, value)

  setPersonalErrors(prev => ({
    ...prev,
    [name]: error
  }))
}

const handlePersonalBlur = e => {

  const {
    name,
    value
  } = e.target

  const error = validatePersonalField(name, value)

  setPersonalErrors(prev => ({
    ...prev,
    [name]: error
  }))
}

const handlePersonalProofChange = e => {

  const file = e.target.files?.[0]

  if (!file) {

    setPersonalForm(prev => ({
      ...prev,
      address_proof: null
    }))

    setPersonalErrors(prev => ({
      ...prev,
      address_proof: 'Please attach address proof.'
    }))

    return
  }

  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png'
  ]

  if (!allowedTypes.includes(file.type)) {

    e.target.value = ''

    setPersonalForm(prev => ({
      ...prev,
      address_proof: null
    }))

    setPersonalErrors(prev => ({
      ...prev,
      address_proof:
        'Only PDF, JPG, JPEG and PNG files are allowed.'
    }))

    return
  }

  if (file.size > 5 * 1024 * 1024) {

    e.target.value = ''

    setPersonalForm(prev => ({
      ...prev,
      address_proof: null
    }))

    setPersonalErrors(prev => ({
      ...prev,
      address_proof:
        'Attachment cannot exceed 5 MB.'
    }))

    return
  }

  setPersonalForm(prev => ({
    ...prev,
    address_proof: file
  }))

  setPersonalErrors(prev => ({
    ...prev,
    address_proof: ''
  }))
}


const validatePersonalField = (name, value) => {
  let error = ''

  const fieldValue =
    typeof value === 'string'
      ? value.trim()
      : value

  switch (name) {

    case 'cell':
      if (!fieldValue) {
        error = 'Mobile number is required.'
      } else if (!/^\d{10}$/.test(fieldValue)) {
        error = 'Enter a valid 10 digit mobile number.'
      }
      break

    case 'per_email':
      if (!fieldValue) {
        error = 'Personal email is required.'
      } else if (
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fieldValue)
      ) {
        error = 'Enter a valid personal email address.'
      }
      break

    case 'address':
      if (!fieldValue) {
        error = 'Current address is required.'
      }
      break

    case 'city':
      if (!fieldValue) {
        error = 'City is required.'
      }
      break

    case 'state':
      if (!fieldValue) {
        error = 'State is required.'
      }
      break

    case 'pincode':
      if (!fieldValue) {
        error = 'Pincode is required.'
      } else if (!/^\d{6}$/.test(fieldValue)) {
        error = 'Enter a valid 6 digit pincode.'
      }
      break

    case 'm_status':
      if (!['0', '1'].includes(String(fieldValue))) {
        error = 'Please select marital status.'
      }
      break

    case 'blood_grp':
      if (
        fieldValue &&
        ![
          'A+',
          'A-',
          'B+',
          'B-',
          'AB+',
          'AB-',
          'O+',
          'O-'
        ].includes(fieldValue.toUpperCase())
      ) {
        error = 'Please select a valid blood group.'
      }
      break

    case 'address_proof':
      if (!fieldValue) {
        error = 'Please attach address proof.'
      }
      break

    default:
      break
  }

  return error
}

const handleSendPersonalOtp = async () => {

  /* ==========================================================
     VALIDATE ALL FIELDS
  ========================================================== */

  const errors = {
    cell: validatePersonalField(
      'cell',
      personalForm.cell
    ),

    per_email: validatePersonalField(
      'per_email',
      personalForm.per_email
    ),

    address: validatePersonalField(
      'address',
      personalForm.address
    ),

    city: validatePersonalField(
      'city',
      personalForm.city
    ),

    state: validatePersonalField(
      'state',
      personalForm.state
    ),

    pincode: validatePersonalField(
      'pincode',
      personalForm.pincode
    ),

    m_status: validatePersonalField(
      'm_status',
      personalForm.m_status
    ),

    blood_grp: validatePersonalField(
      'blood_grp',
      personalForm.blood_grp
    ),

    address_proof: validatePersonalField(
      'address_proof',
      personalForm.address_proof
    )
  }


  setPersonalErrors(errors)


  const hasErrors =
    Object.values(errors).some(
      error => error
    )


  if (hasErrors) {
    return
  }


  /* ==========================================================
     NORMALIZE VALUES
  ========================================================== */

  const cell =
    personalForm.cell.trim()


  const email =
    personalForm.per_email.trim()


  const address =
    personalForm.address.trim()


  const city =
    personalForm.city.trim()


  const state =
    personalForm.state.trim()


  const pincode =
    personalForm.pincode.trim()


  const maritalStatus =
    String(personalForm.m_status)


  const bloodGroup =
    personalForm.blood_grp
      .trim()
      .toUpperCase()


  /* ==========================================================
     CHECK CHANGES
  ========================================================== */

  const hasChanges =
    cell !==
      originalPersonalForm.cell.trim() ||

    email !==
      originalPersonalForm.per_email.trim() ||

    address.toUpperCase() !==
      originalPersonalForm.address
        .trim()
        .toUpperCase() ||

    city.toUpperCase() !==
      originalPersonalForm.city
        .trim()
        .toUpperCase() ||

    state.toUpperCase() !==
      originalPersonalForm.state
        .trim()
        .toUpperCase() ||

    pincode !==
      originalPersonalForm.pincode.trim() ||

    maritalStatus !==
      String(
        originalPersonalForm.m_status
      ) ||

    bloodGroup !==
      originalPersonalForm.blood_grp
        .trim()
        .toUpperCase()


  if (!hasChanges) {

    notifyWarning(
      'No changes found in personal details.'
    )

    return
  }


  /* ==========================================================
     START SUBMIT
  ========================================================== */

  setPersonalSaving(true)


  try {

    const formData =
      new FormData()


    formData.append(
      'action',
      'send_otp'
    )

    formData.append(
      'cell',
      cell
    )

    formData.append(
      'per_email',
      email
    )

    formData.append(
      'address',
      address
    )

    formData.append(
      'city',
      city
    )

    formData.append(
      'state',
      state
    )

    formData.append(
      'pincode',
      pincode
    )

    formData.append(
      'm_status',
      maritalStatus
    )

    formData.append(
      'blood_grp',
      bloodGroup
    )

    formData.append(
      'address_proof',
      personalForm.address_proof
    )


    /* ========================================================
       API CALL
    ======================================================== */

    const res =
      await sendPersonalDetailsOtp(
        formData
      )


    console.log(
      'PERSONAL DETAILS OTP RESPONSE:',
      res
    )


    /* ========================================================
       IMPORTANT:
       HANDLE API BUSINESS ERROR HERE
    ======================================================== */

    if (!res?.status) {

      /*
       * API returned:
       *
       * {
       *   status: false,
       *   message: "You already have a personal details
       *              update request pending for authorization.",
       *   data: null
       * }
       */

      notifyError(
        res?.message ||
          'Unable to send OTP.'
      )

      return
    }


    /* ========================================================
       SUCCESS ONLY
    ======================================================== */

    setPersonalOtp([
      '',
      '',
      '',
      ''
    ])


    setShowPersonalForm(false)


    setShowPersonalOtp(true)


    notifySuccess(
      res?.message ||
        'OTP has been sent to your registered mobile number.'
    )


    setTimeout(() => {

      personalOtpRefs.current?.[0]?.focus()

    }, 100)


  } catch (error) {

    console.error(
      'PERSONAL DETAILS OTP ERROR:',
      error
    )


    /*
     * Axios may put the PHP response here
     * when PHP returns HTTP 400/500.
     */

    const apiMessage =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message


    notifyError(
      apiMessage ||
        'Unable to send OTP.'
    )


  } finally {

    setPersonalSaving(false)
  }
}

const handlePersonalOtpChange = (
  value,
  index
) => {

  if (!/^\d?$/.test(value)) {
    return
  }


  const updated = [
    ...personalOtp
  ]

  updated[index] = value

  setPersonalOtp(updated)


  if (
    value &&
    index < 3
  ) {

    personalOtpRefs.current[
      index + 1
    ]?.focus()
  }
}


const handlePersonalOtpKeyDown = (
  e,
  index
) => {

  if (
    e.key === 'Backspace' &&
    !personalOtp[index] &&
    index > 0
  ) {

    personalOtpRefs.current[
      index - 1
    ]?.focus()
  }
}


const handleVerifyPersonalOtp = async () => {

  const otp =
    personalOtp.join('')


  if (otp.length !== 4) {

    notifyError(
      'Please enter complete 4 digit OTP.'
    )

    return
  }


  setPersonalOtpVerifying(true)


  try {

    const res =
      await verifyPersonalDetailsOtp({
        otp
      })


    if (!res?.status) {

      notifyError(
        res?.message ||
          'Invalid OTP.'
      )

      return
    }


    setShowPersonalOtp(false)


    notifySuccess(
      res?.message ||
        'OTP verified successfully. Your personal details update request has been submitted for authorization.'
    )


    /*
     * Do NOT update employee data here.
     *
     * It will change only after authorization.
     */


  } catch (error) {

    console.error(
      'PERSONAL OTP VERIFY ERROR:',
      error
    )

    notifyError(
      error?.response?.data?.message ||
        'OTP verification failed.'
    )

  } finally {

    setPersonalOtpVerifying(false)
  }
}


  return (
    <>
      <div className='page-header'>
        <div className='add-item d-flex'>
          <div className='page-title'>
            <h4>Profile</h4>
            <h6>Manage your profile</h6>
          </div>
        </div>

        <nav aria-label='breadcrumb'>
          <ol className='breadcrumb'>
            <li className='breadcrumb-item'>
              <a href='#'>Home</a>
            </li>
            <li className='breadcrumb-item active' aria-current='page'>
              Profile
            </li>
          </ol>
        </nav>
      </div>

      <div className='row'>
        <div className='col-xl-4'>
          <div style={{ minHeight: 402 }} className='card'>
            <div className='card-header rounded-0 bg-primary d-flex align-items-center'>
              {/* Profile Image with Pencil Icon */}
              <div
                style={{
                  position: 'relative',
                  width: '80px',
                  height: '80px'
                }}
                className='me-3'
              >
                <span className='avatar avatar-xl avatar-rounded border border-white border-3'>
                  <img
                    src={imgSrc}
                    alt='Profile'
                    onError={() => setImgSrc(DEFAULT_PROFILE_IMAGE)}
                  />
                </span>

                {/* Pencil Icon */}
                <a
                  href='#'
                  title='Change Image'
                  onClick={e => {
                    e.preventDefault()
                    handleImageClick()
                  }}
                  style={{
                    position: 'absolute',
                    bottom: '12px',
                    right: '10px',
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                    textDecoration: 'none',
                    fontSize: '16px',
                    color: '#0d6efd',
                    zIndex: 1
                  }}
                >
                  <i className='ti ti-pencil'></i>
                </a>

                {/* Hidden File Input */}
                <input
                  type='file'
                  ref={fileInputRef}
                  hidden
                  accept='image/*'
                  onChange={handleImageUpload}
                />
              </div>

              {/* User Info */}
              <div className='me-3'>
                <h3 className='text-white mb-1'>
                  {`${emp?.FNAME || ''} ${emp?.LNAME || ''}`.trim()}
                </h3>

                <span
                  className='badge bg-purple-transparent text-purple'
                  style={{ fontSize: '13px' }}
                >
                  {`${emp?.DEPT_NAME || ''} ${emp?.DESIG_NAME || ''}`.trim()}
                </span>
              </div>
            </div>
            <div className='card-body'>
              <div className='d-flex align-items-center justify-content-between border-bottom pb-2 mb-2'>
                <span className='d-inline-flex align-items-center'>
                  <i className='ti ti-id me-2' />
                  Employee ID
                </span>
                <p className='text-dark'>{`${emp?.EMP_CODE || ''}`.trim()}</p>
              </div>
              <div className='d-flex align-items-center justify-content-between border-bottom pb-2 mb-2'>
                <span className='d-inline-flex align-items-center'>
                  <i className='ti ti-calendar-check me-2' />
                  Date Of Join
                </span>
                <p className='text-dark'>{emp.DOJ}</p>
              </div>
              <div className='d-flex align-items-center justify-content-between border-bottom pb-2 mb-2'>
                <span className='d-inline-flex align-items-center'>
                  <i className='ti ti-phone me-2' />
                  Mobile
                </span>
                <p className='text-dark'>{emp.CELL}</p>
              </div>

              <div className='d-flex align-items-center justify-content-between border-bottom pb-2 mb-2'>
                <span className='d-inline-flex align-items-center'>
                  <i className='ti ti-mail me-2' />
                  Email (Off)
                </span>
                <p className='text-dark'>{emp.COM_EMAIL}</p>
              </div>
              <div className='d-flex align-items-center justify-content-between border-bottom pb-2 mb-2'>
                <span className='d-inline-flex align-items-center'>
                  <i className='ti ti-mail me-2' />
                  Email (Per)
                </span>
                <p className='text-dark'>{emp.PER_EMAIL}</p>
              </div>
              <div className='d-flex align-items-center justify-content-between border-bottom pb-2 mb-2'>
                <span className='d-inline-flex align-items-center'>
                  <i className='ti ti-calendar-check me-2' />
                  Birthday
                </span>
                <p className='text-dark'>{formatDOB(emp.DOB)}</p>
              </div>
              <div className='d-flex align-items-center justify-content-between'>
                <span className='d-inline-flex align-items-center'>
                  <i className='ti ti-gender-bigender me-2' />
                  Gender
                </span>
                <p className='text-dark'>{getGender(emp.GENDER)}</p>
              </div>
            </div>
          </div>
        </div>
        <div className='col-xl-8'>
          <div style={{ minHeight: 402 }} className='card'>
            <div className='card-body'>
              <ul className='nav nav-tabs nav-tabs-bottom border-bottom mb-3'>
                <li className='nav-item'>
                  <a
                    className='nav-link active'
                    href='#personalDetails'
                    data-bs-toggle='tab'
                  >
                    Personal Details
                  </a>
                </li>
                <li className='nav-item'>
                  <a
                    className='nav-link'
                    href='#familyDetails'
                    data-bs-toggle='tab'
                  >
                    Family Details
                  </a>
                </li>
                <li className='nav-item'>
                  <a
                    className='nav-link'
                    href='#officeDetails'
                    data-bs-toggle='tab'
                  >
                    Office Details
                  </a>
                </li>
                <li className='nav-item'>
                  <a
                    className='nav-link'
                    href='#bankDetails'
                    data-bs-toggle='tab'
                  >
                    Bank & Other Details
                  </a>
                </li>
              </ul>

              <div className='tab-content'>
                <div className='tab-pane show active' id='personalDetails'>
                  <div className='table-responsive'>
                    <div
  className='d-flex justify-content-between align-items-center mb-3'
>
  <div>
    <h6 className='mb-1'>
      Personal Details
    </h6>

    <small className='text-muted'>
      Personal detail changes require OTP verification and authorization.
    </small>
  </div>

  <button
    type='button'
    className='btn btn-primary btn-sm'
    onClick={handleEditPersonal}
  >
    <i className='ti ti-edit me-1'></i>
    Update
  </button>
</div>
                    <table className='table table-nowrap table-sm mb-0'>
                      <tbody>
                        <tr>
                          <td>
                            <strong>Full Name:</strong>
                          </td>
                          <td>{getFullName(emp)}</td>
                        </tr>

                        <tr>
                          <td>
                            <strong>Date Of Birth:</strong>
                          </td>
                          <td>{formatDOB(emp.DOB)}</td>
                        </tr>

                        <tr>
                          <td>
                            <strong>Location:</strong>
                          </td>
                          <td>{emp.CITY}</td>
                        </tr>

                        <tr>
                          <td>
                            <strong>Current Address:</strong>
                          </td>
                          <td className='text-wrap'>
                            {emp.ADDRESS}, {emp.CITY} - {emp.PINCODE}
                          </td>
                        </tr>

                        <tr>
                          <td>
                            <strong>Permanant Address:</strong>
                          </td>
                          <td className='text-wrap'>
                            {emp.PERMNT_ADDRESS}, {emp.PERMNT_CITY} -{' '}
                            {emp.PERMNT_PINCODE}
                          </td>
                        </tr>

                        <tr>
                          <td>
                            <strong>Marital Status:</strong>
                          </td>
                          <td>{getMaritalStatus(emp.M_STATUS)}</td>
                        </tr>

                        <tr>
                          <td>
                            <strong>Blood Group:</strong>
                          </td>
                          <td>{emp.BLOOD_GRP || 'Not Given'}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className='tab-pane' id='familyDetails'>
                  <div className='d-flex justify-content-between align-items-center flex-wrap row-gap-3 mb-3'>
                    <SDLSearch
                      value={searchQuery}
                      onChange={setSearchQuery}
                      placeholder='Search...'
                      style={{ width: '280px' }}
                    />

                    {canManageFamily && (
                      <a
                        href='#'
                        title='Add Family Member'
                        className='text-primary'
                        style={{ fontSize: '26px' }}
                        onClick={e => {
                          e.preventDefault()
                          handleAddFamily()
                        }}
                      >
                        <button
                type='button'
                className='btn btn-icon btn-sm btn-primary'
              >

                        <i className='ti ti-plus-circle'>+</i>
              </button>
                      </a>
                    )}
                  </div>

                  <div className='table-responsive'>
                    <SDLDataTable
                      data={filteredFamilyData}
                      columns={familyColumns}
                      loading={false}
                      rows={10}
                      rowsPerPageOptions={[10, 20, 50]}
                      removableSort
                      dataKey='id'
                      emptyMessage='No family members found'
                      tableStyle={{ minWidth: '800px' }}
                    />
                  </div>
                </div>

                <div className='tab-pane' id='officeDetails'>
                  <div className='table-responsive'>
                    <table className='table table-nowrap mb-0 table-sm'>
                      <tbody>
                        <tr>
                          <td>
                            <strong>Employee ID:</strong>
                          </td>
                          <td>{emp.EMP_CODE}</td>
                        </tr>

                        <tr>
                          <td>
                            <strong>Department:</strong>
                          </td>
                          <td>{emp.DEPT_NAME}</td>
                        </tr>

                        <tr>
                          <td>
                            <strong>Designation:</strong>
                          </td>
                          <td>{emp.DESIG_NAME}</td>
                        </tr>

                        <tr>
                          <td>
                            <strong>Reports To:</strong>
                          </td>
                          <td>{emp.REPORT_TO_NAME}</td>
                        </tr>

                        <tr>
                          <td>
                            <strong>Joining Date:</strong>
                          </td>
                          <td>{emp.DOJ}</td>
                        </tr>

                        <tr>
                          <td>
                            <strong>Confirmation Date:</strong>
                          </td>
                          <td>{emp.DATE_CONF}</td>
                        </tr>

                        <tr>
                          <td>
                            <strong>Shift:</strong>
                          </td>
                          <td>{emp.SHFT_LABEL}</td>
                        </tr>

                        <tr>
                          <td>
                            <strong>Experience:</strong>
                          </td>
                          <td>{emp.EXPERIENCE}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className='tab-pane' id='bankDetails'>

  {/* ================= HEADER ================= */}

  <div className='d-flex justify-content-between align-items-center mb-3'>
    <div>
      <h6 className='mb-1'>Bank Details</h6>
      <small className='text-muted'>
        Bank detail changes require authorization.
      </small>
    </div>

    <button
      type='button'
      className='btn btn-primary btn-sm'
      onClick={handleEditBank}
    >
      <i className='ti ti-edit me-1'></i>
      Update
    </button>
  </div>

  {/* ================= BANK TABLE ================= */}

  <div className='table-responsive'>
    <table className='table table-nowrap mb-0 table-sm'>
      <tbody>

        <tr>
          <td style={{ width: '220px' }}>
            <strong>Bank Name:</strong>
          </td>
          <td>{emp.BANK_NAME || 'Not Given'}</td>
        </tr>

        <tr>
          <td>
            <strong>Account Number:</strong>
          </td>
          <td>{emp.BANK_ACCT || 'Not Given'}</td>
        </tr>

        <tr>
          <td>
            <strong>IFSC:</strong>
          </td>
          <td>{emp.AC_IFSC_NO || 'Not Given'}</td>
        </tr>

        <tr>
          <td>
            <strong>Branch:</strong>
          </td>
          <td>{emp.AC_BRANCH_NAME || 'Not Given'}</td>
        </tr>

        <tr>
          <td>
            <strong>Bank Nominee:</strong>
          </td>
          <td>{emp.BANK_NOMINEE || 'Not Given'}</td>
        </tr>

        <tr>
          <td>
            <strong>Pan Number:</strong>
          </td>
          <td>{emp.IT_NO || 'Not Given'}</td>
        </tr>

        <tr>
          <td>
            <strong>Aadhaar Number:</strong>
          </td>
          <td>{emp.AADHAR_NO || 'Not Given'}</td>
        </tr>

        <tr>
          <td>
            <strong>PF (UAN):</strong>
          </td>
          <td>{emp.UAN_NO || 'Not Given'}</td>
        </tr>

        <tr>
          <td>
            <strong>ESI Number:</strong>
          </td>
          <td>{emp.ESIC_NO || 'NA'}</td>
        </tr>

        <tr>
          <td>
            <strong>Working Site:</strong>
          </td>
          <td>{emp.WORK_SITE || 'Not Given'}</td>
        </tr>

      </tbody>
    </table>
  </div>

</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= FAMILY MODAL ================= */}
      {showFamilyForm && (
        <div
          className='modal fade show'
          style={{
            display: 'block',
            backgroundColor: 'rgba(0,0,0,0.5)'
          }}
          tabIndex='-1'
        >
          <div className='modal-dialog modal-lg modal-dialog-centered'>
            <div className='modal-content'>
              {/* Modal Header */}
              <div className='modal-header'>
                <h5 className='modal-title'>
                  {editingMember ? 'Edit Family Member' : 'Add Family Member'}
                </h5>

                {/* <button
                  type='button'
                  className='btn-close'
                  onClick={() => setShowFamilyForm(false)}
                /> */}

                <button
                type="button"
                className="close"
                data-bs-dismiss="modal"
                aria-label="Close"
                  onClick={() => setShowFamilyForm(false)}
              >
                <span aria-hidden="true">×</span>
              </button>
              </div>

              {/* Modal Body */}
              <div className='modal-body'>
                <div className='row g-3'>
                  {/* Name */}
                  <div className='col-md-6'>
                    <label className='form-label'>
                      Name <span className='text-danger'>*</span>
                    </label>
                    <input
                      type='text'
                      className='form-control'
                      name='name'
                      value={familyForm.name}
                      onChange={handleFamilyInputChange}
                      placeholder='Enter Name'
                    />
                  </div>

                  {/* Relation Dropdown */}
                  <div className='col-md-6'>
                    <label className='form-label'>
                      Relation <span className='text-danger'>*</span>
                    </label>
                    <select
                      className='form-select'
                      name='relation'
                      value={familyForm.relation}
                      onChange={handleFamilyInputChange}
                    >
                      <option value='Wife'>Wife</option>
                      <option value='Husband'>Husband</option>
                      <option value='Mother'>Mother</option>
                      <option value='Father'>Father</option>
                      <option value='Son'>Son</option>
                      <option value='Daughter'>Daughter</option>
                    </select>
                  </div>

                  {/* Dependency */}
                  <div className='col-md-6'>
                    <label className='form-label'>
                      Dependent <span className='text-danger'>*</span>
                    </label>
                    <select
                      className='form-select'
                      name='dependent'
                      value={familyForm.dependent}
                      onChange={handleFamilyInputChange}
                    >
                      <option value='Dependant'>Dependant</option>
                      <option value='Non-Dependant'>Non-Dependant</option>
                      <option value='Deceased'>Deceased</option>
                      <option value='Not-Applicable'>Not-Applicable</option>
                    </select>
                  </div>

                  {/* DOB Datepicker */}
                  <div className='col-md-6'>
                    <label className='form-label'>Date of Birth</label>
                    <input
                      type='date'
                      className='form-control'
                      name='dob'
                      value={familyForm.dob}
                      onChange={handleFamilyInputChange}
                    />
                  </div>

                  {/* Occupation */}
                  <div className='col-md-6'>
                    <label className='form-label'>Occupation</label>
                    <input
                      type='text'
                      className='form-control'
                      name='occupation'
                      value={familyForm.occupation}
                      onChange={handleFamilyInputChange}
                      placeholder='Enter Occupation'
                    />
                  </div>

                  {/* Aadhar */}
                  <div className='col-md-6'>
                    <label className='form-label'>Aadhaar</label>
                    <input
                      type='text'
                      className='form-control'
                      name='aadhaar'
                      value={familyForm.aadhaar}
                      maxLength={12}
                      onChange={e => {
                        const value = e.target.value.replace(/\D/g, '')

                        setFamilyForm(prev => ({
                          ...prev,
                          aadhaar: value
                        }))
                      }}
                      placeholder='Enter 12 Digit Aadhaar Number'
                    />
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className='modal-footer'>

                <button
                  type='button'
                  className='btn btn-primary me-2'
                  onClick={handleSaveFamily}
                >
                  {editingMember ? 'Update' : 'Save'}
                </button>
                <button
                  type='button'
                  className='btn btn-secondary'
                  onClick={() => setShowFamilyForm(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

     {/* ================= BANK DETAILS MODAL ================= */}

{showBankForm && (
  <div
    className='modal fade show'
    style={{
      display: 'block',
      backgroundColor: 'rgba(0,0,0,0.5)'
    }}
    tabIndex='-1'
    role='dialog'
    aria-modal='true'
  >
    <div className='modal-dialog modal-lg modal-dialog-centered'>
      <div className='modal-content'>

        {/* ================= HEADER ================= */}

        <div className='modal-header'>

          <div>
            <h5 className='modal-title mb-1'>
              Update Bank Details
            </h5>

            <small className='text-muted'>
              Changes will be sent for authorization.
            </small>
          </div>

          <button
            type='button'
            className='close'
            aria-label='Close'
            onClick={() => {
              if (!bankSaving) {
                setShowBankForm(false)
              }
            }}
            disabled={bankSaving}
          >
            <span aria-hidden='true'>
              ×
            </span>
          </button>

        </div>


        {/* ================= BODY ================= */}

        <div className='modal-body'>

          <div className='alert alert-warning d-flex align-items-center mb-4'>

            <i className='ti ti-info-circle me-2'></i>

            <span>
              Your current bank details will remain unchanged
              until the request is authorized.
            </span>

          </div>


          <div className='row g-3'>

            {/* ================= BANK NAME ================= */}

            <div className='col-md-6'>

              <label className='form-label'>
                Bank Name
                <span className='text-danger'> *</span>
              </label>

              <input
                type='text'
                className='form-control'
                name='bank_name'
                value={bankForm.bank_name}
                onChange={handleBankInputChange}
                placeholder='Enter Bank Name'
                maxLength={100}
                autoComplete='off'
              />

            </div>


            {/* ================= BRANCH ================= */}

            <div className='col-md-6'>

              <label className='form-label'>
                Bank Branch
                <span className='text-danger'> *</span>
              </label>

              <input
                type='text'
                className='form-control'
                name='bank_branch'
                value={bankForm.bank_branch}
                onChange={handleBankInputChange}
                placeholder='Enter Bank Branch'
                maxLength={100}
                autoComplete='off'
              />

            </div>


            {/* ================= IFSC ================= */}

            <div className='col-md-6'>

              <label className='form-label'>
                IFSC
                <span className='text-danger'> *</span>
              </label>

              <input
                type='text'
                className='form-control text-uppercase'
                name='bank_ifsc'
                value={bankForm.bank_ifsc}
                onChange={e => {

                  const value =
                    e.target.value
                      .toUpperCase()
                      .replace(/[^A-Z0-9]/g, '')

                  setBankForm(prev => ({
                    ...prev,
                    bank_ifsc: value
                  }))
                }}
                placeholder='Enter IFSC'
                maxLength={11}
                autoComplete='off'
              />

            </div>


            {/* ================= ACCOUNT NUMBER ================= */}

            <div className='col-md-6'>

              <label className='form-label'>
                Account Number
                <span className='text-danger'> *</span>
              </label>

              <input
                type='text'
                className='form-control'
                name='bank_acno'
                value={bankForm.bank_acno}
                onChange={e => {

                  const value =
                    e.target.value.replace(/\D/g, '')

                  setBankForm(prev => ({
                    ...prev,
                    bank_acno: value
                  }))
                }}
                placeholder='Enter Account Number'
                maxLength={50}
                inputMode='numeric'
                autoComplete='off'
              />

            </div>


            {/* ================= NOMINEE ================= */}

            <div className='col-md-6'>

              <label className='form-label'>
                Bank Nominee
              </label>

              <input
                type='text'
                className='form-control'
                name='bank_nominee'
                value={bankForm.bank_nominee}
                onChange={handleBankInputChange}
                placeholder='Enter Bank Nominee'
                maxLength={100}
                autoComplete='off'
              />

            </div>

          </div>

        </div>


        {/* ================= FOOTER ================= */}

        <div className='modal-footer'>

          <button
            type='button'
            className='btn btn-primary me-2'
            onClick={handleSaveBank}
            disabled={bankSaving}
          >

            {bankSaving ? (
              <>
                <span
                  className='spinner-border spinner-border-sm me-2'
                  role='status'
                  aria-hidden='true'
                ></span>

                Submitting...
              </>
            ) : (
              <>
                <i className='ti ti-check me-1'></i>
                Update
              </>
            )}

          </button>

          <button
            type='button'
            className='btn btn-secondary'
            onClick={() => setShowBankForm(false)}
            disabled={bankSaving}
          >
            Cancel
          </button>

        </div>

      </div>
    </div>
  </div>
)}




{/* =========================================================
    PERSONAL DETAILS MODAL
========================================================= */}

{showPersonalForm && (
  <div
    className='modal fade show'
    style={{
      display: 'block',
      backgroundColor: 'rgba(0,0,0,0.5)'
    }}
    tabIndex='-1'
    role='dialog'
    aria-modal='true'
  >

    <div className='modal-dialog modal-lg modal-dialog-centered'>

      <div className='modal-content'>

        {/* ================= HEADER ================= */}

        <div className='modal-header'>

          <div>
            <h5 className='modal-title mb-1'>
              Update Personal Details
            </h5>

            <small className='text-muted'>
              OTP verification is required before submission.
            </small>
          </div>

          <button
            type='button'
            className='close'
            aria-label='Close'
            onClick={() => {
              if (!personalSaving) {
                setShowPersonalForm(false)
              }
            }}
            disabled={personalSaving}
          >
            <span aria-hidden='true'>
              ×
            </span>
          </button>

        </div>


        {/* ================= BODY ================= */}

        <div className='modal-body'>

          <div className='alert alert-warning d-flex align-items-center mb-4'>

            <i className='ti ti-shield-check me-2'></i>

            <span>
              Your existing profile information will remain unchanged
              until the request is authorized.
            </span>

          </div>


          <div className='row g-3'>

            {/* ================= MOBILE ================= */}

            <div className='col-md-6'>

              <label className='form-label'>
                Mobile No
                <span className='text-danger'> *</span>
              </label>

              <input
  type='text'
  className={`form-control ${
    personalErrors.cell
      ? 'is-invalid'
      : ''
  }`}
  name='cell'
  value={personalForm.cell}
  onChange={e => {

    const value =
      e.target.value
        .replace(/\D/g, '')
        .slice(0, 10)

    setPersonalForm(prev => ({
      ...prev,
      cell: value
    }))

    setPersonalErrors(prev => ({
      ...prev,
      cell: validatePersonalField(
        'cell',
        value
      )
    }))
  }}
  onBlur={handlePersonalBlur}
  placeholder='Enter Mobile Number'
  inputMode='numeric'
  maxLength={10}
  autoComplete='off'
/>

{personalErrors.cell && (
  <div className='invalid-feedback d-block'>
    {personalErrors.cell}
  </div>
)}

            </div>


            {/* ================= PERSONAL EMAIL ================= */}

            <div className='col-md-6'>

              <label className='form-label'>
                Personal Email
                <span className='text-danger'> *</span>
              </label>

             <input
  type='email'
  className={`form-control ${
    personalErrors.per_email
      ? 'is-invalid'
      : ''
  }`}
  name='per_email'
  value={personalForm.per_email}
  onChange={handlePersonalInputChange}
  onBlur={handlePersonalBlur}
  placeholder='Enter Personal Email'
  maxLength={50}
  autoComplete='off'
/>

{personalErrors.per_email && (
  <div className='invalid-feedback d-block'>
    {personalErrors.per_email}
  </div>
)}

            </div>


            {/* ================= MARITAL STATUS ================= */}

            <div className='col-md-6'>

              <label className='form-label'>
                Marital Status
                <span className='text-danger'> *</span>
              </label>

              <select
                className={`form-select ${
                  personalErrors.m_status
                    ? 'is-invalid'
                    : ''
                }`}
                name='m_status'
                value={personalForm.m_status}
                onChange={handlePersonalInputChange}
                onBlur={handlePersonalBlur}
              >
                <option value=''>
                  Select Marital Status
                </option>

                <option value='0'>
                  Single
                </option>

                <option value='1'>
                  Married
                </option>
              </select>

              {personalErrors.m_status && (
                <div className='invalid-feedback d-block'>
                  {personalErrors.m_status}
                </div>
              )}

            </div>


            {/* ================= BLOOD GROUP ================= */}

            <div className='col-md-6'>

              <label className='form-label'>
                Blood Group
              </label>

             <select
                className={`form-select ${
                  personalErrors.blood_grp
                    ? 'is-invalid'
                    : ''
                }`}
                name='blood_grp'
                value={personalForm.blood_grp}
                onChange={handlePersonalInputChange}
                onBlur={handlePersonalBlur}
              >
                <option value=''>
                  Select Blood Group
                </option>

                <option value='A+'>A+</option>
                <option value='A-'>A-</option>
                <option value='B+'>B+</option>
                <option value='B-'>B-</option>
                <option value='AB+'>AB+</option>
                <option value='AB-'>AB-</option>
                <option value='O+'>O+</option>
                <option value='O-'>O-</option>
              </select>

              {personalErrors.blood_grp && (
                <div className='invalid-feedback d-block'>
                  {personalErrors.blood_grp}
                </div>
              )}

            </div>


            {/* ================= ADDRESS ================= */}

            <div className='col-12'>

              <label className='form-label'>
                Current Address
                <span className='text-danger'> *</span>
              </label>

             <textarea
                className={`form-control ${
                  personalErrors.address
                    ? 'is-invalid'
                    : ''
                }`}
                name='address'
                rows='2'
                value={personalForm.address}
                onChange={handlePersonalInputChange}
                onBlur={handlePersonalBlur}
                placeholder='Enter Current Address'
                maxLength={300}
              />

              {personalErrors.address && (
                <div className='invalid-feedback d-block'>
                  {personalErrors.address}
                </div>
              )}

            </div>


            {/* ================= CITY ================= */}

            <div className='col-md-4'>

              <label className='form-label'>
                City
                <span className='text-danger'> *</span>
              </label>

             <input
                type='text'
                className={`form-control ${
                  personalErrors.city
                    ? 'is-invalid'
                    : ''
                }`}
                name='city'
                value={personalForm.city}
                onChange={handlePersonalInputChange}
                onBlur={handlePersonalBlur}
                placeholder='Enter City'
                maxLength={50}
              />

              {personalErrors.city && (
                <div className='invalid-feedback d-block'>
                  {personalErrors.city}
                </div>
              )}

            </div>


            {/* ================= STATE ================= */}

            <div className='col-md-4'>

              <label className='form-label'>
                State
                <span className='text-danger'> *</span>
              </label>

            <input
              type='text'
              className={`form-control ${
                personalErrors.state
                  ? 'is-invalid'
                  : ''
              }`}
              name='state'
              value={personalForm.state}
              onChange={handlePersonalInputChange}
              onBlur={handlePersonalBlur}
              placeholder='Enter State'
              maxLength={50}
            />

            {personalErrors.state && (
              <div className='invalid-feedback d-block'>
                {personalErrors.state}
              </div>
            )}

            </div>


            {/* ================= PINCODE ================= */}

            <div className='col-md-4'>

              <label className='form-label'>
                Pincode
                <span className='text-danger'> *</span>
              </label>

             <input
  type='text'
  className={`form-control ${
    personalErrors.pincode
      ? 'is-invalid'
      : ''
  }`}
  name='pincode'
  value={personalForm.pincode}
  onChange={e => {

    const value =
      e.target.value
        .replace(/\D/g, '')
        .slice(0, 6)

    setPersonalForm(prev => ({
      ...prev,
      pincode: value
    }))

    setPersonalErrors(prev => ({
      ...prev,
      pincode: validatePersonalField(
        'pincode',
        value
      )
    }))
  }}
  onBlur={handlePersonalBlur}
  placeholder='Enter Pincode'
  inputMode='numeric'
  maxLength={6}
/>

{personalErrors.pincode && (
  <div className='invalid-feedback d-block'>
    {personalErrors.pincode}
  </div>
)}

            </div>


            {/* ================= ADDRESS PROOF ================= */}

            <div className='col-12'>

              <label className='form-label'>
                Address Proof
                <span className='text-danger'> *</span>
              </label>

             <input
  type='file'
  className={`form-control ${
    personalErrors.address_proof
      ? 'is-invalid'
      : ''
  }`}
  accept='.pdf,.jpg,.jpeg,.png'
  onChange={handlePersonalProofChange}
/>

<small className='text-muted'>
  Accepted formats: PDF, JPG, JPEG, PNG.
  Maximum size: 5 MB.
</small>

{personalForm.address_proof && (
  <div className='mt-2 text-success small'>
    <i className='ti ti-check me-1'></i>
    {personalForm.address_proof.name}
  </div>
)}

{personalErrors.address_proof && (
  <div className='invalid-feedback d-block'>
    {personalErrors.address_proof}
  </div>
)}

</div>

</div>

</div>


        {/* ================= FOOTER ================= */}

        <div className='modal-footer'>

          <button
            type='button'
            className='btn btn-primary me-2'
            onClick={handleSendPersonalOtp}
            disabled={personalSaving}
          >

            {personalSaving ? (
              <>
                <span
                  className='spinner-border spinner-border-sm me-2'
                  role='status'
                ></span>

                Sending OTP...
              </>
            ) : (
              <>
                <i className='ti ti-shield-lock me-1'></i>
                Send OTP & Continue
              </>
            )}

          </button>


          <button
            type='button'
            className='btn btn-secondary'
            onClick={() => setShowPersonalForm(false)}
            disabled={personalSaving}
          >
            Cancel
          </button>

        </div>

      </div>

    </div>

  </div>
)}

{/* =========================================================
    PERSONAL DETAILS OTP MODAL
========================================================= */}

{showPersonalOtp && (
  <div
    className='modal fade show'
    style={{
      display: 'block',
      backgroundColor: 'rgba(0,0,0,0.5)'
    }}
    tabIndex='-1'
    role='dialog'
    aria-modal='true'
  >

    <div className='modal-dialog modal-dialog-centered'>

      <div className='modal-content'>

        {/* ================= HEADER ================= */}

        <div className='modal-header'>

          <div>
            <h5 className='modal-title mb-1'>
              Verify OTP
            </h5>

            <small className='text-muted'>
              Enter the OTP sent to your registered mobile number.
            </small>
          </div>

          <button
            type='button'
            className='close'
            aria-label='Close'
            onClick={() => {
              if (!personalOtpVerifying) {
                setShowPersonalOtp(false)
              }
            }}
            disabled={personalOtpVerifying}
          >
            <span aria-hidden='true'>
              ×
            </span>
          </button>

        </div>


        {/* ================= BODY ================= */}

        <div className='modal-body text-center'>

          <div
            className='mb-3'
            style={{
              fontSize: '42px',
              color: '#ff9800'
            }}
          >
            <i className='ti ti-shield-lock'></i>
          </div>


          <h6 className='mb-2'>
            OTP Verification
          </h6>

          <p className='text-muted small mb-4'>
            Please enter the 6 digit OTP sent to your
            registered mobile number.
          </p>


          {/* ================= OTP INPUTS ================= */}

          <div className='d-flex justify-content-center gap-2 mb-3'>

            {personalOtp.map(
              (value, index) => (

                <input
                  key={index}
                  ref={el => {
                    personalOtpRefs.current[index] = el
                  }}
                  type='text'
                  inputMode='numeric'
                  maxLength={1}
                  value={value}
                  className='form-control text-center'
                  style={{
                    width: '45px',
                    height: '45px',
                    fontSize: '20px',
                    fontWeight: '600'
                  }}
                  onChange={e =>
                    handlePersonalOtpChange(
                      e.target.value,
                      index
                    )
                  }
                  onKeyDown={e =>
                    handlePersonalOtpKeyDown(
                      e,
                      index
                    )
                  }
                  autoComplete='one-time-code'
                />

              )
            )}

          </div>


          <small className='text-muted'>
            OTP is valid for 10 minutes.
          </small>

        </div>


        {/* ================= FOOTER ================= */}

        <div className='modal-footer justify-content-center'>

          <button
            type='button'
            className='btn btn-primary me-2'
            onClick={handleVerifyPersonalOtp}
            disabled={personalOtpVerifying}
          >

            {personalOtpVerifying ? (
              <>
                <span
                  className='spinner-border spinner-border-sm me-2'
                  role='status'
                ></span>

                Verifying...
              </>
            ) : (
              <>
                <i className='ti ti-check me-1'></i>
                Verify OTP
              </>
            )}

          </button>


          <button
            type='button'
            className='btn btn-secondary'
            onClick={() => setShowPersonalOtp(false)}
            disabled={personalOtpVerifying}
          >
            Cancel
          </button>

        </div>

      </div>

    </div>

  </div>
)}


    </>
  )
}

export default MyProfile
