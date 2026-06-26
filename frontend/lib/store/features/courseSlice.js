import { courseService } from "../../../services/course.service";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Async thunks
export const getCourseReviews = createAsyncThunk(
  "course/getCourseReviews",
  async ({ courseId, page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const response = await courseService.getCourseReviews(courseId, {
        page,
        limit,
      });
      return { ...response, courseId };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch course reviews"
      );
    }
  }
);

export const getMyReviewForCourse = createAsyncThunk(
  "course/getMyReviewForCourse",
  async (courseId, { rejectWithValue }) => {
    try {
      const response = await courseService.getMyReviewForCourse(courseId);
      return { ...response, courseId };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch your review"
      );
    }
  }
);

export const addOrUpdateReview = createAsyncThunk(
  "course/addOrUpdateReview",
  async ({ courseId, rating, comment }, { rejectWithValue }) => {
    try {
      const response = await courseService.addOrUpdateReview(courseId, {
        rating,
        comment,
      });
      return { ...response, courseId };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to submit review"
      );
    }
  }
);

export const deleteMyReview = createAsyncThunk(
  "course/deleteMyReview",
  async (courseId, { rejectWithValue }) => {
    try {
      const response = await courseService.deleteMyReview(courseId);
      return { ...response, courseId };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete review"
      );
    }
  }
);

export const getAllCourses = createAsyncThunk(
  "course/getAllCourses",
  async (_, { rejectWithValue }) => {
    try {
      const response = await courseService.getAllCourses();
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch courses"
      );
    }
  }
);

export const getAllCategories = createAsyncThunk(
  "course/getAllCategories",
  async (_, { rejectWithValue }) => {
    try {
      const response = await courseService.getAllCategories();
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch courses"
      );
    }
  }
);

// Create a new category
export const createCategory = createAsyncThunk(
  "course/createCategory",
  async ({ name, slug }, { rejectWithValue }) => {
    try {
      const response = await courseService.createCategory({ name, slug });
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create category"
      );
    }
  }
);

export const getMyEnrolledCourses = createAsyncThunk(
  "course/getMyEnrolledCourses",
  async (_, { rejectWithValue }) => {
    try {
      const response = await courseService.getEnrolledCourses();
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch courses"
      );
    }
  }
);
export const createCourse = createAsyncThunk(
  "course/createCourse",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await courseService.createCourse(formData);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create course"
      );
    }
  }
);

export const getPublishedCourses = createAsyncThunk(
  "course/getPublishedCourses",
  async (_, { rejectWithValue }) => {
    try {
      const response = await courseService.getPublishedCourses();
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch published courses"
      );
    }
  }
);

export const getCourseBySlug = createAsyncThunk(
  "course/getCourseBySlug",
  async (slug, { rejectWithValue }) => {
    try {
      const response = await courseService.getCourseBySlug(slug);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch course"
      );
    }
  }
);

export const getCourseById = createAsyncThunk(
  "course/getCourseById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await courseService.getCourseById(id);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch course"
      );
    }
  }
);

export const updateCourse = createAsyncThunk(
  "course/updateCourse",
  async ({ id, courseData }, { rejectWithValue }) => {
    try {
      const response = await courseService.updateCourse(id, courseData);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update course"
      );
    }
  }
);

export const deleteCourse = createAsyncThunk(
  "course/deleteCourse",
  async (id, { rejectWithValue }) => {
    try {
      const response = await courseService.deleteCourse(id);
      return { ...response, deletedId: id };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete course"
      );
    }
  }
);

export const togglePublishCourse = createAsyncThunk(
  "course/togglePublishCourse",
  async (id, { rejectWithValue }) => {
    try {
      const response = await courseService.togglePublishCourse(id);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to toggle course publish status"
      );
    }
  }
);

export const getAllCoursesForPublisher = createAsyncThunk(
  "course/getAllCoursesForPublisher",
  async ({ page = 1, limit = 10, search = "" }, { rejectWithValue }) => {
    try {
      const response = await courseService.getAllCoursesForPublisher(
        page,
        limit,
        search
      );
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch courses for publisher"
      );
    }
  }
);

const initialState = {
  courses: [],
  myEnrolledcourses: [],
  publishedCourses: [],
  currentCourse: null,
  reviews: [],
  reviewsPagination: { total: 0, page: 1, limit: 10, totalPages: 1 },
  myReview: null,
  categories: [],
  status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  reviewsStatus: "idle",
  myReviewStatus: "idle",
  submitReviewStatus: "idle",
  deleteReviewStatus: "idle",
  createStatus: "idle",
  updateStatus: "idle",
  deleteStatus: "idle",
  publishStatus: "idle",
  error: null,
  totalCourses: 0,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  },
};

