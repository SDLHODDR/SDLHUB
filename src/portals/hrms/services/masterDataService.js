import { hrmsRequest } from "../../../services/request";
import { HRMS_API } from "../config/hrmsApiConfig";

export const getMasterTables = () =>
  hrmsRequest({
    url: HRMS_API.MASTERDATA.GET_MASTER_TABLES,
    method: "GET",
  });

export const getMasterData = (tabName) =>
  hrmsRequest({
    url: HRMS_API.MASTERDATA.GET_MASTER_DATA,
    method: "GET",
    params: {
      tab: tabName,
    },
  });

export const saveMasterData = async ({
  tabName,
  id = "",
  description,
}) => {
  return hrmsRequest({
    url: HRMS_API.MASTERDATA.SAVE_MASTER_DATA,
    method: "POST",
    data: {
      tabName,
      id,
      description,
    },
  });
};