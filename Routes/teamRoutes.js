const express = require("express");
const router = express.Router();
const {
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
  getAllTeamMembers,
  getTeamMemberById,
  getTeamLiveMember,
  
} = require("../Controller/teamController");

router.post("/add", createTeamMember);
router.put("/update/:id", updateTeamMember);
router.delete("/delete/:id", deleteTeamMember);
router.delete("/delete", getAllTeamMembers);
router.get("/view", getAllTeamMembers);
router.get("/view/:id", getTeamMemberById);
router.get("/live", getTeamLiveMember);

module.exports = router;
