import { eportalRequest } from "../../../services/request";
import { EPORTAL_API } from "../config/eportalApiConfig";

export const getMenu = () =>
  eportalRequest({
    url: EPORTAL_API.MENU.GET_MENU,
    method: "GET",
    dedupe: true,
    fallback: {
      status: false,
      menu: [],
    },
  });