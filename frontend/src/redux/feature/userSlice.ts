import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";
import { baseUrl } from "@/lib/utils";

interface User {
  _id: string;
  username: string;
  fullName: string;
  email: string;
  avatar: string;
  role: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
}

export const fetchUserDetails = createAsyncThunk(
  "user/fetchUserDetails",
  async (_, { rejectWithValue, getState }) => {
    try {
      // Define RootState type or import it from your store
      const state = getState() as { auth: { token: string } };
      const token = state.auth.token;
      const { data } = await axios.get(`${baseUrl}/api/v1/user/get/details`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
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

const userSlice = createSlice({
  name: "user",
  initialState: {
    user: {} as User,
    userStatus: "idle",
    userError: "",
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserDetails.pending, (state) => {
        state.userStatus = "loading";
      })
      .addCase(fetchUserDetails.fulfilled, (state, action) => {
        state.userStatus = "succeeded";
        state.user = action.payload;
      })
      .addCase(fetchUserDetails.rejected, (state, action) => {
        state.userStatus = "failed";
        state.userError =
          action.error.message ||
          "Something went wrong while fetching user details";
      });
  },
});

export default userSlice.reducer;
