import { eportalAPI } from "../../../services/api";
import { EPORTAL_API } from "../config/eportalApiConfig";

export const getConferenceRooms = async ({
  page = 1,
  limit = 10,
} = {}) => {
  try {
    const res = await eportalAPI.get(
      EPORTAL_API.CONFERENCE_ROOM.GET_CONFERENCE_ROOM_BOOKINGS,
      {
        params: {
          page,
          limit,
        },
        withCredentials: true,
      }
    );

    return res.data;
  } catch (error) {
    console.error("Error fetching conference room data:", error);
    throw error;
  }
};

export const authCBRData = async (payload = {}) => {
  const res = await eportalAPI.post(
    EPORTAL_API.CONFERENCE_ROOM.AUTHCBRData,
    payload,
    {
      withCredentials: true
    }
  );
  
  return res.data || [];
};

export const rejectCBRData = async (payload = {}) => {
  const res = await eportalAPI.post(
    EPORTAL_API.CONFERENCE_ROOM.REJECTCBRData,
    payload,
    {
      withCredentials: true
    }
  );
  
  return res.data || [];
};

export const getBookingDropdownData = async () => {
  const res = await eportalAPI.get(
      EPORTAL_API.CONFERENCE_ROOM.GET_BOOKING_DROPDOWN_DATA,
      {
        withCredentials: true // important if using PHP session
      }
    );

  return res.data;
};


export const getConferenceRoomOptions = async () => {
  const res = await eportalAPI.get(
      EPORTAL_API.CONFERENCE_ROOM.GET_BOOKING_AUTHDROPDOWN_DATA,
      {
        withCredentials: true // important if using PHP session
      }
    );

  return res.data;
};

export const conferenceAction = async (payload) => {
  try {
    const res = await eportalAPI.post(
      EPORTAL_API.CONFERENCE_ROOM.CONFERENCE_ACTION,
      payload,
      {
        withCredentials: true
      }
    );
    return res.data;

  } catch (error) {
    console.error("Conference action error:", error);
    throw error;
  }
};

export const getConferenceYearlyBookings = async () => {

  try {

    const res = await eportalAPI.get(
      EPORTAL_API.CONFERENCE_ROOM.CONFERENCE_YEARLY,
      { withCredentials: true }
    );

    return res.data;

  } catch (error) {
    console.error("Yearly conference fetch error:", error);
    throw error;
  };
};

export const exportToExcelCBRData = async (ids = []) => {
  try {    
    const response = await eportalAPI.post(      
      EPORTAL_API.CONFERENCE_ROOM.EXPORT_CONFERENCE_BOOKING_DATA,
      { ids },
      {
        responseType: "blob",
      }
    );

    const url = window.URL.createObjectURL(new Blob([response.data]));

    const link = document.createElement("a");
    link.href = url;
    link.download = "Conference_Bookings.xlsx";

    document.body.appendChild(link);
    link.click();

    link.remove();
    window.URL.revokeObjectURL(url);

  } catch (err) {
    console.error(err);
  }
};

