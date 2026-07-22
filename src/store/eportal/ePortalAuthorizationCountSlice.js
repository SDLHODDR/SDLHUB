import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { eportalAPI } from "../../services/api";
import { EPORTAL_API } from "../../portals/eportal/config/eportalApiConfig";

const initialState = {
  status: false,
  error: false,
  errorCode: "",
  errorMessage: "",
  success: false,
  successMessage: "",
  data: [],
  totalRecords: 0,
};

export const getAuthroizationTaskCount = createAsyncThunk(
  "fetch/authorizationCount",
  async (payload) => {
    const response = await eportalAPI
      .post(EPORTAL_API.AUTHORIZATION.TASKDATA, payload, {
        withCredentials: true,
      })
      .then((response) => {
        switch (response.status) {
          case 200:
            console.log(response)
            return response;
          default:
            return {
              response: "error",
              error: true,
              errorCode: response.status,
              errorMessage: response.statusText,
            };
        }
      })
      .catch((error) => {
        console.log("error", error)
        return {
          response: "error",
          error: true,
          errorCode: -1,
          errorMessage: response.statusText,
        };
      });
    return response.data;
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
        console.log(action);
        state.data = action.payload.taskscnt;
        state.success = action.payload.success;        
        state.totalRecords = action.payload.totalRecords;
        state.successMessage = "Data fetched successfully";
        state.status = "idle";
      });
  },
});

export default authorizationCountSlice.reducer;
export const { closeError, closeSuccess } = authorizationCountSlice.actions;