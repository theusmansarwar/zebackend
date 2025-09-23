const express = require("express");
const router = express.Router();

const {
  addUserType,
  deleteUserType,
  updateUserType,
  viewUserType,
  liveUserType,
  deleteAllUserType
} = require("../Controller/typeController");
const authMiddleware = require("../Middleware/authMiddleware");

router.post("/add",authMiddleware, addUserType);
router.put("/update/:id",authMiddleware, updateUserType);
router.delete("/delete/:id",authMiddleware, deleteUserType);
router.delete("/delete",authMiddleware, deleteAllUserType);
router.get("/view",authMiddleware, viewUserType);
router.get("/live", liveUserType);

module.exports = router;
