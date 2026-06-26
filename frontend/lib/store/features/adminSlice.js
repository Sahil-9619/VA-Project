import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { adminServices } from "../../../services/admin/admin.service";

// Thunk
export const fetchAllUsers = createAsyncThunk(
  "admin/fetchAllUsers",
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await adminServices.getAllUsers(params);
      return res; // { users, pagination, summary }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch users"
      );
    }
  }
);

export const fetchUserById = createAsyncThunk(
  "admin/fetchUserById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await adminServices.getUserById(id);
      return res.user;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch user detail"
      );
    }
  }
);
const initialState = {
  users: [],
  usersStatus: "idle",
  usersError: null,
  pagination: { page: 1, limit: 10, totalPages: 0, totalItems: 0 },
  summary: { totalUsers: 0, byRole: {} },
  filters: { search: "", role: "" },

  userDetail: null,
  userDetailStatus: "idle",
  userDetailError: null,
};

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    clearAdminErrors: (state) => {
      state.usersError = null;
      state.userDetailError = null;
    },
    setUserFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setUserPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all users
      .addCase(fetchAllUsers.pending, (state) => {
        state.usersStatus = "loading";
        state.usersError = null;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.usersStatus = "succeeded";
        state.users = action.payload.users || [];
        state.pagination = action.payload.pagination || state.pagination;
        state.summary = action.payload.summary || state.summary;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.usersStatus = "failed";
        state.usersError = action.payload;
      })

      // Fetch user by id
      .addCase(fetchUserById.pending, (state) => {
        state.userDetailStatus = "loading";
        state.userDetailError = null;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.userDetailStatus = "succeeded";
        state.userDetail = action.payload;
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.userDetailStatus = "failed";
        state.userDetailError = action.payload;
      });
  },
});

export const { clearAdminErrors, setUserFilters, setUserPagination } =
  adminSlice.actions;
export default adminSlice.reducer;
