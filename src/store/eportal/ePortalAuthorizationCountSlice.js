import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchAuthorizationData } from "../../services/authorizationService";

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

export const getAuthroizationTaskCount = createAsyncThunk(
  "fetch/authorizationCount",
  async (payload) => {
    try {
      const response = await fetchAuthorizationData(payload);
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

export const authorizationCountSlice = createSlice({
  name: "eportalAuthCounts",
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
      .addCase(getAuthroizationTaskCount.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAuthroizationTaskCount.fulfilled, (state, action) => {
        //console.log(action);
        state.data = action.payload.taskscnt;
        state.subtotal = action.payload.SUBTOTAL;
        state.success = action.payload.success;        
        //state.totalRecords = action.payload.totalRecords;
        state.successMessage = "Data fetched successfully";
        state.status = "idle";
      });
  },
});

export default authorizationCountSlice.reducer;
export const { closeError, closeSuccess } = authorizationCountSlice.actions;