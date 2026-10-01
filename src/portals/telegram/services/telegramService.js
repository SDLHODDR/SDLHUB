import { getMockGroups } from "./mockData";

import { telegramPSRAPI } from "../../../services/api";
import { PORTALAPI } from "../../../services/apiConfig";

export const getMockDataGroups = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(getMockGroups());
    }, 300);
  });
};

export const getGroups = async (payload = {}) => {
  const res = await telegramPSRAPI.post(
		PORTALAPI.TELEGRAM.GROUPS.LIST,
    payload,
    {
      withCredentials: true
    }
  );
  
  return res.data || { data: [], total: 0 };
};

export const saveBroadCastMessage = async ( payload = {} ) => {
  const res = await telegramPSRAPI.post(
		PORTALAPI.TELEGRAM.GROUPS.SAVE_BROADCAST_MESSAGE,
    payload,
    {
      withCredentials: true,
    }
  );

  return res.data;
};

// ========================================
// CREATE GROUP
// ========================================

export const createGroup = async (payload = {}) => {
	const res = await telegramPSRAPI.post(
		PORTALAPI.TELEGRAM.GROUPS.CREATE,
		payload,
		{
			withCredentials: true,
		}
	);

	return res.data || {};
};

// ========================================
// GET DIVISIONS
// ========================================

export const getDivisions = async (payload = {}) => {
	const res = await telegramPSRAPI.post(
		PORTALAPI.TELEGRAM.GROUPS.DIVISIONS,
		payload,
		{
			withCredentials: true,
		}
	);

	return res.data || {};
};

// ========================================
// GET DIVISIONS
// ========================================

export const getCompanies = async (payload = {}) => {
	const res = await telegramPSRAPI.post(
		PORTALAPI.TELEGRAM.GROUPS.COMPANIES,
		payload,
		{
			withCredentials: true,
		}
	);

	return res.data || {};
};

// ========================================
// GET Departments
// ========================================

export const getDepartments = async (payload = {}) => {
	const res = await telegramPSRAPI.post(
		PORTALAPI.TELEGRAM.GROUPS.DEPARTMENTS,
		payload,
		{
			withCredentials: true,
		}
	);

	return res.data || {};
};

// ========================================
// GET HQ BY DIVISION
// ========================================

export const getHQByDivision = async (payload = {}) => {
	const res = await telegramPSRAPI.post(
		PORTALAPI.TELEGRAM.GROUPS.HQ,
		payload,
		{
			withCredentials: true,
		}
	);

	return res.data || {};
};