import jwt from "jsonwebtoken";
import { User } from "../models/userModel";
import { asyncHandler } from "../utils/asyncHandler";

export const verifyAuth = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: No token" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET || "secret"
    ) as { id: string };

    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    req.user = user;
    next();
  } catch {
    const decoded = jwt.decode(token) as { id: string };
    if (!decoded?.id) return res.status(401).json({ message: "Invalid token" });

    const user = await User.findById(decoded.id);
    if (!user || !user.refreshToken)
      return res.status(401).json({ message: "Session expired" });

    try {
      jwt.verify(
        user.refreshToken,
        process.env.REFRESH_TOKEN_SECRET || "secret"
      );
      const newAccessToken = user.generateAccessToken();
      req.user = user;
      req.newAccessToken = newAccessToken;
      next();
    } catch {
      return res.status(401).json({ message: "Session expired" });
    }
  }
});
