import { hrmsAPI } from "../../../services/api";
import { request } from "../../../services/request";

export const getMasterTables = () =>
  request({
    api: hrmsAPI,
    url: "/masterdata/master/getMasterTables.php",
    method: "GET",
  });

export const getMasterData = (tabName) =>
  request({
    api: hrmsAPI,
    url: "/masterdata/master/getMasterData.php",
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
  return request({
    api: hrmsAPI,
    url: "/masterdata/master/saveMasterData.php",
    method: "POST",
    data: {
      tabName,
      id,
      description,
    },
  });
};