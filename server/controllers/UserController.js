import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { getAuth } from "firebase-admin/auth";
import sendMail from "../utils/sendMail.js";
import { generateUsername } from "../utils/generateUserName.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import crypto from "crypto";
import User from "../Schema/User.js";
import { generateUploadURL } from "../utils/generateUploadUrl.js";

// Load env variables
dotenv.config();

const formatLoginDataTojson = (res, user) => {
  const access_token = jwt.sign(
    { id: user._id },
    process.env.SECRET_ACCESS_KEY
  );

  return res.status(200).json({
    success: true,
    message: "Logged in successfully",
    user: {
      access_token: access_token,
      profile_img: user.personal_info.profile_img,
      username: user.personal_info.username,
      fullname: user.personal_info.fullname,
    },
  });
};

let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email
let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password

export const getUploadUrl = (req, res, next) => {
  generateUploadURL()
    .then((url) => res.status(200).json({ uploadURL: url }))
    .catch((err) => {
      return next(new ErrorHandler(err.message, 400));
    });
};

export const registerUser = async (req, res, next) => {
  try {
    let { fullname, email, password } = req.body;

    // validating the data

    if (!fullname || !email.length || !password) {
      return next(new ErrorHandler("All fields are required", 400));
    }

    if (fullname.length < 3) {
      return next(
        new ErrorHandler("Name should be of at least 3 characters", 400)
      );
    }

    if (!emailRegex.test(email)) {
      return next(
        new ErrorHandler(
          "Email should be 6 to 20 characters long with at least 1 numeric, 1 lowercase and 1 uppercase letter",
          400
        )
      );
    }

    if (!passwordRegex.test(password)) {
      return next(
        new ErrorHandler(
          "Password should be 6 to 20 characters long with at least 1 numeric, 1 lowercase and 1 uppercase letter",
          400
        )
      );
    }

    const isEmailExists = await User.findOne({ "personal_info.email": email });

    if (isEmailExists) {
      return next(
        new ErrorHandler(
          "You are already registered, please login to continue",
          400
        )
      );
    }

    // encrypting password before storing it to database
    const hashed_password = await bcrypt.hash(password, 10);

    let username = await generateUsername(email);

    let user = {
      fullname,
      email,
      password: hashed_password,
      username,
    };

    console.log(user);

    const activationToken = createActivationToken(user);

    const activationCode = activationToken.activationCode;

    const templateData = {
      user: { name: user.fullname },
      activationCode,
    };

    try {
      await sendMail({
        userEmail: user.email,
        subject: "Activate your account",
        templateName: "activation-mail.ejs",
        templateData,
      });

      res.status(201).json({
        success: true,
        message: `Please check your email: ${user.email} to activate your account!`,
        activationToken: activationToken.token,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  } catch (err) {
    return next(new ErrorHandler(err.message, 400));
  }
  // res.json({ msg: "server got the data"});
};

// generate activation token
export const createActivationToken = (user) => {
  const activationCode = Math.floor(1000 + Math.random() * 9000).toString();

  const token = jwt.sign(
    {
      user,
      activationCode,
    },
    process.env.ACTIVATION_SECRET_KEY,
    {
      expiresIn: "5m",
    }
  );

  return { token, activationCode };
};

// activate user
export const activateUser = async function (req, res, next) {
  try {
    const { activationCode, activationToken } = req.body;

    const newUser = jwt.verify(
      activationToken,
      process.env.ACTIVATION_SECRET_KEY
    );

    if (newUser.activationCode !== activationCode) {
      return next(new ErrorHandler("Wrong OTP", 400));
    }

    const { fullname, email, password, username } = newUser.user;

    console.log(newUser);

    const user = await User.create({
      personal_info: {
        fullname,
        email,
        password,
        username,
      },
    });

    res.status(201).json({
      success: true,
      message: "Your account is activated successfully",
      user,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
};

// reset password link
export const resetPasswordMail = async function (req, res, next) {
  try {
    // extract email from request body
    const { email } = req.body;

    // if email is not entered
    if (!email) {
      return next(new ErrorHandler("Enter your email", 400));
    }

    const token = crypto.randomBytes(20).toString("hex");

    // Find user with specified email & select password because by default password is not selected in user schema
    const user = await User.findOne({ "personal_info.email": email });

    // if email is not registered
    if (!user) {
      return next(
        new ErrorHandler(
          `This email is not registered with us, enter a valid email`,
          400
        )
      );
    }

    user.token = token;

    await user.save();

    // Create a new link to reset passwork & append reset password token to it, this link will not work after 5 minutes because token expiry is 5 minutes
    const resetPasswordLink = `http://localhost:5173/reset-password/${token}`;

    // define data to send in email
    const data = { resetPasswordLink };

    // send reset password link in mail
    sendMail({
      userEmail: email,
      subject: "Reset Password",
      templateName: "reset-password.ejs",
      templateData: data,
    });

    return res.status(200).json({
      success: true,
      message:
        "Email sent successfully, please check your email to reset password",
    });
  } catch (err) {
    return next(new ErrorHandler(err.message, 400));
  }
};

// reset password
export const resetPassword = async function (req, res, next) {
  try {
    // extract userId, password & confirm password from request body
    const { newPassword, confirmPassword, resetPasswordToken } = req.body;

    const user = await User.findOne({ token: resetPasswordToken });

    // if user is not present
    if (!user) {
      return next(new ErrorHandler("User not found", 400));
    }

    // if password, confirm password or both are not entered
    if (!newPassword || !confirmPassword) {
      return next(new ErrorHandler("All fields are required", 400));
    }

    // regex for password
    let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;

    if (!passwordRegex.test(newPassword)) {
      return next(
        new ErrorHandler(
          "Password should be 6 to 20 characters long with at least 1 numeric, 1 lowercase and 1 uppercase letter",
          400
        )
      );
    }

    // if new password & confirm password
    if (newPassword !== confirmPassword) {
      return next(new ErrorHandler("Password does not match", 400));
    }

    // encrypting password before storing it to database
    const hashed_password = await bcrypt.hash(newPassword, 10);

    // update password in user document
    user.personal_info.password = hashed_password;

    // save changes to user model using save()
    await user.save();

    // return success response
    return res.status(201).json({
      success: true,
      message: `Password changed successfully`,
    });
  } catch (err) {
    return next(new ErrorHandler(err.message, 400));
  }
};

export const signIn = async (req, res, next) => {
  let { email, password } = req.body;
  try {
    const user = await User.findOne({ "personal_info.email": email });

    if (!user) {
      return next(
        new ErrorHandler(
          "This email is not registered with us. Please register to login.",
          400
        )
      );
    }

    if (!user.google_auth) {
      const result = await bcrypt.compare(
        password,
        user.personal_info.password
      );
      if (!result) {
        return next(new ErrorHandler("Wrong Password", 400));
      } else {
        // correct password
        formatLoginDataTojson(res, user);
      }
    } else {
      res.status(403).json({
        error: "Account was created using google. Try logging with google",
      });
    }
  } catch (err) {
    return next(new ErrorHandler(err.message, 400));
  }
};

export const googleAuth = async (req, res, next) => {
  let { accessToken } = req.body;

  getAuth()
    .verifyIdToken(accessToken)
    .then(async (decodedToken) => {
      let { email, name, picture } = decodedToken;

      picture = picture.replace("s96-c", "s384-c");

      let user = await User.findOne({ "personal_info.email": email })
        .select(
          "personal_info.fullname personal_info.username personal_info.profile_img google_auth"
        )
        .then((u) => {
          return u || null;
        })
        .catch((err) => {
          return res.status(500).json({ error: err.message });
        });

      if (user) {
        // login
        if (!user.google_auth) {
          return res.status(403).json({
            error:
              "This email was signed up without google. Please login with password to access the account",
          });
        }
      } else {
        // signup

        let username = await generateUsername(email);

        user = new User({
          personal_info: {
            fullname: name,
            email,
            username,
            profile_img: picture,
          },
          google_auth: true,
        });

        await user
          .save()
          .then((u) => {
            console.log(u);
            user = u;
          })
          .catch((err) => {
            return res.status(500).json({ error: err.message });
          });
      }

      formatLoginDataTojson(res, user);
    })
    .catch((err) => {
      // Handle err
      console.log(err.message);
      return res.status(500).json({
        error:
          "Failed to authenticate you with google. Try with some other google account",
      });
    });
};

export const updateProfileImage = async (req, res, next) => {
  let { url } = req.body;

  // uploading user profile image
  try {
    await User.findOneAndUpdate(
      { _id: req.user },
      { "personal_info.profile_img": url }
    );

    return res.status(200).json({ profile_img: url });
  } catch (err) {
    return next(new ErrorHandler(err.message, 400));
  }
};

export const updateProfile = async (req, res, next) => {
  let { username, bio, social_links } = req.body;

  // validate the data
  if (username.length < 3) {
    return next(new ErrorHandler("Username must of more than 3 letters", 400));
  }
  if (bio.length > 200) {
    return next(
      new ErrorHandler("Bio should not be more than 200 characters", 400)
    );
  }

  // social links validation
  let socialLinksArr = Object.keys(social_links);
  try {
    for (let i = 0; i < socialLinksArr.length; i++) {
      if (social_links[socialLinksArr[i]].length) {
        let hostname = new URL(social_links[socialLinksArr[i]]).hostname;

        if (
          !hostname.includes(`${socialLinksArr[i]}.com`) &&
          socialLinksArr[i] != "website"
        ) {
          return res.status(403).json({
            error: `${socialLinksArr[i]} link is invalid. You must enter a full link`,
          });
        }
      }
    }
  } catch (err) {
    return res.status(403).json({
      error: "You must provide full social links with http(s) included",
    });
  }

  let UpdateObj = {
    "personal_info.username": username,
    "personal_info.bio": bio,
    social_links,
  };

  try {
    await User.findOneAndUpdate({ _id: req.user }, UpdateObj, {
      runValidators: true,
    });

    return res.status(200).json({ username });
  } catch (err) {
    if (err.code == 11000) {
      // duplicate key found
      return next(new ErrorHandler("Username is taken!", 400));
    }
    return next(new ErrorHandler(err.message, 400));
  }
};

export const getProfile = async (req, res, next) => {
  const username = req.params.id;

  try {
    const user = await User.findOne({
      "personal_info.username": username,
    }).select("-personal_info.password -google_auth -updatedAt -blogs");

    if (!user) {
      next(new ErrorHandler("User not found.", 400));
    }

    return res.status(200).json(user);
  } catch (err) {
    return next(new ErrorHandler(err.message, 400));
  }
};

//server.get("/get-profile-image/:id", async (req, res) => {});

export const changePassword = async (req, res, next) => {
  let { currentPassword, newPassword } = req.body;

  // validate data
  if (
    !passwordRegex.test(currentPassword) ||
    !passwordRegex.test(newPassword)
  ) {
    return res.status(403).json({
      error:
        "Password should be 6 to 20 characters long with at least 1 numeric, 1 lowercase and 1 uppercase letter",
    });
  }

  try {
    const user = await User.findOne({ _id: req.user });

    if (!user) {
      return next(new ErrorHandler("User not found!", 400));
    }

    if (user.google_auth) {
      return res.status(500).json({
        error:
          "You can't change account's password because you logged in through google",
      });
    }

    const result = await bcrypt.compare(currentPassword, user.personal_info.password);

    if (!result) {
      return res.status(403).json({ error: "Incorrect current password" });
    }

    const hashed_password = await bcrypt.hash(newPassword, 10);
    await User.findOneAndUpdate(
      { _id: req.user },
      { "personal_info.password": hashed_password }
    );

    return res.status(200).json({ status: "Password changed successfully" });
  } catch (err) {
    return next(new ErrorHandler(err.message, 400));
  }
};
