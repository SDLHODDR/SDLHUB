import { eportalRequest } from "../../../services/request";
import { EPORTAL_API } from "../config/eportalApiConfig";
import { downloadFile } from "../../../services/downloadFile";

/* ============================
   GET CONFERENCE ROOMS
============================ */

export const getConferenceRooms = ({ page = 1, limit = 10 } = {}) =>
  eportalRequest({
    url: EPORTAL_API.CONFERENCE_ROOM.GET_CONFERENCE_ROOM_BOOKINGS,
    method: "GET",
    dedupe: true,
    params: {
      page,
      limit,
    },
    fallback: {
      status: false,
      data: [],
    },
  });

/* ============================
   APPROVE BOOKING
============================ */

export const authCBRData = (payload = {}) =>
  eportalRequest({
    url: EPORTAL_API.CONFERENCE_ROOM.AUTHCBRData,
    method: "POST",
    dedupe: true,
    data: payload,
  });

/* ============================
   REJECT BOOKING
============================ */

export const rejectCBRData = (payload = {}) =>
  eportalRequest({
    url: EPORTAL_API.CONFERENCE_ROOM.REJECTCBRData,
    method: "POST",
    dedupe: true,
    data: payload,
  });

/* ============================
   BOOKING DROPDOWNS
============================ */

export const getBookingDropdownData = () =>
  eportalRequest({
    url: EPORTAL_API.CONFERENCE_ROOM.GET_BOOKING_DROPDOWN_DATA,
    method: "GET",
    dedupe: true,
    fallback: {
      status: false,
      data: [],
    },
  });

/* ============================
   CONFERENCE ROOM OPTIONS
============================ */

export const getConferenceRoomOptions = () =>
  eportalRequest({
    url: EPORTAL_API.CONFERENCE_ROOM.GET_BOOKING_AUTHDROPDOWN_DATA,
    method: "GET",
    dedupe: true,
    fallback: {
      status: false,
      data: [],
    },
  });

/* ============================
   CONFERENCE ACTION
============================ */

export const conferenceAction = (payload) =>
  eportalRequest({
    url: EPORTAL_API.CONFERENCE_ROOM.CONFERENCE_ACTION,
    method: "POST",
    dedupe: true,
    data: payload,
  });

/* ============================
   YEARLY BOOKINGS
============================ */

export const getConferenceYearlyBookings = () =>
  eportalRequest({
    url: EPORTAL_API.CONFERENCE_ROOM.CONFERENCE_YEARLY,
    method: "GET",
    dedupe: true,
    fallback: {
      status: false,
      data: [],
    },
  });

/* ============================
   EXPORT BOOKINGS (BLOB)
============================ */

export const exportToExcelCBRData = async (ids = []) => {
  const response = await eportalRequest({
    url: EPORTAL_API.CONFERENCE_ROOM.EXPORT_CONFERENCE_BOOKING_DATA,
    method: "POST",
    dedupe: true,
    data: { ids },
    responseType: "blob",
  });

  downloadFile(response, "Conference_Bookings.xlsx");
};
/* ============================
   EXPORT BOOKINGS (BLOB)
============================ 
export const exportToExcelCBRData = async (ids = []) => {
  try {
    const response = await eportalAPI.post(
      EPORTAL_API.CONFERENCE_ROOM.EXPORT_CONFERENCE_BOOKING_DATA,
      { ids },
      {
        responseType: "blob",
      }
    );

    const url = window.URL.createObjectURL(response.data);

    const link = document.createElement("a");
    link.href = url;
    link.download = "Conference_Bookings.xlsx";

    document.body.appendChild(link);
    link.click();

    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error("Export conference booking error:", err);
    throw err;
  }
};*/
