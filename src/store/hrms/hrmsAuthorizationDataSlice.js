import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchHRMSListAuthorizationData } from "../../services/authorizationService";

const initialState = {
  data: [],           // this will hold the `tasks` array
  exit_arr: [],
  joining_arr:[],
  error: false,
  errorCode: "",
  errorMessage: "",
  loading: false,
  success: false,
  successMessage: "",
  status: false,
  // page: 1,
  // limit: 10,
};

export const getHRMSAuthTableDataResponse = createAsyncThunk(
  "fetch/hrmsAuthDataTable",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await fetchHRMSListAuthorizationData(payload);
      if (!response.status) {
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

export const hrmsAuthSlice = createSlice({
  name: "hrmsAuthData",
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
      .addCase(getHRMSAuthTableDataResponse.pending, (state) => {
        state.loading = true;
        state.error = false;
      })
      .addCase(getHRMSAuthTableDataResponse.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.mytask || [];
        state.exit_arr = action.payload.exit_task_ids || [];
        state.joining_arr = action.payload.joining_taskarr || [];
        state.success = !!action.payload.status;
        state.successMessage = "Data fetched successfully";
        state.status = "idle";
      })
      .addCase(getHRMSAuthTableDataResponse.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = true;
        state.errorCode = action.payload?.errorCode;
        state.errorMessage = action.payload?.errorMessage;
      });
  },
});

export default hrmsAuthSlice.reducer;
export const { closeError, closeSuccess } = hrmsAuthSlice.actions;
