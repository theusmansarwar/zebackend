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

router.post("/add", addTeamCategory);
router.put("/update/:id", updateTeamCategory);
router.delete("/delete/:id", deleteTeamCategory);
router.delete("/delete", deleteAllTeamCategories);
router.get("/view", viewTeamCategory);
router.get("/live", liveTeamCategory);

module.exports = router;
