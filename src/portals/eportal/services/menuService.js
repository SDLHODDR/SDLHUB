import { eportalAPI } from "../../../services/api";
import { EPORTAL_API } from "../config/eportalApiConfig";


export const getMenu = async () => {
  const res = await eportalAPI.get(EPORTAL_API.MENU.GET_MENU);
  return res.data;
};

