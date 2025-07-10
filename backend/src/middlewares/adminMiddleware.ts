import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";

const adminMiddleware = asyncHandler(async (req, res, next) => {
  const user = req.user;
  if (!user) {
    return res.status(404).json(new ApiResponse(404, null, "User not found."));
  }
  if (user.isVerified && user.role !== "admin") {
    return res.status(401).json(new ApiResponse(401, null, "Unauthorized"));
  }
  next();
});

export { adminMiddleware };
