import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { eportalAPI } from "../../../shared/services/api";
import { EPORTAL_API } from "../config/eportalApiConfig";
import { getErrorMessage, isCancelledError } from "../../../shared/services/errorHandler";

const initialState = {
  data: [],           // this will hold the `tasks` array
  error: false,
  errorCode: "",
  errorMessage: "",
  loading: false,
  success: false,
  successMessage: "",
  status: false,
};

export const getAuthDataResponse = createAsyncThunk(
  "fetch/authdatatable",
  async (payload, { rejectWithValue, signal }) => {
    try {
      const response = await eportalAPI.post(
      EPORTAL_API.AUTHORIZATION.TASKTABLEDATA, 
      payload, 
      {
        withCredentials: true,
        signal, // cancelled when the page closes or loads another list
      });

      if (response.status !== 200) {
        return rejectWithValue({
          errorCode: response.status,
          errorMessage: response.statusText,
          userMessage: "Unable to load authorization requests.",
        });
      }
      
    return response.data; // { status: true, tasks: [...] }
    } catch (error) {
      return rejectWithValue({
        errorCode: error?.response?.status || -1,
        errorMessage: error?.message || "Something went wrong",
        cancelled: isCancelledError(error),
        userMessage: getErrorMessage(error, "Unable to load authorization requests."),
      });
    }
  },
);

export const myActivitiesAuthSlice = createSlice({
  name: "eportalAuthData",
  initialState,
  reducers: {
    closeError: (state) => {
      state.error = false;
      state.errorMessage = "";
      state.errorCode = "";
    },
    closeSuccess: (state) => {
      state.success = false;
      state.successMessage = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAuthDataResponse.pending, (state) => {
        state.loading = true;
        state.error = false;
      })
      .addCase(getAuthDataResponse.fulfilled, (state, action) => {

        state.loading = false;
        state.data = action.payload.tasks || [];
        state.page = action.payload.page;
        state.limit = action.payload.limit;
        state.totalRecords = action.payload.totalRecords;
        state.success = !!action.payload.status;
        state.successMessage = "Data fetched successfully";
        state.status = "idle";
      })
      .addCase(getAuthDataResponse.rejected, (state, action) => {
        // A cancelled load was replaced by a newer one (or the page closed):
        // leave loading/error to that newer load.
        if (action.meta.aborted || action.payload?.cancelled) return;
        state.loading = false;
        state.success = false;
        state.error = true;
        state.errorCode = action.payload?.errorCode;
        state.errorMessage = action.payload?.errorMessage;
      });
  },
});

export default myActivitiesAuthSlice.reducer;
export const { closeError, closeSuccess } = myActivitiesAuthSlice.actions;
