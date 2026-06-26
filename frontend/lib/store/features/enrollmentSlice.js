import { enrollmentService } from "../../../services/user/enrollment.service";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Async thunks
export const enrollInCourse = createAsyncThunk(
  "enrollment/enrollInCourse",
  async ({ courseId, paymentData }, { rejectWithValue }) => {
    try {
      const response = await enrollmentService.enrollInCourse(
        courseId,
        paymentData
      );
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to enroll in course"
      );
    }
  }
);
export const submitQuizAttempt = createAsyncThunk(
  "enrollment/submitQuizAttempt",
  async ({ enrollmentId, payload }, { rejectWithValue }) => {
    try {
      const response = await enrollmentService.submitQuizAttempt(
        enrollmentId,
        payload
      );
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to submit quiz attempt"
      );
    }
  }
);

export const downloadCertificate = createAsyncThunk(
  "enrollment/downloadCertificate",
  async ({ enrollmentId }, { rejectWithValue }) => {
    try {
      const blob = await enrollmentService.downloadCertificate(enrollmentId);
      return blob; // ✅ Return pure PDF blob
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to download certificate"
      );
    }
  }
);
export const completeEnrollment = createAsyncThunk(
  "enrollment/completeEnrollment",
  async (enrollmentData, { rejectWithValue }) => {
    try {
      const response = await enrollmentService.completeEnrollment(
        enrollmentData
      );
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to complete enrollment"
      );
    }
  }
);

export const getUserEnrollments = createAsyncThunk(
  "enrollment/getUserEnrollments",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await enrollmentService.getUserEnrollments(params);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch enrollments"
      );
    }
  }
);

export const getEnrollmentDetails = createAsyncThunk(
  "enrollment/getEnrollmentDetails",
  async (enrollmentId, { rejectWithValue }) => {
    try {
      const response = await enrollmentService.getEnrollmentDetails(
        enrollmentId
      );
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch enrollment details"
      );
    }
  }
);

export const markLessonCompleted = createAsyncThunk(
  "enrollment/markLessonCompleted",
  async ({ enrollmentId, lessonData }, { rejectWithValue }) => {
    console.log(enrollmentId, lessonData);
    try {
      const response = await enrollmentService.markLessonCompleted(
        enrollmentId,
        lessonData
      );
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to mark lesson as completed"
      );
    }
  }
);

export const checkCourseAccess = createAsyncThunk(
  "enrollment/checkCourseAccess",
  async (courseId, { rejectWithValue }) => {
    try {
      const response = await enrollmentService.checkCourseAccess(courseId);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to check course access"
      );
    }
  }
);
export const getAllEnrollmentsForPublisher = createAsyncThunk(
  "enrollment/getAllEnrollmentsForPublisher",
  async ({ page = 1, limit = 10, search = "" }, { rejectWithValue }) => {
    try {
      const response = await enrollmentService.getAllEnrollmentsForPublisher(
        page,
        limit,
        search
      );
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch enrollments"
      );
    }
  }
);

const initialState = {
  enrollments: [],
  currentEnrollment: null,
  courseAccess: null,
  status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  enrollStatus: "idle",
  accessStatus: "idle",
  lessonStatus: "idle",
  error: null,
  pagination: {
    current: 1,
    pages: 1,
    total: 0,
  },
  totalEarnings: 0,
  netEarnings: 0,
  availableBalance: 0,
  totalRecords: 0,
  page: 1,
  limit: 10,
};

const enrollmentSlice = createSlice({
  name: "enrollment",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentEnrollment: (state) => {
      state.currentEnrollment = null;
    },
    clearCourseAccess: (state) => {
      state.courseAccess = null;
    },
    resetEnrollmentState: (state) => {
      state.status = "idle";
      state.enrollStatus = "idle";
      state.accessStatus = "idle";
      state.lessonStatus = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Enroll in Course
      .addCase(enrollInCourse.pending, (state) => {
        state.enrollStatus = "loading";
        state.error = null;
      })
      .addCase(enrollInCourse.fulfilled, (state, action) => {
        state.enrollStatus = "succeeded";
        state.error = null;
        // If it's a free course, add to enrollments
        if (action.payload.enrollment) {
          state.enrollments.unshift(action.payload.enrollment);
        }
      })
      .addCase(enrollInCourse.rejected, (state, action) => {
        state.enrollStatus = "failed";
        state.error = action.payload;
      })

      // Complete Enrollment
      .addCase(completeEnrollment.pending, (state) => {
        state.enrollStatus = "loading";
        state.error = null;
      })
      .addCase(completeEnrollment.fulfilled, (state, action) => {
        state.enrollStatus = "succeeded";
        state.enrollments.unshift(action.payload.enrollment);
        state.error = null;
      })
      .addCase(completeEnrollment.rejected, (state, action) => {
        state.enrollStatus = "failed";
        state.error = action.payload;
      })

      // Get User Enrollments
      .addCase(getUserEnrollments.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(getUserEnrollments.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.enrollments = action.payload.enrollments;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(getUserEnrollments.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Get Enrollment Details
      .addCase(getEnrollmentDetails.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(getEnrollmentDetails.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.currentEnrollment = action.payload.enrollment;
        state.error = null;
      })
      .addCase(getEnrollmentDetails.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Mark Lesson Completed
      .addCase(markLessonCompleted.pending, (state) => {
        state.lessonStatus = "loading";
        state.error = null;
      })
      .addCase(markLessonCompleted.fulfilled, (state, action) => {
        state.lessonStatus = "succeeded";
        if (state.currentEnrollment) {
          console.log("=-=>", action.payload);
          state.currentEnrollment.progress = action.payload.progress;
        }
        state.error = null;
      })
      .addCase(markLessonCompleted.rejected, (state, action) => {
        state.lessonStatus = "failed";
        state.error = action.payload;
      })

      // Check Course Access
      .addCase(checkCourseAccess.pending, (state) => {
        state.accessStatus = "loading";
        state.error = null;
      })
      .addCase(checkCourseAccess.fulfilled, (state, action) => {
        state.accessStatus = "succeeded";
        state.courseAccess = action.payload;
        state.error = null;
      })
      .addCase(checkCourseAccess.rejected, (state, action) => {
        state.accessStatus = "failed";
        state.error = action.payload;
      });
    builder

      .addCase(getAllEnrollmentsForPublisher.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(getAllEnrollmentsForPublisher.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.enrollments = action.payload.enrollments;
        state.totalEarnings = action.payload.totalEarnings;
        state.netEarnings = action.payload.netEarnings;
        state.availableBalance = action.payload.availableBalance;
        state.totalRecords = action.payload.totalRecords;
        state.page = action.payload.page;
        state.limit = action.payload.limit;
        state.error = null;
      })
      .addCase(getAllEnrollmentsForPublisher.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(submitQuizAttempt.pending, (state) => {
        state.lessonStatus = "loading"; // reuse
        state.error = null;
      })
      .addCase(submitQuizAttempt.fulfilled, (state, action) => {
        state.lessonStatus = "succeeded";
        if (state.currentEnrollment) {
          // Update progress to include the new attempt history
          state.currentEnrollment.progress = action.payload.progress;
        }
        state.error = null;
      })
      .addCase(submitQuizAttempt.rejected, (state, action) => {
        state.lessonStatus = "failed";
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  clearCurrentEnrollment,
  clearCourseAccess,
  resetEnrollmentState,
} = enrollmentSlice.actions;

export default enrollmentSlice.reducer;
