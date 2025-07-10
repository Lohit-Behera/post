import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";
import { baseUrl, setCookie, getCookie, deleteCookie } from "@/lib/utils";

export const fetchGoogleAuth = createAsyncThunk(
  "auth/google",
  async (token: string, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(`${baseUrl}/api/v1/auth/google`, {
        token,
      });
      setCookie("newData", JSON.stringify(data.data), 60);
      setCookie("token", data.data.accessToken, 1);
      return data.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      let errorMessage = "";
      if (
        axiosError.response &&
        axiosError.response.data &&
        typeof axiosError.response.data === "object" &&
        "message" in axiosError.response.data
      ) {
        errorMessage =
          (axiosError.response.data as { message?: string }).message || "";
      }
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchLogout = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { auth: { token: string } };
      const { data } = await axios.get(`${baseUrl}/api/v1/auth/logout`, {
        headers: {
          Authorization: `Bearer ${state.auth.token}`,
        },
      });
      deleteCookie("token");
      deleteCookie("newData");
      return data.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      let errorMessage = "";
      if (
        axiosError.response &&
        axiosError.response.data &&
        typeof axiosError.response.data === "object" &&
        "message" in axiosError.response.data
      ) {
        errorMessage =
          (axiosError.response.data as { message?: string }).message || "";
      }
      return rejectWithValue(errorMessage);
    }
  }
);

const authData = getCookie("newData");

const Auth = createSlice({
  name: "auth",
  initialState: {
    auth: authData || null,
    authLoading: "idle",
    authError: {},
    token: getCookie("token") || "",
  },
  reducers: {
    setToken: (state, action) => {
      state.token = action.payload;
      setCookie("token", action.payload, 1);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGoogleAuth.pending, (state) => {
        state.authLoading = "loading";
      })
      .addCase(fetchGoogleAuth.fulfilled, (state, action) => {
        state.authLoading = "succeeded";
        state.auth = action.payload;
        state.token = action.payload.accessToken;
      })
      .addCase(fetchGoogleAuth.rejected, (state, action) => {
        state.authLoading = "failed";
        state.authError =
          action.error.message ||
          "Something went wrong while logging in with google";
      })

      .addCase(fetchLogout.pending, (state) => {
        state.authLoading = "loading";
      })
      .addCase(fetchLogout.fulfilled, (state) => {
        state.authLoading = "succeeded";
        state.auth = null;
        state.token = "";
      })
      .addCase(fetchLogout.rejected, (state, action) => {
        state.authLoading = "failed";
        state.authError =
          action.error.message || "Something went wrong while logging out";
      });
  },
});

export const { setToken } = Auth.actions;
export default Auth.reducer;
