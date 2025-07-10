import { User } from "../models/userModel";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";

const getUserDetails = asyncHandler(async (req, res) => {
  const user = await User.findById(req?.user?._id);
  if (!user) {
    return res.status(404).json(new ApiResponse(404, null, "User not found."));
  }
  res.status(200).json(new ApiResponse(200, user, "User details found."));
});

export { getUserDetails };
