import { authService } from "@/services/user/auth.service";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Async thunks

export const registerUser = createAsyncThunk(
  "auth/register",
  async (userData, { rejectWithValue }) => {
    try {
      return await authService.registerUser(userData);
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

export const emailLogin = createAsyncThunk(
  "auth/emailLogin",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authService.emailLogin(credentials);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Email login failed"
      );
    }
  }
);

export const sendOtpToPhone = createAsyncThunk(
  "auth/sendOtpToPhone",
  async (phoneNumber, { rejectWithValue }) => {
    try {
      const response = await authService.sendOtpToPhone(phoneNumber);
      return { ...response, phoneNumber };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to send OTP"
      );
    }
  }
);

export const verifyPhoneOtp = createAsyncThunk(
  "auth/verifyPhoneOtp",
  async ({ phoneNumber, otp }, { rejectWithValue }) => {
    try {
      const response = await authService.verifyPhoneOtp(phoneNumber, otp);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "OTP verification failed"
      );
    }
  }
);

export const resendOtp = createAsyncThunk(
  "auth/resendOtp",
  async (phoneNumber, { rejectWithValue }) => {
    try {
      const response = await authService.resendOtp(phoneNumber);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to resend OTP"
      );
    }
  }
);

export const getUserDetails = createAsyncThunk(
  "auth/getUserDetails",
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.getUserDetails();
      console.log(response);
      return response.user;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to get user details"
      );
    }
  }
);

export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.logout();
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }

      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Logout failed");
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  "user/updateProfile",
  async (profileData, thunkAPI) => {
    try {
      return await authService.updateUserProfile(profileData);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  user: null,
  isAuthenticated: false,
  status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  loginMethod: "email", // "email" | "phone" | "otp"
  phoneNumber: "",
  otpSent: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setLoginMethod: (state, action) => {
      state.loginMethod = action.payload;
      state.error = null;
    },
    setPhoneNumber: (state, action) => {
      state.phoneNumber = action.payload;
    },
    resetAuthState: (state) => {
      state.status = "idle";
      state.error = null;
      state.otpSent = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Email Login
      .addCase(emailLogin.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(emailLogin.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(emailLogin.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
        state.isAuthenticated = false;
      })

      // Send OTP to Phone
      .addCase(sendOtpToPhone.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(sendOtpToPhone.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.otpSent = true;
        state.loginMethod = "otp";
        state.phoneNumber = action.payload.phoneNumber;
        state.error = null;
      })
      .addCase(sendOtpToPhone.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
        state.otpSent = false;
      })

      // Verify Phone OTP
      .addCase(verifyPhoneOtp.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(verifyPhoneOtp.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.isAuthenticated = true;
        state.otpSent = false;
        state.error = null;
      })
      .addCase(verifyPhoneOtp.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Resend OTP
      .addCase(resendOtp.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(resendOtp.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.error = null;
      })
      .addCase(resendOtp.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Get User Details
      .addCase(getUserDetails.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getUserDetails.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(getUserDetails.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
        state.isAuthenticated = false;
      })

      // Logout
      .addCase(logout.pending, (state) => {
        state.status = "loading";
      })
      .addCase(logout.fulfilled, (state) => {
        state.status = "idle";
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
        state.loginMethod = "email";
        state.phoneNumber = "";
        state.otpSent = false;
      })
      .addCase(logout.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(registerUser.pending, (state) => {
        state.registerStatus = "loading";
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        // state.user = action.payload;
        state.registerStatus = "succeeded";
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.registerStatus = "failed";
        state.error = action.payload;
      })

      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.success = true;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, setLoginMethod, setPhoneNumber, resetAuthState } =
  authSlice.actions;
export default authSlice.reducer;
