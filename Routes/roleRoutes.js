const express = require("express");
const router = express.Router();

const {
  addRole,
  deleteRole,
  updateRole,
  viewRole,
  liveRole,
  deleteAllRole,
} = require("../Controller/roleController");
const authMiddleware = require("../Middleware/authMiddleware");

router.post("/add",authMiddleware, addRole);
router.put("/update/:id",authMiddleware, updateRole);
router.delete("/delete/:id",authMiddleware, deleteRole);
router.delete("/delete",authMiddleware, deleteAllRole);
router.get("/view",authMiddleware, viewRole);
router.get("/live", liveRole);

module.exports = router;
