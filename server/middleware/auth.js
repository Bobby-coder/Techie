import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import ErrorHandler from "../utils/ErrorHandler.js";

// Load env variables
dotenv.config();

export const verifyJWT = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) {
    return next(new ErrorHandler("Login to continue", 400));
  }

  jwt.verify(token, process.env.SECRET_ACCESS_KEY, (err, user) => {
    if (err) {
      return next(new ErrorHandler("Access token is invalid", 400));
    }

    req.user = user.id;
    next();
  });
};
