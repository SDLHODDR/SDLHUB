import { eportalAPI, secureAPI } from "./api";

export const request = async (config) => {
  const instance = config.isEportal
    ? eportalAPI
    : secureAPI;

  const res = await instance.request(config);
  return res.data;
};
