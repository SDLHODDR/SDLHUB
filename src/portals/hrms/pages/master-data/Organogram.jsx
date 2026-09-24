import { useEffect, useState, useMemo, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import { Dropdown } from 'primereact/dropdown'
import BreadcrumbNav from '../../../eportal/components/breadcrumb-nav/BreadcrumbNav'
import SDLReactSelect from '../../../../components/SDLReactSelect'
import {
  //notifySuccess,
  notifyError
  //notifyWarning,
  //confirmAction,
} from '../../../../services/alertService'
import SDLTabsComponent from '../../components/tabs/SDLTabsComponent'
import useSDLTabComponentHandler from '../../portalutils/useSDLTabComponentHandler'
import OrganogramListView from '../../portalutils/OrganogramListView'
import {
  getOrgonograms
  //getProfileAccess,
  //saveProfileAccess,
} from '../../services/orgonogramService'
import { getPortalFromPath } from '../../../../config/portalConfig'
// import "../../assets/css/profileMaintenance.css";
import SDLSearch from '../../../../components/datatable/SDLSearch'
import ViewToggleButton from '../../components/buttons/ViewToggleButton'

const Organogram = () => {
  /* ==========================================================
      PORTAL
  ========================================================== */
  const location = useLocation()
  const portal = getPortalFromPath(location.pathname)
  const portalHome = `/${portal.key}/dashboard`

  const [loadingOrgonogram, setLoadingOrgonogram] = useState(false)

  /* ==========================================================
      STATE
  ========================================================== */
  const [selectedOrganogram, setSelectedOrgonogram] = useState(null)
  const [orgonogram, setOrgonogram] = useState([])

  // Global list/form toggle shared by the tabs that support both views.
  const [showAll, setShowAll] = useState(false)

  const handleCancelEdit = useCallback(() => {
    setShowAll(true)
  }, [])

  /* ==========================================================
        LOAD PROFILES
    ========================================================== */

  const loadOrgonogram = useCallback(async selectId => {
    try {
      setLoadingOrgonogram(true)
      const userConfig = localStorage.getItem('user-hrms-config')
      const res = await getOrgonograms(userConfig)

      if (res?.status) {
        const orgonoList = Array.isArray(res.data) ? res.data : []
        setOrgonogram(orgonoList)
        setSelectedOrgonogram(prev =>
          selectId !== undefined ? selectId : prev
        )
      } else {
        notifyError(res?.message || 'Unable to load profiles.')
      }
    } catch (error) {
      console.error('Load profiles error:', error)
      notifyError(error?.message || 'Unable to load profiles.')
    } finally {
      setLoadingOrgonogram(false)
    }
  }, [])

  useEffect(() => {
    loadOrgonogram()
  }, [loadOrgonogram])

  const orgonogramOptions = useMemo(() => {
    return orgonogram.map(orgngm => ({
      label: orgngm.OPTIONS ?? '',
      value: orgngm.ID
    }))
  }, [orgonogram])

  const selectedOrganogramRecord = useMemo(
    () => orgonogram.find((row) => String(row.ID) === String(selectedOrganogram)),
    [orgonogram, selectedOrganogram]
  );
  const organogramStatus = selectedOrganogramRecord?.STATUS
    ?? selectedOrganogramRecord?.status
    ?? selectedOrganogramRecord?.STATUSTXT
    ?? "N";

  const { tabs, selectedTab, handleTabChange, tabContent } = useSDLTabComponentHandler(
    selectedOrganogram,
    organogramStatus,
    loadOrgonogram,
    showAll,
    handleCancelEdit
  );

  /* ==========================================================
      TOGGLE: list <-> form
  ========================================================== */
  const handleToggleView = useCallback(() => {
    if (loadingOrgonogram) return
    setShowAll(prev => !prev)
  }, [loadingOrgonogram])

  // Selecting an organogram — from the top dropdown OR a list row's Edit
  // action — always drops back into form mode, same as KRA Activity's
  // handleSelectActivity does.
  const handleSelectOrganogram = useCallback(value => {
    setSelectedOrgonogram(value || null)
    setShowAll(false)
  }, [])

  const handleSelectFromList = useCallback(id => {
    setSelectedOrgonogram(id)
    setShowAll(false)
  }, [])

  return (
    <>
      <div className='page-header' style={{ marginBottom: '8px' }}>
        <div className='add-item d-flex'>
          <div className='page-title'>
            <h4>Organogram</h4>
          </div>
        </div>

        <BreadcrumbNav
          items={[
            {
              text: 'Home',
              link: portalHome
            },
            {
              text: 'Organogram'
            }
          ]}
        />
      </div>

      {/* Default Nav Tabs */}
      <div className='row'>
        <div className='col-12 px-0'>
          <div className='card'>
            <div className='card-body'>
              <div className='d-flex justify-content-between align-items-center mb-3'>
                {/* Search - only visible in table/list view */}
                <div>
                  {showAll && (
                    <SDLSearch
                      placeholder='Search Organogram'
                      onSearch={value => {
                        // Search logic will be connected to the list view
                      }}
                      className='mb-0'
                        style={{
                          width: '330px',
                          minWidth: '330px',
                          maxWidth: '330px'
                        }}
                    />
                  )}
                </div>

                {/* Select + Toggle - always on the right */}
                <div className='d-flex align-items-center gap-3 ms-auto'>
                  <div style={{ width: '330px' }}>
                    <SDLReactSelect
                      value={selectedOrganogram}
                      options={orgonogramOptions}
                      onChange={handleSelectOrganogram}
                      placeholder='Select Organogram'
                      isClearable
                      isDisabled={loadingOrgonogram}
                      isLoading={loadingOrgonogram}
                      width='100%'
                    />
                  </div>

                  <ViewToggleButton
                    showAll={showAll}
                    onClick={handleToggleView}
                    disabled={loadingOrgonogram}
                  />
                </div>
              </div>
              <SDLTabsComponent
                tabs={tabs}
                selectedTab={selectedTab}
                onTabChange={handleTabChange}
                tabContent={
                  showAll && selectedTab === 'organogram' ? (
                    <OrganogramListView
                      data={orgonogram}
                      loading={loadingOrgonogram}
                      onEdit={handleSelectFromList}
                    />
                  ) : (
                    tabContent
                  )
                }
                loading={loadingOrgonogram}
              />
            </div>
          </div>
        </div>
      </div>
      {/* /Default Nav Tabs */}
    </>
  )
}

export default Organogram
