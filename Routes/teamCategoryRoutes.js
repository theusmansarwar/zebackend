const express = require("express");
const router = express.Router();

const {
  addTeamCategory,
  updateTeamCategory,
  deleteTeamCategory,
  deleteAllTeamCategories,
  viewTeamCategory,
  liveTeamCategory
} = require("../Controller/teamCategoryController");
const authMiddleware = require("../Middleware/authMiddleware");

router.post("/add", authMiddleware,addTeamCategory);
router.put("/update/:id",authMiddleware, updateTeamCategory);
router.delete("/delete/:id",authMiddleware, deleteTeamCategory);
router.delete("/delete",authMiddleware, deleteAllTeamCategories);
router.get("/view", authMiddleware,viewTeamCategory);
router.get("/live",authMiddleware, liveTeamCategory);

module.exports = router;
