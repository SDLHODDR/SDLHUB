import { eportalRequest } from "../../../services/request";
import { EPORTAL_API } from "../config/eportalApiConfig";

/* ============================================================
   GET CONFERENCE ROOMS
============================================================ */

export const getConferenceRoomMaintenance = () =>
  eportalRequest({
    url:
      EPORTAL_API.CONFERENCE_ROOM_MAINTAINANCE
        .GET_CONFERENCE_ROOM_MAINTAINANCE,

    method: "GET",

    dedupe: true,

    fallback: {
      status: false,
      data: [],
    },
  });


/* ============================================================
   UPDATE CONFERENCE ROOM
============================================================ */

export const saveConferenceRoom = (data) =>
  eportalRequest({
    url:
      EPORTAL_API.CONFERENCE_ROOM_MAINTAINANCE
        .SAVE_CONFERENCE_ROOM,

    method: "POST",

    data,

    fallback: {
      status: false,
      data: [],
    },
  });


/* ============================================================
   UPDATE ROOM STATUS
============================================================ */

export const updateConferenceRoomStatus = (data) =>
  eportalRequest({
    url:
      EPORTAL_API.CONFERENCE_ROOM_MAINTAINANCE
        .UPDATE_CONFERENCE_ROOM_STATUS,

    method: "POST",

    data,

    fallback: {
      status: false,
      data: [],
    },
  });