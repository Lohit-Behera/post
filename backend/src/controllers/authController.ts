import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { User } from "../models/userModel";
import { oAuth2Client } from "../utils/googleConfig";
import { generateTokens } from "../utils/generateTokens";

interface UserResData {
  email: string;
  name: string;
  given_name: string;
  picture: string;
  email_verified: boolean;
}

const generateUniqueUsername = async (givenName: string) => {
  let username = givenName.toLowerCase().replace(/\s+/g, ""); // Normalize the username
  let user = await User.findOne({ username });

  // Keep appending random string until a unique username is found
  while (user) {
    const randomStr = Math.random().toString(36).substring(2, 6); // Generate a random 4-character string
    username = `${givenName.toLowerCase().replace(/\s+/g, "")}${randomStr}`;
    user = await User.findOne({ username });
  }

  return username;
};

const googleAuth = asyncHandler(async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res
        .status(400)
        .json(new ApiResponse(400, {}, "Token is required"));
    }
    const googleRes = await oAuth2Client.getToken(token as string);
    oAuth2Client.setCredentials(googleRes.tokens);

    if (!googleRes.tokens.access_token) {
      return res
        .status(500)
        .json(
          new ApiResponse(
            500,
            {},
            "Something went wrong while generating access token"
          )
        );
    }

    const userRes = await oAuth2Client.request({
      url: "https://www.googleapis.com/oauth2/v1/userinfo",
    });

    if (!userRes.data) {
      return res
        .status(500)
        .json(
          new ApiResponse(
            500,
            {},
            "Something went wrong while fetching user details"
          )
        );
    }
    console.log(userRes.data);
    const { email, name, given_name, picture, email_verified } =
      userRes.data as UserResData;

    if (!email || !name || !picture) {
      return res
        .status(404)
        .json(
          new ApiResponse(404, {}, "Email, name, and picture are not found")
        );
    }

    let user = await User.findOne({ email });

    if (!user) {
      const uniqueUsername = await generateUniqueUsername(given_name);

      const newUser = await User.create({
        username: uniqueUsername,
        email,
        fullName: name,
        avatar: picture,
        isVerified: email_verified,
      });
      const { accessToken, refreshToken } = (await generateTokens(
        newUser._id,
        res
      )) as { accessToken: string; refreshToken: string };
      newUser.refreshToken = refreshToken;
      await newUser.save({ validateBeforeSave: false });

      const loggedInUser = await User.findById(newUser._id).select(
        "-password -coverImage -bio -website -plan "
      );

      // send response
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            { loggedInUser, accessToken },
            "Sign up successful with google"
          )
        );
    } else {
      const { accessToken, refreshToken } = (await generateTokens(
        user._id,
        res
      )) as { accessToken: string; refreshToken: string };
      user.refreshToken = refreshToken;
      await user.save({ validateBeforeSave: false });

      const loggedInUser = await User.findById(user._id).select(
        "-password -coverImage -bio -website -plan "
      );

      // send response
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            { loggedInUser, accessToken },
            "Sign in successful with google"
          )
        );
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json(new ApiResponse(500, {}, "Something went wrong"));
  }
});

const logout = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req?.user?._id);
    if (!user) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "User not found."));
    }
    user.refreshToken = null;
    await user.save({ validateBeforeSave: false });
    return res.status(200).json(new ApiResponse(200, {}, "Logout successful"));
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json(new ApiResponse(500, {}, "Something went wrong"));
  }
});

export { googleAuth, logout };
