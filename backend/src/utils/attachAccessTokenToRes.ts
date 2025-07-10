import { asyncHandler } from "./asyncHandler";
import { RequestHandler } from "express";

export const attachAccessTokenToRes = (handler: RequestHandler) =>
  asyncHandler(async (req, res, next) => {
    const originalJson = res.json.bind(res);

    res.json = (data) => {
      if (req.newAccessToken && typeof data === "object" && data !== null) {
        data.accessToken = req.newAccessToken;
      }
      return originalJson(data);
    };

    return handler(req, res, next);
  });
