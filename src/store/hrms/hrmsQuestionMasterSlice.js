import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getQuestions } from "../../portals/hrms/services/questionService";

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

export const getQuestionMasterDataResponse = createAsyncThunk(
  "fetch/questionMaster",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await getQuestions(payload);
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

export const maintainenceQMSlice = createSlice({
  name: "hrmsquestionMasterData",
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
      .addCase(getQuestionMasterDataResponse.pending, (state) => {
        state.loading = true;
        state.error = false;
      })
      .addCase(getQuestionMasterDataResponse.fulfilled, (state, action) => {
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
      .addCase(getQuestionMasterDataResponse.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = true;
        state.errorCode = action.payload?.errorCode;
        state.errorMessage = action.payload?.errorMessage;
      });;
  },
});

export default maintainenceQMSlice.reducer;
export const { closeError, closeSuccess } = maintainenceQMSlice.actions;