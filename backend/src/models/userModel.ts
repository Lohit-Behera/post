import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  username: string;
  fullName: string;
  email: string;
  avatar: string;
  role: "user" | "admin";
  isVerified: boolean;
  token?: string;
  otp?: { code: string; expiresAt: Date };
  refreshToken?: string | null;
  generateAccessToken(): string;
  generateRefreshToken(): string;
  generateToken(): string;
  generateOtp(): { code: string; expiresAt: Date };
}

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    avatar: {
      type: String,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    token: {
      type: String,
    },
    countryCode: {
      type: String,
    },
    otp: {
      code: { type: String },
      expiresAt: { type: Date },
    },
    refreshToken: {
      type: String,
      default: null,
    },
    preferences: {
      emailNotifications: {
        type: Boolean,
        default: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

userSchema.methods.generateAccessToken = function () {
  const expiry = (process.env.ACCESS_TOKEN_EXPIRY ||
    "10m") as jwt.SignOptions["expiresIn"];
  return jwt.sign(
    { id: this._id },
    process.env.ACCESS_TOKEN_SECRET || "secret",
    {
      expiresIn: expiry,
    }
  );
};

userSchema.methods.generateRefreshToken = function () {
  const expiry = (process.env.REFRESH_TOKEN_EXPIRY ||
    "60d") as jwt.SignOptions["expiresIn"];
  return jwt.sign(
    { id: this._id },
    process.env.REFRESH_TOKEN_SECRET || "secret",
    {
      expiresIn: expiry,
    }
  );
};

userSchema.methods.generateToken = function () {
  const expiry = (process.env.TOKEN_EXPIRY ||
    "1d") as jwt.SignOptions["expiresIn"];
  return jwt.sign({ id: this._id }, process.env.TOKEN_SECRET || "secret", {
    expiresIn: expiry,
  });
};

userSchema.methods.generateOtp = function () {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 1);

  this.otp = { code, expiresAt };
  return this.otp;
};

export const User = mongoose.model<IUser>("User", userSchema);
