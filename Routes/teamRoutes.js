const express = require("express");
const router = express.Router();
const {
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
  getAllTeamMembers,
  getTeamMemberById,
  getTeamLiveMember,
  deleteAllTeamMembers
  
} = require("../Controller/teamController");
const authMiddleware = require("../Middleware/authMiddleware");

router.post("/add",authMiddleware, createTeamMember);
router.put("/update/:id", authMiddleware,updateTeamMember);
router.delete("/delete/:id",authMiddleware, deleteTeamMember);
router.delete("/delete",authMiddleware, deleteAllTeamMembers);
router.get("/view",authMiddleware, getAllTeamMembers);
router.get("/view/:id",authMiddleware, getTeamMemberById);
router.get("/live", getTeamLiveMember);

module.exports = router;
