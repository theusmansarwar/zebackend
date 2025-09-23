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

router.post("/add", addCategory);
router.put("/update/:id", updateCategory);
router.delete("/delete/:id", deleteCategory);
router.delete("/delete", deleteAllCategories);
router.get("/view", viewCategory);
router.get("/live", liveCategory);

module.exports = router;
