import { User } from "../models/userModel";
import { ApiResponse } from "./ApiResponse";
import { Response } from "express";
import mongoose from "mongoose";

export const generateTokens = async (
  userId: mongoose.Types.ObjectId,
  res: Response
) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json(new ApiResponse(404, null, "User not found"));
      return null;
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json(
        new ApiResponse(
          500,
          null,
          "Something went wrong while generating tokens"
        )
      );
    return null;
  }
};
