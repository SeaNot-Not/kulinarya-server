import expressAsyncHandler from "express-async-handler";

// Imported Models
import User from "../models/userModel.js";

export const getSpecificUserData = expressAsyncHandler(async (req, res) => {
  const userData = await User.getSpecificUserData(req);

  res.status(200).json({
    success: true,
    statusCode: 200,
    message: "User Data Fetched Succesfully",
    userData,
  });
});

export const getAllUsers = expressAsyncHandler(async (req, res) => {
  const result = await User.getAllUsers(req.query);
  res.status(200).json(result);
});

export const updateUserData = expressAsyncHandler(async (req, res) => {
  const updatedUserData = await User.updateUserData(req);

  res.status(200).json({
    success: true,
    statusCode: 200,
    message: "User Data Fetched Succesfully",
    updatedUserData,
  });
});

export const softDeleteUserAccount = expressAsyncHandler(async (req, res) => {
  await User.softDeleteUser(req);

  res.status(200).json({
    success: true,
    statusCode: 200,
    message: "User Soft Deleted Succesfully",
  });
});

export const getUserRecipes = expressAsyncHandler(async (req, res) => {
  const { userRecipes, totalRecipes } = await User.getUserRecipesList(req);

  res.status(200).json({
    success: true,
    statusCode: 200,
    message: "User Recipes Fetched Successfully",
    totalRecipes,
    userRecipes,
  });
});

export const getTopSharers = expressAsyncHandler(async (req, res) => {
  const topSharers = await User.getTopSharers();

  res.status(200).json({
    success: true,
    statusCode: 200,
    message: "Top Sharers Fetched Successfully",
    topSharers,
  });
});


// Promote a user to admin
export const makeAdmin = expressAsyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Ensure the user is not already an admin
  if (user.role === "admin") {
    return res.status(400).json({ message: "User is already an admin" });
  }

  user.role = "admin"; // Promote to admin
  await user.save();
  res.status(200).json({ message: "User promoted to admin successfully" });
});

// Toggle user role between 'admin' and 'user'
export const toggleAdminRole = expressAsyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Toggle role between 'admin' and 'user'
  if (user.role === "admin") {
    user.role = "user"; // Demote to regular user
  } else {
    user.role = "admin"; // Promote to admin
  }

  await user.save();
  res.status(200).json({ message: `User role updated to ${user.role}` });
});

