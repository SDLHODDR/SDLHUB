import { request } from "../../../services/request";
import { HRMS_API } from "../config/hrmsApiConfig";

export const getHrmsMenu = async () => {

  return request({
    url: HRMS_API.MENU.GET_MENU,
    method: "GET",
  });

};
