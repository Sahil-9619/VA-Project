// /lib/store/store.js
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./features/authSlice";
import courseReducer from "./features/courseSlice";
import enrollmentReducer from "./features/enrollmentSlice";
import adminReducer from "./features/adminSlice";
import appSettings from "./features/appSettingsSlice";
// import userReducer from "./features/user/userSlice";
// import instructorReducer from "./features/instructor/instructorSlice";
// import adminReducer from "./features/admin/adminSlice";
// import commonReducer from "./features/common/commonSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    course: courseReducer,
    enrollment: enrollmentReducer,
    admin: adminReducer,
    appSettings: appSettings,
    // instructor: instructorReducer,
    // admin: adminReducer,
    // common: commonReducer,
  },
  devTools: process.env.NEXT_PUBLIC_NODE_ENV !== "production", // ✅ disable in prod
});
