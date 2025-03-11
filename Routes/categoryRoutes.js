const express = require("express");
const router = express.Router();

const {
  addCategory,
  deleteCategory,
  updateCategory,
  viewCategory,
  liveCategory,
  deleteAllCategories
} = require("../Controller/categoryController");
const authMiddleware = require("../Middleware/authMiddleware");

router.post("/add",authMiddleware, addCategory);
router.put("/update/:id",authMiddleware, updateCategory);
router.delete("/delete/:id",authMiddleware, deleteCategory);
router.delete("/delete",authMiddleware, deleteAllCategories);
router.get("/view",authMiddleware, viewCategory);
router.get("/live", liveCategory);

module.exports = router;
