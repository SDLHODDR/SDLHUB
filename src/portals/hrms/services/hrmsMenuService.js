import { hrmsRequest } from "../../../services/request";
import { HRMS_API } from "../config/hrmsApiConfig";

export const getHrmsMenu = async () => {

  return hrmsRequest({
    url: HRMS_API.MENU.GET_MENU,
    method: "GET",
  });

};
