import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "",
  headers: { "Content-Type": "application/json" },
  timeout: 15_000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("dh_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("dh_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default api;
