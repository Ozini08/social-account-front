import { getCookie } from "./cookie";

export const csrfFetch = async (url, options = {}) => {
  const token = getCookie("XSRF-TOKEN");

  const headers = {
    ...(options.headers || {}),
    "Content-Type": "application/json",
    "X-XSRF-TOKEN": token,
  };

  const config = {
    ...options,
    headers,
    credentials: "include", // 쿠키 포함
  };

  return fetch(url, config);
};
