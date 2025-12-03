import axios from "axios";

// Tạo instance axios
const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5184/api",
});

// Interceptor tự động gắn token từ localStorage
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Hàm set token thủ công (nếu cần)
export function setAuthToken(token: string | null) {
  if (token) API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  else delete API.defaults.headers.common["Authorization"];
}
// Auth APIs
export const login = (username: string, password: string) => {
  return API.post("/Auth/login", { username, password });
};

// Posts APIs
export const getFeed = () => {
  return API.get("/Posts/feed");
};
// Comments APIs
export const getComments = (postId: string) => {
  return API.get(`/Comments/${postId}`);
};

// Likes APIs
export const getLikes = (postId: string) => {
  return API.post(`/Likes/${postId}`);
};
//User APIs
// export const getUsers = () => axios.get(`${API}/Users`);
export const getSuggestedUsers = () => {
  return API.get("/Users/suggested");
}
// ==========================
// Other Post actions (like, save, follow) có thể thêm sau
// ==========================

// Xuất default instance
export default API;
