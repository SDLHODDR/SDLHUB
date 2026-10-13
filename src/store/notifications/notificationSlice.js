import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  fetchNotifications as fetchNotificationsRequest,
  markNotificationRead as markNotificationReadRequest,
} from "../../services/notificationService";

const initialState = {
  items: [],
  unreadCount: 0,
  status: "idle",
  error: null,
  markingReadIds: [],
  portal: null,
  currentRequestId: null,
};

const getNotificationRows = (response) => {
  const payload = response?.data ?? response;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.results?.[0]?.items)) {
    return payload.results[0].items;
  }
  return [];
};

const isUnread = (item) => !(item.VIEWED_ON ?? item.viewed_on);

const refreshUnreadCount = (state) => {
  state.unreadCount = state.items.filter(isUnread).length;
};

export const getNotifications = createAsyncThunk(
  "notifications/getAll",
  async (portal, { rejectWithValue }) => {
    try {
      const response = await fetchNotificationsRequest(portal);
      if (response?.status === false) {
        return rejectWithValue(response.message || "Unable to load notifications.");
      }
      return getNotificationRows(response);
    } catch (error) {
      return rejectWithValue(error?.message || "Unable to load notifications.");
    }
  },
  {
    condition: (portal, { getState }) => {
      const state = getState().notifications;
      return !(
        state.portal === portal &&
        ["loading", "succeeded"].includes(state.status)
      );
    },
  },
);

export const markNotificationRead = createAsyncThunk(
  "notifications/markRead",
  async ({ id, portal }, { rejectWithValue }) => {
    try {
      const response = await markNotificationReadRequest({ ID: id, portal });
      if (response?.status === false) {
        return rejectWithValue(response.message || "Unable to archive notification.");
      }
      return { id, portal, viewedOn: new Date().toISOString() };
    } catch (error) {
      return rejectWithValue(error?.message || "Unable to archive notification.");
    }
  },
  {
    condition: ({ id, portal }, { getState }) =>
      !getState().notifications.markingReadIds.includes(`${portal}:${id}`),
  },
);

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getNotifications.pending, (state, action) => {
        if (state.portal !== action.meta.arg) {
          state.items = [];
          state.unreadCount = 0;
        }
        state.portal = action.meta.arg;
        state.currentRequestId = action.meta.requestId;
        state.status = "loading";
        state.error = null;
      })
      .addCase(getNotifications.fulfilled, (state, action) => {
        if (state.currentRequestId !== action.meta.requestId) return;
        state.items = action.payload;
        state.status = "succeeded";
        state.currentRequestId = null;
        refreshUnreadCount(state);
      })
      .addCase(getNotifications.rejected, (state, action) => {
        if (action.meta.condition || state.currentRequestId !== action.meta.requestId) return;
        state.status = "failed";
        state.currentRequestId = null;
        state.error = action.payload || action.error.message;
      })
      .addCase(markNotificationRead.pending, (state, action) => {
        const { id, portal } = action.meta.arg;
        state.markingReadIds.push(`${portal}:${id}`);
      })
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const { id, portal } = action.payload;
        const readKey = `${portal}:${id}`;
        state.markingReadIds = state.markingReadIds.filter((item) => item !== readKey);
        if (state.portal !== portal) return;
        const notification = state.items.find(
          (item) => String(item.ID ?? item.id) === String(id),
        );
        if (notification) {
          notification.VIEWED_ON = action.payload.viewedOn;
          refreshUnreadCount(state);
        }
      })
      .addCase(markNotificationRead.rejected, (state, action) => {
        const { id, portal } = action.meta.arg;
        const readKey = `${portal}:${id}`;
        state.markingReadIds = state.markingReadIds.filter((item) => item !== readKey);
        state.error = action.payload || action.error.message;
      });
  },
});

export default notificationSlice.reducer;