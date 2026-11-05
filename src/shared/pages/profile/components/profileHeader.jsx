import React, { useEffect, useRef, useState } from "react";

import { STOREIMAGES } from "../../../assets/assets";

import { uploadProfileImage } from "../../../services/profile/profileService";

import { notifySuccess, notifyError } from "../../../services/alertService";

const profileHeader = ({ profile = {}, onProfileImageUpdated }) => {
  /* =========================================================
     EMPLOYEE DATA
  ========================================================= */

  const emp = profile?.employee || {};

  /* =========================================================
     FILE INPUT
  ========================================================= */

  const fileInputRef = useRef(null);

  /* =========================================================
     DEFAULT IMAGE
  ========================================================= */

  const DEFAULT_PROFILE_IMAGE = STOREIMAGES?.PROFILE?.AVATAR_1 || "";

  const [imgSrc, setImgSrc] = useState(DEFAULT_PROFILE_IMAGE);

  /* =========================================================
     PROFILE IMAGE
  ========================================================= */

  useEffect(() => {
    const profileImage = emp?.profile_image || emp?.PROFILE_IMAGE || "";

    if (typeof profileImage === "string" && profileImage.trim() !== "") {
      setImgSrc(profileImage);
    } else {
      setImgSrc(DEFAULT_PROFILE_IMAGE);
    }
  }, [emp?.profile_image, emp?.PROFILE_IMAGE, DEFAULT_PROFILE_IMAGE]);

  /* =========================================================
     HELPERS
  ========================================================= */

  const getFullName = () => {
    const name = `${emp?.FNAME || ""}  ${emp?.LNAME || ""}`
      .replace(/\s+/g, " ")
      .trim();

    return name || "Employee Profile";
  }; //${emp?.MNAME || ''}

  const formatDOB = (dob) => {
    if (!dob) {
      return "";
    }

    try {
      const parts = String(dob).split("-");

      if (parts.length !== 3) {
        return dob;
      }

      const [day, mon, year] = parts;

      const monthIndex = new Date(`${mon} 1, 2000`).getMonth();

      const date = new Date(Number(year), monthIndex, Number(day));

      if (isNaN(date.getTime())) {
        return dob;
      }

      const weekday = date.toLocaleDateString("en-IN", {
        weekday: "long",
      });

      const month = date.toLocaleDateString("en-IN", {
        month: "long",
      });

      const getOrdinal = (d) => {
        if (d > 3 && d < 21) {
          return "th";
        }

        switch (d % 10) {
          case 1:
            return "st";

          case 2:
            return "nd";

          case 3:
            return "rd";

          default:
            return "th";
        }
      };

      return `${weekday}, ${day}${getOrdinal(Number(day))} ${month} ${year}`;
    } catch (error) {
      return dob;
    }
  };

  const getDesignation = () => {
    const department = emp?.DEPT_NAME || "";

    const designation = emp?.DESIG_NAME || "";

    return `${department} ${designation}`.replace(/\s+/g, " ").trim();
  };

  const getGender = (gender) => {
    if (gender === null || gender === undefined || gender === "") {
      return "";
    }

    return Number(gender) === 1 ? "Male" : "Female";
  };

  /* =========================================================
     IMAGE CLICK
  ========================================================= */

  const handleImageClick = (e) => {
    e?.preventDefault();

    fileInputRef.current?.click();
  };

  /* =========================================================
     IMAGE UPLOAD
  ========================================================= */

  const handleImageUpload = async (e) => {
    const file = e?.target?.files?.[0];

    if (!file) {
      return;
    }

    /* ================= VALIDATION ================= */

    if (!file.type.startsWith("image/")) {
      notifyError("Please select a valid image file.");

      e.target.value = "";

      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      notifyError("Profile image cannot exceed 5 MB.");

      e.target.value = "";

      return;
    }

    try {
      const formData = new FormData();

      formData.append("profile_image", file);

      const res = await uploadProfileImage(formData);

      if (!res?.status) {
        notifyError(res?.message || "Unable to update profile image.");

        return;
      }

      const updatedImage = res?.data?.image || res?.image || "";

      if (updatedImage) {
        setImgSrc(updatedImage);

        /* ================= UPDATE PARENT ================= */

        if (typeof onProfileImageUpdated === "function") {
          onProfileImageUpdated(updatedImage);
        }

        notifySuccess(res?.message || "Profile image updated successfully.");
      } else {
        notifySuccess("Profile image updated successfully.");
      }
    } catch (error) {
      console.error("PROFILE IMAGE UPLOAD ERROR:", error);

      notifyError(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to update profile image.",
      );
    } finally {
      /*
       * Allows selecting the same image again.
       */

      e.target.value = "";
    }
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div
      className="card"
      style={{
        minHeight: "402px",
      }}
    >
      {/* =====================================================
          PROFILE HEADER
      ===================================================== */}

      <div
        className="card-header rounded-0 d-flex align-items-center"
        style={{
          background: "linear-gradient(135deg, #ff9800, #ffb74d)",
          minHeight: "123px",
          padding: "18px 22px",
        }}
      >
        {/* ===================================================
            PROFILE IMAGE
        =================================================== */}

        <div
          className="me-3"
          style={{
            position: "relative",
            width: "80px",
            height: "80px",
            flexShrink: 0,
          }}
        >
          <span
            className="avatar avatar-xl avatar-rounded border border-white border-3"
            style={{
              width: "76px",
              height: "76px",
            }}
          >
            <img
              src={imgSrc}
              alt="Profile"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
              onError={() => {
                if (imgSrc !== DEFAULT_PROFILE_IMAGE) {
                  setImgSrc(DEFAULT_PROFILE_IMAGE);
                }
              }}
            />
          </span>

          {/* =================================================
              EDIT IMAGE
          ================================================= */}

          <a
            href="#"
            title="Change Image"
            onClick={handleImageClick}
            style={{
              position: "absolute",
              bottom: "0px",
              right: "0px",
              width: "30px",
              height: "30px",
              borderRadius: "50%",
              background: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
              textDecoration: "none",
              color: "#0d6efd",
              zIndex: 5,
            }}
          >
            <i className="ti ti-pencil"></i>
          </a>

          {/* =================================================
              HIDDEN FILE INPUT
          ================================================= */}

          <input
            ref={fileInputRef}
            type="file"
            hidden
            accept="image/*"
            onChange={handleImageUpload}
          />
        </div>

        {/* ===================================================
            NAME / DESIGNATION
        =================================================== */}

        <div className="me-3">
          <h3
            className="text-white mb-1"
            style={{
              fontSize: "23px",
              fontWeight: "600",
            }}
          >
            {getFullName()}
          </h3>

          <span
            className="badge bg-purple-transparent text-purple"
            style={{
              fontSize: "13px",
            }}
          >
            {getDesignation() || "Employee"}
          </span>
        </div>
      </div>

      {/* =====================================================
          EMPLOYEE DETAILS
      ===================================================== */}

      <div className="card-body">
        {/* ===================================================
            EMPLOYEE ID
        =================================================== */}

        <div className="d-flex align-items-center justify-content-between border-bottom pb-2 mb-2">
          <span className="d-inline-flex align-items-center">
            <i className="ti ti-id me-2"></i>
            Employee ID
          </span>

          <p className="text-dark mb-0">{emp?.EMP_CODE || "-"}</p>
        </div>

        {/* ===================================================
            DATE OF JOIN
        =================================================== */}

        <div className="d-flex align-items-center justify-content-between border-bottom pb-2 mb-2">
          <span className="d-inline-flex align-items-center">
            <i className="ti ti-calendar-check me-2"></i>
            Date Of Join
          </span>

          <p className="text-dark mb-0">{emp?.DOJ || "-"}</p>
        </div>

        {/* ===================================================
            MOBILE
        =================================================== */}

        <div className="d-flex align-items-center justify-content-between border-bottom pb-2 mb-2">
          <span className="d-inline-flex align-items-center">
            <i className="ti ti-phone me-2"></i>
            Mobile
          </span>

          <p className="text-dark mb-0">{emp?.CELL || "-"}</p>
        </div>

        {/* ===================================================
            OFFICE EMAIL
        =================================================== */}

        <div className="d-flex align-items-center justify-content-between border-bottom pb-2 mb-2">
          <span className="d-inline-flex align-items-center">
            <i className="ti ti-mail me-2"></i>
            Email (Off)
          </span>

          <p
            className="text-dark mb-0 text-end"
            style={{
              maxWidth: "220px",
              wordBreak: "break-word",
            }}
          >
            {emp?.COM_EMAIL || "-"}
          </p>
        </div>

        {/* ===================================================
            PERSONAL EMAIL
        =================================================== */}

        <div className="d-flex align-items-center justify-content-between border-bottom pb-2 mb-2">
          <span className="d-inline-flex align-items-center">
            <i className="ti ti-mail me-2"></i>
            Email (Per)
          </span>

          <p
            className="text-dark mb-0 text-end"
            style={{
              maxWidth: "220px",
              wordBreak: "break-word",
            }}
          >
            {emp?.PER_EMAIL || "-"}
          </p>
        </div>

        {/* ===================================================
            BIRTHDAY
        =================================================== */}

        <div className="d-flex align-items-center justify-content-between border-bottom pb-2 mb-2">
          <span className="d-inline-flex align-items-center">
            <i className="ti ti-calendar-check me-2"></i>
            Birthday
          </span>

          <p className="text-dark mb-0 text-end">
            {formatDOB(emp?.DOB) || "-"}
          </p>
        </div>

        {/* ===================================================
            GENDER
        =================================================== */}

        <div className="d-flex align-items-center justify-content-between">
          <span className="d-inline-flex align-items-center">
            <i className="ti ti-gender-bigender me-2"></i>
            Gender
          </span>

          <p className="text-dark mb-0">{getGender(emp?.GENDER) || "-"}</p>
        </div>
      </div>
    </div>
  );
};

export default profileHeader;
