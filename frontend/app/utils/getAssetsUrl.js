// utils/getImageUrl.ts

import { serverurl } from "../contants";
export const getMediaUrl = (path) => {
  if (!path) return "";

  // If the path is already a full URL (e.g., starts with http), return as is
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  // If your uploads are served from your backend
  const BASE_URL = serverurl;

  // Return full URL
  return `${BASE_URL}${path}`;
};
