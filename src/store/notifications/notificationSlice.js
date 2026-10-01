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
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchNotificationsRequest();
      if (response?.status === false) {
        return rejectWithValue(response.message || "Unable to load notifications.");
      }
      return getNotificationRows(response);
    } catch (error) {
      return rejectWithValue(error?.message || "Unable to load notifications.");
    }
  },
  {
    condition: (_, { getState }) =>
      ["idle", "failed"].includes(getState().notifications.status),
  },
);

export const markNotificationRead = createAsyncThunk(
  "notifications/markRead",
  async (id, { rejectWithValue }) => {
    try {
      const response = await markNotificationReadRequest({ ID: id });
      if (response?.status === false) {
        return rejectWithValue(response.message || "Unable to archive notification.");
      }
      return { id, viewedOn: new Date().toISOString() };
    } catch (error) {
      return rejectWithValue(error?.message || "Unable to archive notification.");
    }
  },
  {
    condition: (id, { getState }) =>
      !getState().notifications.markingReadIds.includes(String(id)),
  },
);

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getNotifications.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(getNotifications.fulfilled, (state, action) => {
        state.items = action.payload;
        state.status = "succeeded";
        refreshUnreadCount(state);
      })
      .addCase(getNotifications.rejected, (state, action) => {
        if (action.meta.condition) return;
        state.status = "failed";
        state.error = action.payload || action.error.message;
      })
      .addCase(markNotificationRead.pending, (state, action) => {
        state.markingReadIds.push(String(action.meta.arg));
      })
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const id = String(action.payload.id);
        state.markingReadIds = state.markingReadIds.filter((item) => item !== id);
        const notification = state.items.find(
          (item) => String(item.ID ?? item.id) === id,
        );
        if (notification) {
          notification.VIEWED_ON = action.payload.viewedOn;
          refreshUnreadCount(state);
        }
      })
      .addCase(markNotificationRead.rejected, (state, action) => {
        const id = String(action.meta.arg);
        state.markingReadIds = state.markingReadIds.filter((item) => item !== id);
        state.error = action.payload || action.error.message;
      });
  },
});

export default notificationSlice.reducer;