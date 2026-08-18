import { hrmsRequest } from "../../../services/request";
import { HRMS_API } from "../config/hrmsApiConfig";

/**
 * Load Company, Division and Department dropdowns
 */
export const getDivisionDocumentMappingInitialData = async () => {
  return hrmsRequest({
    url: HRMS_API.MASTERDATA.GET_DIVISION_DOC_MAPPING_DATA,
    method: "POST",
    data: {
      action: "initial",
    },
  });
};

/**
 * Load Designations based on Division + Department
 */
export const getDivisionDocumentMappingDesignations = async ({
  divisionId,
  departmentId,
}) => {
  return hrmsRequest({
    url: HRMS_API.MASTERDATA.GET_DIVISION_DOC_MAPPING_DATA,
    method: "POST",
    data: {
      action: "designations",
      divisionId,
      departmentId,
    },
  });
};

/**
 * Load document types + existing mapping
 */
export const getDivisionDocumentMappingData = async ({
  companyId,
  divisionId,
  departmentId,
  designationId,
}) => {
  return hrmsRequest({
    url: HRMS_API.MASTERDATA.GET_DIVISION_DOC_MAPPING_DATA,
    method: "POST",
    data: {
      action: "mapping",
      companyId,
      divisionId,
      departmentId,
      designationId,
    },
  });
};

/**
 * Load organization locations
 */
export const getOrganizationLocations = async () => {
  return hrmsRequest({
    url: HRMS_API.MASTERDATA.GET_DIVISION_DOC_MAPPING_DATA,
    method: "POST",
    data: {
      action: "orgLocations",
    },
  });
};

/**
 * Save Division Document Mapping
 */
export const saveDivisionDocumentMapping = async ({
  companyId,
  divisionId,
  departmentId,
  designationId,
  documentMappings,
}) => {
  return hrmsRequest({
    url: HRMS_API.MASTERDATA.SAVE_DIVISION_DOC_MAPPING,
    method: "POST",
    data: {
      action: "save",
      companyId,
      divisionId,
      departmentId,
      designationId,
      documentMappings,
    },
  });
};