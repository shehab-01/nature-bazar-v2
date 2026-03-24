import axios, { AxiosError, AxiosResponse } from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL, // http://localhost:9090
  headers: {
    "Content-Type": "application/json",
  },
});

// ─── Request Interceptor ───────────────────────────────────────────────────────
axiosInstance.interceptors.request.use(
  (config) => {
    // TODO: inject auth token here once auth is implemented
    // const token = getToken(); // e.g. from localStorage or a cookie
    // if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// ─── Response Interceptor ─────────────────────────────────────────────────────
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError<{ detail?: string; message?: string }>) => {
    const status = error.response?.status;
    const serverMessage =
      error.response?.data?.detail ??
      error.response?.data?.message ??
      error.message ??
      "An unexpected error occurred.";

    // Log in dev, swap for a proper logger (e.g. Sentry) in prod
    if (process.env.NODE_ENV === "development") {
      console.error(`[API Error] ${status ?? "Network"}: ${serverMessage}`);
    }

    // TODO: handle 401 (redirect to login) once auth is implemented
    // if (status === 401) { router.push("/login"); }

    return Promise.reject(new Error(serverMessage));
  }
);

export default axiosInstance;