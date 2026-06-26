import axiosInstance from "../../app/utils/axiosinterceptor";

export const settingsAdminService = {
  get: async () => {
    const res = await axiosInstance.get(`/settings`);
    return res.data; // { settings }
  },
  // services/admin/settings.service.js
  // services/admin/settings.service.js
  update: async (payload, logoFile = null) => {
    const formData = new FormData();

    // Append all basic info fields individually
    Object.keys(payload).forEach((key) => {
      if (key === "branding" && typeof payload[key] === "object") {
        // Append branding fields individually
        Object.keys(payload.branding).forEach((brandKey) => {
          formData.append(`branding[${brandKey}]`, payload.branding[brandKey]);
        });
      } else if (key === "currency" && typeof payload[key] === "object") {
        // Append currency fields individually
        Object.keys(payload.currency).forEach((currencyKey) => {
          formData.append(`currency[${currencyKey}]`, payload.currency[currencyKey]);
        });
      } else {
        formData.append(key, payload[key]);
      }
    });

    // Append logo file if exists
    if (logoFile) {
      formData.append("logo", logoFile);
    }

    const res = await axiosInstance.put(`/settings`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  },
};
