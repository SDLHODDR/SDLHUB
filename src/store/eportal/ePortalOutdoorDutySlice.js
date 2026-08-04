import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { outDoorDutyFetchData } from "../../portals/eportal/services/outdoorDutyService";

const initialState = {
  data: [],           // this will hold the `tasks` array
  error: false,
  errorCode: "",
  errorMessage: "",
  loading: false,
  success: false,
  successMessage: "",
  status: false,
  authFor: "outdoorduty"
};

export const getOutdoorDutyDataResponse = createAsyncThunk(
  "fetch/oddatatable",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await outDoorDutyFetchData(payload);
      console.log("========eportalOutDoorDutySLice Response========", response);
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

export const myActivitiesODSlice = createSlice({
  name: "eportalODData",
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
      .addCase(getOutdoorDutyDataResponse.pending, (state) => {
        state.loading = true;
        state.error = false;
      })
      .addCase(getOutdoorDutyDataResponse.fulfilled, (state, action) => {
        //console.log(action);
        state.loading = false;
        state.data = action.payload || [];
        state.success = !!action.payload.status;
        state.successMessage = "Data fetched successfully";
        state.status = "idle";
        state.authFor = "outdoorduty";
      })
      .addCase(getOutdoorDutyDataResponse.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = true;
        state.errorCode = action.payload?.errorCode;
        state.errorMessage = action.payload?.errorMessage;
      });;
  },
});

export default myActivitiesODSlice.reducer;
export const { closeError, closeSuccess } = myActivitiesODSlice.actions;