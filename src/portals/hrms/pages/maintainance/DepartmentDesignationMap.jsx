import { useEffect, useState, useMemo, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import { getPortalFromPath } from '../../../../config/portalConfig'
import BreadcrumbNav from '../../components/breadcrumb-nav/BreadcrumbNav'
import SDLSearch from '../../../../components/datatable/SDLSearch'
import {
  getDepartmentDesignationMap,
  getDesignationsMaster,
  saveDepartmentDesignationMap
} from '../../services/departmentService'
import { notifySuccess, notifyError } from '../../../../services/alertService'
import '../../assets/departmentDesignation.css'
import SDLReactMultiSelect from '../../../../components/SDLReactMultiSelect'
import UpdateButton from '../../components/buttons/UpdateButton'

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
    'departments',
    'department'
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
        'departments',
        'designation',
        'designations'
      ]) {
        if (Array.isArray(payload[key][subKey])) return payload[key][subKey]
      }
    }
  }

  return []
}

const DepartmentDesignationMap = () => {
  const location = useLocation()
  const portal = getPortalFromPath(location.pathname)
  const portalHome = `/${portal.key}/dashboard`

  const TOP_CONTROL_WIDTH = '330px'

  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const [rows, setRows] = useState([])
  const [designations, setDesignations] = useState([])
  const [rowSelections, setRowSelections] = useState({})
  const [saving, setSaving] = useState(false)

  const toDesignationOption = designation => {
    const value = String(
      designation?.ID ??
        designation?.id ??
        designation?.DESIG_ID ??
        designation?.DESI_ID ??
        designation?.designationId ??
        designation ??
        ''
    )
    const label =
      designation?.DESIG_NAME ||
      designation?.DESI_DESC ||
      designation?.name ||
      designation?.designation ||
      designation?.DESIGNATION ||
      String(designation || '')

    return {
      value,
      label
    }
  }

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const res = await getDepartmentDesignationMap()
      const data = normalizeRecords(res)
      setRows(data)

      const selections = {}

      data.forEach((row, index) => {
        const rowId = row.ID ?? row.id ?? index + 1

        selections[rowId] = (
          row.designations ||
          row.DESIGNATIONS ||
          row.designation_list ||
          row.designations_list ||
          row.DESI_LIST ||
          row.DESI_NAMES ||
          []
        )
          .map(toDesignationOption)
          .map(option => option.value)
      })

      setRowSelections(selections)

      const dres = await getDesignationsMaster()
      const ddata = normalizeRecords(dres)
      setDesignations(ddata.map(toDesignationOption))
    } catch (err) {
      console.error(err)
      notifyError(err?.message || 'Unable to load data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchData()
  }, [fetchData])

  const listData = useMemo(() => {
    const normalized = rows.map((item, idx) => ({
      ID: item.ID ?? item.id ?? idx + 1,
      DEPT_CODE:
        item.DEPT_CODE ??
        item.dept_code ??
        item.code ??
        item.DEPT_ID ??
        item.id ??
        '',
      DEPT_NAME:
        item.DEPT_NAME ??
        item.dept_name ??
        item.name ??
        item.DEPT_DESC ??
        item.dept_desc ??
        item.department ??
        '',
      DESIGNATIONS: Array.isArray(item.designations)
        ? item.designations
        : Array.isArray(item.DESIGNATIONS)
        ? item.DESIGNATIONS
        : item.designation_list ||
          item.designations_list ||
          item.designations ||
          item.DESI_LIST ||
          item.DESI_NAMES ||
          []
    }))

    if (!searchQuery.trim()) return normalized
    const q = searchQuery.trim().toLowerCase()
    return normalized.filter(
      r =>
        (r.DEPT_NAME || '').toLowerCase().includes(q) ||
        (r.DEPT_CODE || '').toString().toLowerCase().includes(q)
    )
  }, [rows, searchQuery])

  const handleSave = async row => {
    if (!row) return

    setSaving(true)

    try {
      const payload = {
        dept_id: row.DEPT_ID || row.DEPT_CODE || row.ID,

        designations: rowSelections[row.ID] || []
      }

      const res = await saveDepartmentDesignationMap(payload)

      if (res?.status) {
        notifySuccess(res.message || 'Saved successfully')
        await fetchData()
      } else {
        notifyError(res?.message || 'Save failed')
      }
    } catch (err) {
      console.error(err)
      notifyError(err?.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div className='page-header' style={{ marginBottom: '8px' }}>
        <div className='add-item d-flex'>
          <div className='page-title'>
            <h4>Department - Designation Map</h4>
          </div>
        </div>

        <BreadcrumbNav
          items={[
            { text: 'Home', link: portalHome },
            { text: 'Dept - Designation Map' }
          ]}
        />
      </div>

      <div className='row'>
        <div className='col-12'>
          <div className='card'>
            <div className='card-body'>
              <div className='d-flex justify-content-end align-items-center mb-3'>
                <div
                  style={{
                    width: TOP_CONTROL_WIDTH,
                    minWidth: TOP_CONTROL_WIDTH,
                    maxWidth: TOP_CONTROL_WIDTH,
                    flexShrink: 0
                  }}
                >
                  <SDLSearch
                    value={searchQuery}
                    onChange={setSearchQuery}
                    placeholder='Search Department...'
                    className='mb-0'
                    style={{
                      width: TOP_CONTROL_WIDTH,
                      minWidth: TOP_CONTROL_WIDTH,
                      maxWidth: TOP_CONTROL_WIDTH
                    }}
                  />
                </div>
              </div>

              <div className='table-responsive'>
                <table
                  className='table table-bordered'
                  style={{
                    width: '100%',
                    tableLayout: 'fixed'
                  }}
                >
                  <thead className='table-light'>
                    <tr>
                      <th style={{ width: '60px' }}>Sr.</th>
                      <th style={{ width: '60px' }}>Code</th>
                      <th style={{ width: '180px' }}>Department</th>
                      <th style={{ width: '65%' }}>Designations</th>
                      <th style={{ width: '120px' }}>Update</th>
                    </tr>
                  </thead>
                  <tbody>
                    {listData.length === 0 ? (
                      <tr>
                        <td colSpan={5} className='text-center py-4 text-muted'>
                          No data found
                        </td>
                      </tr>
                    ) : (
                      listData.map((row, idx) => (
                        <tr key={row.ID || idx}>
                          <td>{idx + 1}</td>
                          <td>{row.DEPT_CODE}</td>
                          <td>{row.DEPT_NAME}</td>

                          <td style={{ minWidth: 0 }}>
                            <SDLReactMultiSelect
                              value={rowSelections[row.ID] || []}
                              options={designations}
                              onChange={selectedValues => {
                                setRowSelections(prev => ({
                                  ...prev,
                                  [row.ID]: selectedValues || []
                                }))
                              }}
                              placeholder='Select Designations'
                              isDisabled={saving}
                              hasError={false}
                              isClearable
                            />
                          </td>
                          <td className='text-center'>
                            <UpdateButton
                              onClick={() => handleSave(row)}
                              disabled={saving}
                              isSubmitting={saving}
                            />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default DepartmentDesignationMap
