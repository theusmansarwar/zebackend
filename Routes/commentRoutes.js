const express = require("express");
const router = express.Router();

const {
  addComment,
  approveComment,
  viewComments,
  deleteComment,
  deleteAllComment,
  approvedComments
} = require("../Controller/commentController");
const authMiddleware = require("../Middleware/authMiddleware");

router.post("/add", addComment);
router.put("/approve",authMiddleware, approveComment);
router.get("/view",authMiddleware, viewComments);
router.get("/approved-comment", approvedComments);
router.delete("/delete/:id",authMiddleware, deleteComment);
router.delete("/delete",authMiddleware, deleteAllComment);

module.exports = router;
