const express = require("express");
const router = express.Router();
const {
  register,
  login,
  stats,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  deleteMultipleUsers,
} = require("../Controller/authController");
const authMiddleware = require("../Middleware/authMiddleware");

router.post("/register", register);
router.post("/login", login);
router.get("/stats",  stats);
router.get("/users",  getAllUsers);
router.get("/users/:id",  getUserById);
router.put("/users/:id",  updateUser); 
router.delete("/users/:id",  deleteUser);
router.post("/users/deleteMultiple",  deleteMultipleUsers);

module.exports = router;
