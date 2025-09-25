const express = require("express");
const router = express.Router();
const {
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
  getAllTeamMembers,
  getTeamMemberById,
  getTeamLiveMember,
  deleteAllTeamMembers,
  getTeamFeaturedMember
  
} = require("../Controller/teamController");
const authMiddleware = require("../Middleware/authMiddleware");

router.post("/add", createTeamMember);
router.put("/update/:id", updateTeamMember);
router.delete("/delete/:id", deleteTeamMember);
router.delete("/delete", deleteAllTeamMembers);
router.get("/view", getAllTeamMembers);
router.get("/view/:id", getTeamMemberById);
router.get("/live", getTeamLiveMember);
router.get("/featured", getTeamFeaturedMember);

module.exports = router;
