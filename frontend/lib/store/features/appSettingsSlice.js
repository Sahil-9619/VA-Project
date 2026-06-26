import { settingsAdminService } from "@/services/admin/settings.service";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Async thunks
export const getSetting = createAsyncThunk(
  "enrollment/getSetting",
  async (_, { rejectWithValue }) => {
    try {
      const response = await settingsAdminService.get();
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to enroll in course"
      );
    }
  }
);

const initialState = {
  settings: [],
  status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

const appSettingsSlice = createSlice({
  name: "enrollment",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Enroll in Course
      .addCase(getSetting.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(getSetting.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.error = null;
        state.settings = action.payload.settings;
      })
      .addCase(getSetting.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});
export default appSettingsSlice.reducer;
