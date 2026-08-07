import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getCapabilities } from "../../portals/hrms/services/capablitiesService";

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

export const getCapabilitiesDataResponse = createAsyncThunk(
  "fetch/capabilities",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await getCapabilities(payload);
      console.log("========questionMasterSLice Response========", response);
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

export const maintainenceCPSlice = createSlice({
  name: "hrmscapabilitiesData",
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
      .addCase(getCapabilitiesDataResponse.pending, (state) => {
        state.loading = true;
        state.error = false;
      })
      .addCase(getCapabilitiesDataResponse.fulfilled, (state, action) => {
        //console.log(action);
        state.loading = false;
        state.data = action.payload || [];
        // Mark success true when payload contains data (array) or a truthy status
        if (Array.isArray(action.payload)) {
          state.success = action.payload.length > 0;
        } else {
          state.success = !!(action.payload && action.payload.status);
        }
        state.successMessage = "Data fetched successfully";
        state.status = "idle";
      })
      .addCase(getCapabilitiesDataResponse.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = true;
        state.errorCode = action.payload?.errorCode;
        state.errorMessage = action.payload?.errorMessage;
      });;
  },
});

export default maintainenceCPSlice.reducer;
export const { closeError, closeSuccess } = maintainenceCPSlice.actions;