const express = require("express");
const router = express.Router();

const {
  addTeamCategory,
  updateTeamCategory,
  deleteAllTeamCategories,
  viewTeamCategory,
  liveTeamCategory
} = require("../Controller/teamCategoryController");
const authMiddleware = require("../Middleware/authMiddleware");

router.post("/add", addTeamCategory);
router.put("/update/:id", updateTeamCategory);
router.delete("/delete", deleteAllTeamCategories);
router.get("/view", viewTeamCategory);
router.get("/live", liveTeamCategory);

module.exports = router;
