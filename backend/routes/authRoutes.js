const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const avatarUpload = require("../middleware/avatarUpload");

const router = express.Router();

const {
  register,
  login,
  forgotPassword,
  resetPassword,
  getMe,
  updateProfile,
  changePassword,
  uploadAvatar,
  deleteAccount,
} = require("../controllers/authController");

router.post("/register", register);

router.post("/login", login);

router.post("/forgot-password", forgotPassword);

router.post("/reset-password/:token", resetPassword);

router.get("/me", authMiddleware, getMe);

router.put("/profile", authMiddleware, updateProfile);

router.put("/change-password", authMiddleware, changePassword);

router.post(
  "/avatar",
  authMiddleware,
  avatarUpload.single("avatar"),
  uploadAvatar
);

router.delete("/delete-account", authMiddleware, deleteAccount);

module.exports = router;