const courseSlice = createSlice({
  name: "course",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentCourse: (state) => {
      state.currentCourse = null;
    },
    resetCourseState: (state) => {
      state.status = "idle";
      state.createStatus = "idle";
      state.updateStatus = "idle";
      state.deleteStatus = "idle";
      state.publishStatus = "idle";
      state.error = null;
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      // Get All Courses
      .addCase(getAllCourses.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(getAllCourses.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.courses = action.payload.courses || action.payload;
        state.totalCourses = action.payload.total || action.payload.length;
        if (action.payload.pagination) {
          state.pagination = action.payload.pagination;
        }
        state.error = null;
      })
      .addCase(getAllCourses.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Create Course
      .addCase(createCourse.pending, (state) => {
        state.createStatus = "loading";
        state.error = null;
      })
      .addCase(createCourse.fulfilled, (state, action) => {
        state.createStatus = "succeeded";
        state.courses.unshift(action.payload.course || action.payload);
        state.totalCourses += 1;
        state.error = null;
      })
      .addCase(createCourse.rejected, (state, action) => {
        state.createStatus = "failed";
        state.error = action.payload;
      })
      .addCase(getMyEnrolledCourses.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(getMyEnrolledCourses.fulfilled, (state, action) => {
        state.status = "succeeded";

        // store the array of enrolled courses
        state.myEnrolledcourses = action.payload.enrolledCourses || [];

        // store pagination info
        state.pagination = {
          currentPage: action.payload.pagination?.page || 1,
          totalPages: action.payload.pagination?.totalPages || 1,
          hasNext:
            action.payload.pagination?.page <
            action.payload.pagination?.totalPages,
          hasPrev: action.payload.pagination?.page > 1,
        };

        state.error = null;
      })

      .addCase(getMyEnrolledCourses.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Get Published Courses
      .addCase(getPublishedCourses.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(getPublishedCourses.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.publishedCourses = action.payload.courses || action.payload;
        state.error = null;
      })
      .addCase(getPublishedCourses.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Get Course by Slug
      .addCase(getCourseBySlug.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(getCourseBySlug.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.currentCourse = action.payload.course || action.payload;
        state.error = null;
      })
      .addCase(getCourseBySlug.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
        state.currentCourse = null;
      })

      // Get Course by ID
      .addCase(getCourseById.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(getCourseById.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.currentCourse = action.payload.course || action.payload;
        state.error = null;
      })
      .addCase(getCourseById.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
        state.currentCourse = null;
      })

      // Update Course
      .addCase(updateCourse.pending, (state) => {
        state.updateStatus = "loading";
        state.error = null;
      })
      .addCase(updateCourse.fulfilled, (state, action) => {
        state.updateStatus = "succeeded";
        const updatedCourse = action.payload.course || action.payload;

        // Update in courses array
        const courseIndex = state.courses.findIndex(
          (course) =>
            course._id === updatedCourse._id || course.id === updatedCourse.id
        );
        if (courseIndex !== -1) {
          state.courses[courseIndex] = updatedCourse;
        }

        // Update current course if it's the same
        if (
          state.currentCourse &&
          (state.currentCourse._id === updatedCourse._id ||
            state.currentCourse.id === updatedCourse.id)
        ) {
          state.currentCourse = updatedCourse;
        }

        state.error = null;
      })
      .addCase(updateCourse.rejected, (state, action) => {
        state.updateStatus = "failed";
        state.error = action.payload;
      })

      // Delete Course
      .addCase(deleteCourse.pending, (state) => {
        state.deleteStatus = "loading";
        state.error = null;
      })
      .addCase(deleteCourse.fulfilled, (state, action) => {
        state.deleteStatus = "succeeded";
        const deletedId = action.payload.deletedId;

        // Remove from courses array
        state.courses = state.courses.filter(
          (course) => course._id !== deletedId && course.id !== deletedId
        );

        // Remove from published courses if exists
        state.publishedCourses = state.publishedCourses.filter(
          (course) => course._id !== deletedId && course.id !== deletedId
        );

        // Clear current course if it's the deleted one
        if (
          state.currentCourse &&
          (state.currentCourse._id === deletedId ||
            state.currentCourse.id === deletedId)
        ) {
          state.currentCourse = null;
        }

        // Update totals
        state.totalCourses = Math.max(0, state.totalCourses - 1);
        if (state.pagination?.total) {
          state.pagination.total = Math.max(0, state.pagination.total - 1);
        }

        state.error = null;
      })
      .addCase(deleteCourse.rejected, (state, action) => {
        state.deleteStatus = "failed";
        state.error = action.payload;
      })
      .addCase(getAllCategories.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })

      .addCase(getAllCategories.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.categories = action.payload.categories || action.payload;
        state.error = null;
      })

      .addCase(getAllCategories.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Create Category
      .addCase(createCategory.pending, (state) => {
        // no-op for now, could add a dedicated status if needed
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        const newCat = action.payload.category || action.payload;
        if (newCat) {
          // Prepend new category and ensure uniqueness by slug or _id
          const existsIdx = state.categories.findIndex(
            (c) => c._id === newCat._id || c.slug === newCat.slug
          );
          if (existsIdx >= 0) {
            state.categories[existsIdx] = newCat;
          } else {
            state.categories.unshift(newCat);
          }
        }
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Toggle Publish Course
      .addCase(togglePublishCourse.pending, (state) => {
        state.publishStatus = "loading";
        state.error = null;
      })
      .addCase(togglePublishCourse.fulfilled, (state, action) => {
        state.publishStatus = "succeeded";
        const updatedCourse = action.payload.course || action.payload;

        // Update in courses array
        const courseIndex = state.courses.findIndex(
          (course) =>
            course._id === updatedCourse._id || course.id === updatedCourse.id
        );
        if (courseIndex !== -1) {
          state.courses[courseIndex] = updatedCourse;
        }

        // Update current course if it's the same
        if (
          state.currentCourse &&
          (state.currentCourse._id === updatedCourse._id ||
            state.currentCourse.id === updatedCourse.id)
        ) {
          state.currentCourse = updatedCourse;
        }

        // Update published courses array based on new status
        if (updatedCourse.isPublished || updatedCourse.published) {
          // Add to published courses if not already there
          const publishedIndex = state.publishedCourses.findIndex(
            (course) =>
              course._id === updatedCourse._id || course.id === updatedCourse.id
          );
          if (publishedIndex === -1) {
            state.publishedCourses.push(updatedCourse);
          } else {
            state.publishedCourses[publishedIndex] = updatedCourse;
          }
        } else {
          // Remove from published courses
          state.publishedCourses = state.publishedCourses.filter(
            (course) =>
              course._id !== updatedCourse._id && course.id !== updatedCourse.id
          );
        }

        state.error = null;
      })
      .addCase(togglePublishCourse.rejected, (state, action) => {
        state.publishStatus = "failed";
        state.error = action.payload;
      })
      // Get Course Reviews
      .addCase(getCourseReviews.pending, (state) => {
        state.reviewsStatus = "loading";
        state.error = null;
      })
      .addCase(getCourseReviews.fulfilled, (state, action) => {
        state.reviewsStatus = "succeeded";
        state.reviews = action.payload.reviews || [];
        if (action.payload.pagination) {
          state.reviewsPagination = action.payload.pagination;
        } else {
          state.reviewsPagination = {
            total: state.reviews.length,
            page: 1,
            limit: state.reviews.length,
            totalPages: 1,
          };
        }
        state.error = null;
      })
      .addCase(getCourseReviews.rejected, (state, action) => {
        state.reviewsStatus = "failed";
        state.error = action.payload;
      })
      // Get my review
      .addCase(getMyReviewForCourse.pending, (state) => {
        state.myReviewStatus = "loading";
      })
      .addCase(getMyReviewForCourse.fulfilled, (state, action) => {
        state.myReviewStatus = "succeeded";
        state.myReview = action.payload.review || null;
      })
      .addCase(getMyReviewForCourse.rejected, (state, action) => {
        state.myReviewStatus = "failed";
        state.myReview = null;
        state.error = action.payload;
      })
      // Add or update review
      .addCase(addOrUpdateReview.pending, (state) => {
        state.submitReviewStatus = "loading";
      })
      .addCase(addOrUpdateReview.fulfilled, (state, action) => {
        state.submitReviewStatus = "succeeded";
        const updated = action.payload.review;
        // Update myReview
        state.myReview = updated;
        // Update or insert into reviews list optimistically
        const idx = state.reviews.findIndex(
          (r) => r._id === updated._id || (r.user?._id && updated.user && r.user._id === updated.user._id)
        );
        if (idx >= 0) state.reviews[idx] = updated;
        else state.reviews.unshift(updated);
      })
      .addCase(addOrUpdateReview.rejected, (state, action) => {
        state.submitReviewStatus = "failed";
        state.error = action.payload;
      })
      // Delete review
      .addCase(deleteMyReview.pending, (state) => {
        state.deleteReviewStatus = "loading";
      })
      .addCase(deleteMyReview.fulfilled, (state) => {
        state.deleteReviewStatus = "succeeded";
        // Remove my review from list
        if (state.myReview) {
          state.reviews = state.reviews.filter(
            (r) => r._id !== state.myReview._id
          );
        }
        state.myReview = null;
      })
      .addCase(deleteMyReview.rejected, (state, action) => {
        state.deleteReviewStatus = "failed";
        state.error = action.payload;
      });

    // Get All Courses for Publisher

    builder
      .addCase(getAllCoursesForPublisher.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(getAllCoursesForPublisher.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.courses = action.payload.courses || action.payload;
        state.totalCourses = action.payload.total || action.payload.length;
        if (action.payload.pagination) {
          state.pagination = action.payload.pagination;
        }
        state.error = null;
      })
      .addCase(getAllCoursesForPublisher.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  clearCurrentCourse,
  resetCourseState,
  setPagination,
} = courseSlice.actions;

export default courseSlice.reducer;
