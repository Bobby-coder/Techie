import dotenv from "dotenv";

// load env variables
dotenv.config();

// Parse Access Token & Refresh Token expiry into a numeral with fallback value
const accessTokenExpiry = parseInt(
  process.env.ACCESS_TOKEN_EXPIRY || "300",
  10
);
const refreshTokenExpiry = parseInt(
  process.env.REFRESH_TOKEN_EXPIRY || "1200",
  10
);

// Options object for Access Token
export const accessTokenOptions = {
  expires: new Date(Date.now() + accessTokenExpiry * 60 * 60 * 1000),
  maxAge: accessTokenExpiry * 60 * 60 * 1000,
  httpOnly: true,
  sameSite: "lax",
};

// Options object for Refresh Token
export const refreshTokenOptions = {
  expires: new Date(Date.now() + refreshTokenExpiry * 24 * 60 * 60 * 1000),
  maxAge: refreshTokenExpiry * 24 * 60 * 60 * 1000,
  httpOnly: true,
  sameSite: "lax",
};

// sendToken function - this function generates access & refresh token and save them in cookie, save user to redis db & send access token in response
export function sendToken(user, statusCode, res) {
  // generate access token & refresh token
  const accessToken = user.signInAccessToken();
  const refreshToken = user.signInRefreshToken();

  // Set secure property of access token options object to true only in production mode
  if (process.env.NODE_DEV === "production") {
    accessTokenOptions.secure = true;
  }

  // Save the Access & Refresh Token to cookie
  res.cookie("refresh_token", refreshToken, refreshTokenOptions);
  res.cookie("access_token", accessToken, accessTokenOptions);

  // Send user & access token in response
  return res.status(statusCode).json({
    success: true,
    message: "logged in successfully",
    user,
    accessToken,
  });
}
