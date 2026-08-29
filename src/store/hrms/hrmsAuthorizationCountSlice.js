import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchHRMSAuthorizationData } from "../../services/authorizationService";

const initialState = {
  status: false,
  error: false,
  errorCode: "",
  errorMessage: "",
  success: false,
  successMessage: "",
  data: [],
  totalRecords: 0,
  subtotal: 0,
};

export const getHRMSAuthroizationTaskCount = createAsyncThunk(
  "fetch/authorizationHRMSCount",
  async (payload) => {
    try {
      const response = await fetchHRMSAuthorizationData(payload);
      console.log("========authorizationDataSLice Response========", response);
      if(!response.status) {
        return {
          response: "error",
          error: true,
          errorCode: -1,
          errorMessage: response.message,
        };
      }

      return response.data;
    } catch (error) {
      return {
          response: "error",
          error: true,
          errorCode: -1,
          errorMessage: error,
        };
    }
  }, 
); 

export const hrmsAuthorizationCountSlice = createSlice({
  name: "hrmsAuthCounts",
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
      .addCase(getHRMSAuthroizationTaskCount.pending, (state) => {
        state.loading = true;
      })
      .addCase(getHRMSAuthroizationTaskCount.fulfilled, (state, action) => {
        //console.log(action);
        state.data = action.payload.taskscnt;
        state.success = action.payload.success;        
        state.successMessage = "Data fetched successfully";
        state.status = "idle";
      })
      .addCase(getHRMSAuthroizationTaskCount.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = true;
        state.errorCode = action.payload?.errorCode;
        state.errorMessage = action.payload?.errorMessage;
      });
  },
});

export default hrmsAuthorizationCountSlice.reducer;
export const { closeError, closeSuccess } = hrmsAuthorizationCountSlice.actions;