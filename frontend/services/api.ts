import axios from "axios";

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5184/api",
});

export function setAuthToken(token: string | null) {
  if (token) API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  else delete API.defaults.headers.common["Authorization"];
}

//Đăng nhập 
export const login = (username: string, password: string) => {
  return API.post("/Auth/login", {username, password});
}
export default API;
