import { useEffect, useState, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { Dropdown } from "primereact/dropdown";

import BreadcrumbNav from "../../../eportal/components/breadcrumb-nav/BreadcrumbNav";

import {
  //notifySuccess,
  notifyError,
  //notifyWarning,
  //confirmAction,
} from "../../../../services/alertService";

import SDLTabsComponent from "../../components/tabs/SDLTabsComponent";
import useSDLTabComponentHandler from "../../portalutils/useSDLTabComponentHandler";

import {
  getOrgonograms,
  //getProfileAccess,
  //saveProfileAccess,
} from "../../services/orgonogramService";

import { getPortalFromPath } from "../../../../config/portalConfig";
import "../../assets/css/profileMaintenance.css";

const Organogram = () => {
  /* ==========================================================
      PORTAL
  ========================================================== */
  const location = useLocation();
  const portal = getPortalFromPath(location.pathname);
  const portalHome = `/${portal.key}/dashboard`;

  const [loadingOrgonogram, setLoadingOrgonogram] = useState(false);

  /* ==========================================================
      STATE
  ========================================================== */
  const [selectedOrganogram, setSelectedOrgonogram] = useState(null);
  const [orgonogram, setOrgonogram] = useState([]);

  /* ==========================================================
        LOAD PROFILES
    ========================================================== */

  useEffect(() => {
    const loadOrgonogram = async () => {
      try {
        setLoadingOrgonogram(true);
        const userConfig = localStorage.getItem("user-hrms-config");

        const res = await getOrgonograms(userConfig);

        if (res?.status) {
          const orgonoList = Array.isArray(res.data) ? res.data : [];

          setOrgonogram(orgonoList);

          setSelectedOrgonogram(null);
        } else {
          notifyError(res?.message || "Unable to load profiles.");
        }
      } catch (error) {
        console.error("Load profiles error:", error);

        notifyError(error?.message || "Unable to load profiles.");
      } finally {
        setLoadingOrgonogram(false);
      }
    };

    loadOrgonogram();
  }, []);

  const orgonogramOptions = useMemo(() => {
    return orgonogram.map((orgngm) => ({
      label: orgngm.OPTIONS ?? "",

      value: orgngm.ID,
    }));
  }, [orgonogram]);

  const { tabs, selectedTab, handleTabChange, tabContent } =
    useSDLTabComponentHandler(selectedOrganogram);


  return (
    <>
      {/* ======================================================
          PAGE HEADER
      ====================================================== */}

      <div className="page-header">
        <div className="add-item d-flex">
          <div className="page-title">
            <h4>Organogram</h4>
          </div>
        </div>

        <BreadcrumbNav
          items={[
            {
              text: "Home",
              link: portalHome,
            },
            {
              text: "Organogram",
            },
          ]}
        />
      </div>

      {/* Default Nav Tabs */}
      <div className="row">
        <div className="col-xl-12">
          <div className="card">
            <div className="card-header">
              <div className="card-title ms-auto" style={{ width: '270px' }}>
                <Dropdown
                  value={selectedOrganogram}
                  options={orgonogramOptions}
                  onChange={(e) => setSelectedOrgonogram(e.value)}
                  placeholder="Select Orgonogram"
                  className="w-100"
                  showClear
                  filter
                  disabled={loadingOrgonogram}
                />
              </div>
            </div>
            <div className="card-body">
              <SDLTabsComponent
                tabs={tabs}
                selectedTab={selectedTab}
                onTabChange={handleTabChange}
                tabContent={tabContent}
                loading={loadingOrgonogram}
              />
            </div>
          </div>
        </div>
      </div>
      {/* /Default Nav Tabs */}
    </>
  );
};

export default Organogram;
