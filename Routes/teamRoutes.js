const express = require("express");
const router = express.Router();
const {
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
  getAllTeamMembers,
  getTeamMemberById,
} = require("../Controller/teamController");

router.post("/add", createTeamMember);
router.put("/update/:id", updateTeamMember);
router.delete("/delete/:id", deleteTeamMember);
router.get("/view", getAllTeamMembers);
router.get("/view/:id", getTeamMemberById);

module.exports = router;
