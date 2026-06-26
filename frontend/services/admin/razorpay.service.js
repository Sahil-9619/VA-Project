import axiosInstance from "../../app/utils/axiosinterceptor";

export const razorpayAdminService = {
  getActiveCredential: async () => {
    const res = await axiosInstance.get(`/razorpay/credentials/active`);
    return res.data; // { success: true, credential }
  },
  addCredential: async (payload) => {
    // payload: { keyId, keySecret, webhookSecret? }
    const res = await axiosInstance.post(`/razorpay/credentials`, payload);
    return res.data; // { success: true, credential }
  },
  activateCredential: async (id) => {
    const res = await axiosInstance.patch(`/razorpay/credentials/${id}/activate`);
    return res.data; // { success: true, message, credential }
  },
};
