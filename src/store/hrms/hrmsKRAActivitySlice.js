import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { kraActivityFetchData } from "../../portals/hrms/services/kraActivityService";

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

export const getKRAActivityDataResponse = createAsyncThunk(
  "fetch/kraactivity",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await kraActivityFetchData(payload);
      console.log("========hrmsKraActivitySLice Response========", response);
      if(!response.status) {
        return rejectWithValue({
          errorCode: response.status,
          errorMessage: response.message,
        });
      }
      
      return response.data; // { status: true, tasks: [...] }
    } catch (error) {
      return rejectWithValue({
        errorCode: error?.response?.status || -1,
        errorMessage: error?.message || "Something went wrong",
      });
    }
  },
);

export const maintainenceKRASlice = createSlice({
  name: "hrmsKRAAcivityData",
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
      .addCase(getKRAActivityDataResponse.pending, (state) => {
        state.loading = true;
        state.error = false;
      })
      .addCase(getKRAActivityDataResponse.fulfilled, (state, action) => {
        //console.log(action);
        state.loading = false;
        state.data = action.payload || [];
        state.success = !!action.payload.status;
        state.successMessage = "Data fetched successfully";
        state.status = "idle";
        state.authFor = "outdoorduty";
      })
      .addCase(getKRAActivityDataResponse.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = true;
        state.errorCode = action.payload?.errorCode;
        state.errorMessage = action.payload?.errorMessage;
      });;
  },
});

export default maintainenceKRASlice.reducer;
export const { closeError, closeSuccess } = maintainenceKRASlice.actions;