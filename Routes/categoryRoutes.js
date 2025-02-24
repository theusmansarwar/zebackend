const express = require("express");
const router = express.Router();

const {
  addCategory,
  deleteCategory,
  updateCategory,
  viewCategory,
  liveCategory
} = require("../Controller/categoryController");

router.post("/add", addCategory);
router.put("/update/:id", updateCategory);
router.delete("/delete/:id", deleteCategory);
router.get("/view", viewCategory);
router.get("/live", liveCategory);

module.exports = router;
