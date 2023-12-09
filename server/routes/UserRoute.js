import express from "express";
import {
  activateUser,
  changePassword,
  getProfile,
  getUploadUrl,
  googleAuth,
  registerUser,
  resetPassword,
  resetPasswordMail,
  signIn,
  updateProfile,
  updateProfileImage,
} from "../controllers/UserController.js";
import { verifyJWT } from "../middleware/auth.js";

const userRouter = express.Router();

userRouter.get("/get-upload-url", verifyJWT, getUploadUrl);

userRouter.post("/signup", registerUser);

userRouter.post("/activate", activateUser);

userRouter.post("/reset-password-link", resetPasswordMail);

userRouter.post("/reset-password", resetPassword);

userRouter.post("/signin", signIn);

userRouter.post("/google-auth", googleAuth);

userRouter.post("/update-profile-img", verifyJWT, updateProfileImage);

userRouter.post("/update-profile", verifyJWT, updateProfile);

userRouter.get("/get-profile/:id", getProfile);

userRouter.post("/change-password", verifyJWT, changePassword);

export default userRouter;
