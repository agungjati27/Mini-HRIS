import axios from "axios";
import { supabase } from "../services/supabase";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

api.interceptors.request.use(
  async (config) => {
    try {
      const { data } = await supabase.auth.getSession();
      console.debug("[axios] supabase session:", data?.session);
      if (data?.session) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${data.session.access_token}`;
        console.debug("[axios] set Authorization header");
      } else {
        console.debug("[axios] no supabase session available");
      }
    } catch (err) {
      console.error("[axios] error getting supabase session:", err);
    }
    return config;
  },
  (error) => Promise.reject(error),
);

export default api;