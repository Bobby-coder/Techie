import User from "../Schema/User.js";
import { nanoid } from "nanoid";

export async function generateUsername(email) {
  try {
    let username = email.split("@")[0];

    const isUsernameExist = await User.exists({
      "personal_info.username": username,
    });

    if (isUsernameExist) {
      username += nanoid();
    }
    return username;
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
}
