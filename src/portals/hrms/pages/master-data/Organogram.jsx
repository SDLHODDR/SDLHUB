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

import {
  getOrgonograms,
  //getProfileAccess,
  //saveProfileAccess,
} from "../../services/orgonogramService";

import { getPortalFromPath } from "../../../../config/portalConfig";
import "../../assets/profileMaintenance.css";

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

        const res = await getOrgonograms();

        if (res?.status) {
          const profileList = Array.isArray(res.data) ? res.data : [];

          setOrgonogram(profileList);

          /*
           * Automatically select first profile.
           */

          if (profileList.length > 0) {
            const firstProfile = profileList[0];

            const firstProfileId =
              firstProfile.id ??
              firstProfile.profileId ??
              firstProfile.PROFILE_ID;

            setSelectedOrgonogram(firstProfileId);
          } else {
            setSelectedOrgonogram(null);
          }
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

  /* ==========================================================
      PROFILE DROPDOWN OPTIONS
  ========================================================== */

  const orgonogramOptions = useMemo(() => {
    return orgonogram.map((orgngm) => ({
      label:
        orgngm.description ??
        orgngm.profileDesc ??
        orgngm.PROFILE_DESC ??
        orgngm.label ??
        "",

      value: orgngm.id ?? orgngm.orgonogramId ?? orgngm.ORGONOGRAM_ID,
    }));
  }, [orgonogram]);

  /* ==========================================================
      RENDER
  ========================================================== */

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

      {/* ======================================================
          MAIN CARD
      ====================================================== */}
      <div className="card hrms-profile-maintenance">
        <div className="card-body">
          {/* ==================================================
              PROFILE SELECT
        ================================================== */}

          <div className="row align-items-center mb-4">
            <div className="col-lg-4 col-md-6">
              <Dropdown
                value={selectedOrganogram}
                options={orgonogramOptions}
                onChange={(e) => setSelectedOrgonogram(e.value)}
                placeholder="Select Orgonogram"
                className="w-100"
                showClear
                filter
                disabled={loadingOrgonogram || saving}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Organogram;
