// Please don't change the pre-written code
// Import the necessary modules here

import { errorHandlerMiddleware } from "../../../middlewares/errorHandlerMiddleware.js";
import { sendPasswordResetEmail } from "../../../utils/emails/passwordReset.js";
import { sendWelcomeEmail } from "../../../utils/emails/welcomeMail.js";
import { ErrorHandler } from "../../../utils/errorHandler.js";
import { sendToken } from "../../../utils/sendToken.js";
import {
  createNewUserRepo,
  deleteUserRepo,
  findUserForPasswordResetRepo,
  findUserRepo,
  getAllUsersRepo,
  updateUserProfileRepo,
  updateUserRoleAndProfileRepo,
} from "../models/user.repository.js";
import crypto from "crypto";
import UserModel from "../models/user.schema.js";

export const createNewUser = async (req, res, next) => {
  const { name, email, password } = req.body;
  try {
    if (!name || !email || !password) {
      return next(new ErrorHandler(400, "Please enter name/email/password"));
    }
    const user = await findUserRepo({ email });

    //  handle error for duplicate email
    if (user) return next(new ErrorHandler(409, "Email already registered."));
    const newUser = await createNewUserRepo(req.body);
    await sendToken(newUser, res, 201);

    // Implement sendWelcomeEmail function to send welcome message   ---- done
    await sendWelcomeEmail(newUser);
  } catch (err) {
    return next(new ErrorHandler(400, err));
  }
};

export const userLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new ErrorHandler(400, "Please enter email/password"));
    }
    const user = await findUserRepo({ email }, true);
    if (!user) {
      return next(new ErrorHandler(401, "User not found! register yourself now!!"));
    }
    const passwordMatch = await user.comparePassword(password);
    if (!passwordMatch) {
      return next(new ErrorHandler(401, "Invalid email or passsword!"));
    }
    await sendToken(user, res, 200);
  } catch (error) {
    return next(new ErrorHandler(400, error));
  }
};

export const logoutUser = async (req, res, next) => {
  res
    .status(200)
    .cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
    })
    .json({ success: true, msg: "Logout successful" });
};

export const forgetPassword = async (req, res, next) => {
  // Implement feature for forget password
  const { email } = req.body;
  try {
    if (!email) {
      return next(new ErrorHandler(400, "Please enter email"));
    }
    const user = await findUserRepo({ email });
    if (!user) {
      return next(new ErrorHandler(404, "user not found!"));
    }

    const token = await user.getResetPasswordToken();

    // const resetPasswordURL = `http://localhost:${process.env.PORT}/api/storefleet/users/password/reset/${token}`;
    sendPasswordResetEmail(user, token);

    res.status(200).json({ success: true, msg: "Please check Email for resetting your password" });
  } catch (error) {
    return next(new ErrorHandler(400, error));
  }
};

export const resetUserPassword = async (req, res, next) => {
  // Implement feature for reset password
  const token = req.params.token;

  try {
    const user = await findUserForPasswordResetRepo(token);

    if (!user) return next(new ErrorHandler(401, "token expired/invalid token. please request for fresh token."));
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    if (password !== confirmPassword) return next(new ErrorHandler(400, "password and confirm password do not match."));
    user.password = password;
    await user.save();
    res.status(200).json({ success: true, msg: "password reset successful" });
  } catch (error) {
    return next(new ErrorHandler(400, error));
  }
};

export const getUserDetails = async (req, res, next) => {
  try {
    console.log(req.user._id);
    const userDetails = await findUserRepo({ _id: req.user._id });
    res.status(200).json({ success: true, userDetails });
  } catch (error) {
    return next(new ErrorHandler(400, error));
  }
};

export const updatePassword = async (req, res, next) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;
  try {
    if (!currentPassword) {
      return next(new ErrorHandler(401, "Pls enter current password"));
    }

    const user = await findUserRepo({ _id: req.user._id }, true);
    const passwordMatch = await user.comparePassword(currentPassword);
    if (!passwordMatch) {
      return next(new ErrorHandler(401, "Incorrect current password!"));
    }

    if (!newPassword || newPassword !== confirmPassword) {
      return next(new ErrorHandler(400, "Mismatch new password and confirm password!"));
    }

    user.password = newPassword;
    await user.save();
    await sendToken(user, res, 200);
  } catch (error) {
    return next(new ErrorHandler(400, error));
  }
};

export const updateUserProfile = async (req, res, next) => {
  const { name, email } = req.body;
  try {
    let data = {};

    if (!name && !email) return next(new ErrorHandler(400, "Name/email is required."));

    if (email) {
      const emailExistedInDb = await findUserRepo({ email });
      if (emailExistedInDb) {
        return next(new ErrorHandler(409, "Email already registed. Use different Email"));
      }
      data = { ...data, email };
    }

    if (name) {
      data = { ...data, name };
    }

    const updatedUserDetails = await updateUserProfileRepo(req.user._id, data);
    res.status(200).json({ success: true, updatedUserDetails });
  } catch (error) {
    return next(new ErrorHandler(400, error));
  }
};

// admin controllers
export const getAllUsers = async (req, res, next) => {
  try {
    const allUsers = await getAllUsersRepo();
    res.status(200).json({ success: true, allUsers });
  } catch (error) {
    return next(new ErrorHandler(500, error));
  }
};

export const getUserDetailsForAdmin = async (req, res, next) => {
  try {
    const userDetails = await findUserRepo({ _id: req.params.id });
    if (!userDetails) {
      return res.status(400).json({ success: false, msg: "no user found with provided id" });
    }
    res.status(200).json({ success: true, userDetails });
  } catch (error) {
    return next(new ErrorHandler(500, error));
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const deletedUser = await deleteUserRepo(req.params.id);
    if (!deletedUser) {
      return res.status(400).json({ success: false, msg: "no user found with provided id" });
    }

    res.status(200).json({ success: true, msg: "user deleted successfully", deletedUser });
  } catch (error) {
    return next(new ErrorHandler(500, error));
  }
};

export const updateUserProfileAndRole = async (req, res, next) => {
  // Write your code here for updating the roles of other users by admin
  const _id = req.params.id;
  const { name, email, role } = req.body;
  try {
    const user = await findUserRepo({ _id });
    if (!user) {
      return res.status(400).json({ success: false, msg: "no user found with provided id" });
    }
    const updatedUser = await updateUserRoleAndProfileRepo(_id, req.body);
    res.status(200).json({ success: true, msg: "user profile and role updated successfully", updatedUser });
  } catch (error) {
    return next(new ErrorHandler(500, error));
  }
};
