import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getTelegramCounts } from "../../portals/telegram/services/telegramService";

const initialState = {
  groupCount: 0,
  memberCount: 0,
  pendingMessageCount: 0,
  loading: false,
  error: null,
  status: "idle",
};

export const fetchTelegramCounts = createAsyncThunk(
  "telegramCounts/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getTelegramCounts();
      return {
        groupCount: Number(response.GROUP_COUNT) || 0,
        memberCount: Number(response.MEMBER_COUNT) || 0,
        pendingMessageCount: Number(response.PENDING_MESSAGE_COUNT) || 0,
      };
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error?.message || "Unable to load Telegram counts.");
    }
  },
  {
    condition: (_, { getState }) => !getState().telegramCounts.loading,
  },
);

const telegramCountSlice = createSlice({
  name: "telegramCounts",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTelegramCounts.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.status = "loading";
      })
      .addCase(fetchTelegramCounts.fulfilled, (state, action) => {
        Object.assign(state, action.payload);
        state.loading = false;
        state.status = "succeeded";
      })
      .addCase(fetchTelegramCounts.rejected, (state, action) => {
        if (action.meta.condition) return;
        state.loading = false;
        state.status = "failed";
        state.error = action.payload || action.error.message;
      });
  },
});

export default telegramCountSlice.reducer;
