import { hrmsRequest } from "../../../services/request";
import { HRMS_API } from "../config/hrmsApiConfig";

export const getOrgonograms = async (payload = {}) => {
  return hrmsRequest({
    url: HRMS_API.MASTERDATA.GET_ORGANOGRAM_DATA,
    method: "POST",
    data: payload,
  });
};

export const getHRMSConfigs = () => 
  hrmsRequest({
    url: HRMS_API.MASTERDATA.GET_HRMS_CONFIGS,
    method: "GET",
  });

export const getFinEntities = async (payload = {}) => {
  return hrmsRequest({
    url: HRMS_API.MASTERDATA.GET_FIN_ENTITY,
    method: "POST",
    data: payload,
  });
};

export const getCompanies = async (payload = {}) => {
  return hrmsRequest({
    url: HRMS_API.MASTERDATA.GET_COMPANY,
    method: "POST",
    data: payload,
  });
};

export const getDepartments = async (payload = {}) => {
  return hrmsRequest({
    url: HRMS_API.MASTERDATA.GET_DEPARTMENT,
    method: "POST",
    data: payload,
  });
};

// Filtered by DEPARTMENT_ID
export const getDesignations = async (payload = {}) => {
  return hrmsRequest({
    url: HRMS_API.MASTERDATA.GET_DESIGNATION,
    method: "POST",
    data: payload,
  });
};

// Filtered by DESIGNATION_ID
export const getJDLabels = async (payload = {}) => {
  return hrmsRequest({
    url: HRMS_API.MASTERDATA.GET_JD_LABEL,
    method: "POST",
    data: payload,
  });
};

export const getDivisions = async (payload = {}) => {
  return hrmsRequest({
    url: HRMS_API.MASTERDATA.GET_DIVISION,
    method: "POST",
    data: payload,
  });
};

export const getEmployeeLevels = async (payload = {}) => {
  return hrmsRequest({
    url: HRMS_API.MASTERDATA.GET_EMPLOYEE_LEVEL,
    method: "POST",
    data: payload,
  });
};

export const getOrganogramLevels = async (payload = {}) => {
  return hrmsRequest({
    url: HRMS_API.MASTERDATA.GET_ORGANOGRAM_LEVEL,
    method: "POST",
    data: payload,
  });
};

export const saveOrganogram = async (payload = {}) => {
  return hrmsRequest({
    url: HRMS_API.MASTERDATA.SAVE_ORGANOGRAM,
    method: "POST",
    data: payload,
  });
};

export const getOrganogramDetails = async (payload = {}) => {
  return hrmsRequest({
    url: HRMS_API.MASTERDATA.GET_ORGANOGRAM_DETAILS,
    method: "POST",
    data: payload,
  });
};

// Fetch saved location rows for a given organogram
export const getOrganogramLocations = async (params = {}) => {
  return hrmsRequest({
    url: HRMS_API.MASTERDATA.GET_ORGANOGRAM_LOCATIONS,
    method: "POST",
    data: params,
  });
};

// Fetch division info by ID — mirrors:
// select * from hr_divisions where divsn_id = ?
// NOTE: guessed endpoint constant name/path — replace with the real one.
export const getHrDivision = async (payload = {}) =>
  hrmsRequest({
    url: HRMS_API.MASTERDATA.GET_ORGANOGRAM_DIVISION,
    method: "POST",
    data: payload,
  });

// Geo location dropdown options
export const getOrganogramGeoLocations = () => 
  hrmsRequest({
    url: HRMS_API.MASTERDATA.GET_ORGANOGRAM_GEOLOCATIONS,
    method: "GET",
  });


// Employee dropdown options (used for both Employee and Report To)
export const getOrganogramEmployees = () => 
  hrmsRequest({
    url: HRMS_API.MASTERDATA.GET_ORGANOGRAM_EMPLOYEES,
    method: "GET",
  });

// Save/update a single location row (inline edit)
export const saveOrganogramLocation = async (payload = {}) => {
  return hrmsRequest({
    url: HRMS_API.MASTERDATA.SAVE_ORGANOGRAM_LOCATION,
    method: "POST",
    data: payload,
  });
}

// Geo mapping options for EMP_LEVEL != 15, mirrors:
// select hgm.GEO_ID, hgm.geo_desc||'('||hgm.geo_label||')' as GEO_DETAILS
// from HR_SFM_NEW_GEO_MAPPING hgm
// inner join hr_divisions hd on hd.divsn_id = hgm.divsn_id
// inner join HR_SFM_NEW_EMP_LEVELS hel on hel.levl = hgm.geo_lvl
// where hel.levl = ? and hd.divsn_id = ?
// and to_date(?) between hgm.effec_from and nvl(effec_to, '01-Mar-3000')
// NOTE: guessed endpoint path — replace with the real one.
export const getGeoMappingOptions = async (payload = {}) =>
  hrmsRequest({
    url: HRMS_API.MASTERDATA.GET_ORG_GEO_MAPPING_OPTIONS,
    method: "POST",
    data: payload, // { EMP_LEVEL, DIVSN_ID, EFFEC_FROM }
  });

// Reporting manager chain for a single org_loc row, mirrors the PHP block:
// hr_org_loc_parent (with sysdate + EFFEC_FROM fallback) -> get_emp_mgr /
// get_org_loc_mgr -> GET_ORGLOC_DESIG -> getEmpInfoByCode
// NOTE: guessed endpoint path/params — replace with the real one.
export const getOrgLocReportingManager = (params) =>
  hrmsRequest({
    url: HRMS_API.MASTERDATA.GET_ORG_LOC_REPORTING_MANAGER,
    method: "POST",
    data: params, // { LOC_ID, EMP_CODE, EFFEC_FROM }
  });