import axios from "axios";

const getInitialBaseUrl = (): string => {
  if (typeof window !== "undefined") {
    return window.localStorage.getItem("webshopx_api_base_url") || "http://localhost:8819";
  }
  return "http://localhost:8819";
};

export const apiClient = axios.create({
  baseURL: getInitialBaseUrl(),
  timeout: 15000,
  withCredentials: true,
});

// Inject Authorization Bearer token if present
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token") || localStorage.getItem("webshopx_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export type QueryParams = Record<string, string | number | boolean | null | undefined>;

export const toFormData = (payload: Record<string, unknown>): FormData => {
  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }

    if (value instanceof Blob) {
      formData.append(key, value);
      return;
    }

    formData.append(key, String(value));
  });

  return formData;
};
