import axios, { AxiosError } from "axios";
import { setCookie } from "@/lib/utils";
import { setToken } from "@/redux/feature/authSlice";
import { useAppDispatch } from "@/redux/store";

export const useAxios = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  withCredentials: true,
});

useAxios.interceptors.response.use(
  (response) => {
    const dispatch = useAppDispatch();
    if (response.data.accessToken) {
      dispatch(setToken(response.data.accessToken));
      setCookie("token", response.data.accessToken, 1);
    }
    return response.data;
  },
  (error) => {
    const axiosError = error as AxiosError;
    if (axiosError.response && axiosError.response.data) {
      const responseData = axiosError.response.data as { message?: string };
      if (responseData.message) {
        return Promise.reject(responseData.message);
      }
      return Promise.reject(axiosError.response.data);
    }
    return Promise.reject(error);
  }
);
