import { useState, useEffect } from "react";

import { getProfile } from "../../services/profile/profileService";

import { notifyError } from "../../services/alertService";

import ProfileHeader from "./components/profileHeader";

import PersonalDetailsTab from "./components/personaldetails/personalDetailsTab";
import OfficeDetailsTab from "./components/officedetails/officeDetailsTab";
import BankDetailsTab from "./components/bankdetails/bankDetailsTab";
import FamilyDetailsTab from "./components/familydetails/familyDetailsTab";

const profile = () => {
  /* =========================================================
     STATE
  ========================================================= */

  const [activeTab, setActiveTab] = useState("personal");

  const [profile, setProfile] = useState(null);

  const [loading, setLoading] = useState(true);

  /* =========================================================
     LOAD PROFILE
  ========================================================= */

  const loadProfile = async () => {
    try {
      const res = await getProfile();

      if (res?.status) {
        const data = res?.data || {};

        const emp = data?.employee || {};

        setProfile({
          ...data,

          employee: {
            ...emp,

            profile_image:
              typeof emp?.PROFILE_IMAGE === "string"
                ? emp.PROFILE_IMAGE
                : emp?.PROFILE_IMAGE?.image || emp?.profile_image || null,
          },
        });
      } else {
        notifyError(res?.message || "Unable to load profile.");
      }
    } catch (error) {
      console.error("PROFILE LOAD ERROR:", error);

      notifyError(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to load profile.",
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {
    loadProfile();

    /*
     * Keep the same auto-refresh behavior
     * from your old profile page.
     */

    const interval = setInterval(loadProfile, 30000);

    return () => clearInterval(interval);
  }, []);

  /* =========================================================
     PROFILE IMAGE UPDATED
  ========================================================= */

  const handleProfileImageUpdated = (updatedImage) => {
    setProfile((prev) => {
      if (!prev) {
        return prev;
      }

      return {
        ...prev,

        employee: {
          ...prev.employee,

          profile_image: updatedImage,
        },
      };
    });
  };

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="content">
          <div className="text-center py-5">
            <span
              className="spinner-border spinner-border-sm me-2"
              role="status"
              aria-hidden="true"
            ></span>
            Loading profile...
          </div>
        </div>
      </div>
    );
  }

  /* =========================================================
     NO DATA
  ========================================================= */

  if (!profile || !profile.employee) {
    return (
      <div className="page-wrapper">
        <div className="content">
          <div className="alert alert-warning">
            Unable to load employee profile.
          </div>
        </div>
      </div>
    );
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <>
      {/* =====================================================
            PAGE HEADER
        ===================================================== */}

      <div className="page-header">
        <div className="add-item d-flex">
          <div className="page-title">
            <h4>Profile</h4>
            <h6>Manage your profile</h6>
          </div>
        </div>

        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <a href="#">Home</a>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              Profile
            </li>
          </ol>
        </nav>
      </div>

      {/* =====================================================
            MAIN PROFILE AREA
        ===================================================== */}

      <div className="row">
        {/* ===================================================
              LEFT SIDE - PROFILE HEADER
          =================================================== */}

        <div className="col-xl-4 col-lg-4">
          <ProfileHeader
            profile={profile}
            onProfileImageUpdated={handleProfileImageUpdated}
          />
        </div>

        {/* ===================================================
              RIGHT SIDE - TABS
          =================================================== */}

        <div className="col-xl-8 col-lg-8">
          <div
            className="card"
            style={{
              minHeight: "402px",
            }}
          >
            {/* =================================================
                  TABS HEADER
              ================================================= */}

            <div className="card-header p-0">
              <ul className="nav nav-tabs nav-tabs-bottom border-bottom mb-0">
                {/* =============================================
                      PERSONAL
                  ============================================= */}

                <li className="nav-item">
                  <button
                    type="button"
                    className={`nav-link ${
                      activeTab === "personal" ? "active" : ""
                    }`}
                    onClick={() => setActiveTab("personal")}
                  >
                    Personal Details
                  </button>
                </li>

                {/* =============================================
                      FAMILY
                  ============================================= */}

                <li className="nav-item">
                  <button
                    type="button"
                    className={`nav-link ${
                      activeTab === "family" ? "active" : ""
                    }`}
                    onClick={() => setActiveTab("family")}
                  >
                    Family Details
                  </button>
                </li>

                {/* =============================================
                      OFFICE
                  ============================================= */}

                <li className="nav-item">
                  <button
                    type="button"
                    className={`nav-link ${
                      activeTab === "office" ? "active" : ""
                    }`}
                    onClick={() => setActiveTab("office")}
                  >
                    Office Details
                  </button>
                </li>

                {/* =============================================
                      BANK
                  ============================================= */}

                <li className="nav-item">
                  <button
                    type="button"
                    className={`nav-link ${
                      activeTab === "bank" ? "active" : ""
                    }`}
                    onClick={() => setActiveTab("bank")}
                  >
                    Bank & Other Details
                  </button>
                </li>
              </ul>
            </div>

            {/* =================================================
                  TAB CONTENT
              ================================================= */}

            <div className="card-body">
              {/* ===============================================
                    PERSONAL DETAILS
                =============================================== */}

              {activeTab === "personal" && (
                <PersonalDetailsTab
                  profile={profile}
                  onProfileUpdated={loadProfile}
                />
              )}

              {/* ===============================================
                    FAMILY DETAILS
                =============================================== */}

              {activeTab === "family" && ( <FamilyDetailsTab profile={profile} setProfile={setProfile} /> )}

              {/* ===============================================
                    OFFICE DETAILS
                =============================================== */}

             {activeTab === "office" && <OfficeDetailsTab profile={profile} />}

              {/* ===============================================
                    BANK DETAILS
                =============================================== */}

             {activeTab === "bank" && (<BankDetailsTab profile={profile} />)}
     
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default profile;
