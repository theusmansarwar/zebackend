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

router.post("/add", addComment);
router.post("/approve", approveComment);
router.get("/view", viewComments);
router.get("/approved-comment", approvedComments);
router.delete("/delete/:id", deleteComment);
router.delete("/delete", deleteAllComment);

module.exports = router;
