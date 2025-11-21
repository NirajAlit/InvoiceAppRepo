import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE,
});

export const publicApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE,
});

// Add token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 1) Simple GET
export const getData = (url, params = {}) => {
  return api.get(url, { params });
};

// 2) Simple POST
export const postData = (url, body = {}) => {
  return api.post(url, body);
};

// 3) Simple PUT
export const putData = (url, body = {}) => {
  return api.put(url, body);
};

// 4) POST with File
export const postWithFile = (url, formData) => {
  return api.post(url, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// 5) GET file (download)
export const getFile = (url) => {
  return api.get(url, { responseType: "blob" });
};

// 6) Simple DELETE
export const deleteData = (url, params = {}) => {
  return api.delete(url, { params });
};

// GLOBAL ERROR HANDLER
api.interceptors.response.use(
  (response) => response,

  (error) => {

    // Network error
    if (!error.response) {
      console.error("Network Error:", error);
      return Promise.reject({
        status: 0,
        message: "Server not reachable. Please check your internet.",
      });
    }

    const { status, data } = error.response;

    let message = "Something went wrong";

    if (status === 400) {
      message = data?.message || "Invalid Request";
    }

    if (status === 401) {
      message = "Session expired, please login again";

      // Auto logout
      localStorage.removeItem("token");
      window.location.href = "/login";
    }

    if (status === 403) {
      message = "You are not allowed to perform this action";
    }

    if (status === 404) {
      message = "Requested data not found";
    }

    if (status === 500) {
      message = "Server error, please try again later";
    }

    return Promise.reject({
      status,
      message,
      error: data,
    });
  }
);

export default api;


