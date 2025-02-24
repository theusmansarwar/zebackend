const express = require("express");
const router = express.Router();

const {
  addComment,
  approveComment,
  viewComments,
  deleteComment
} = require("../Controller/commentController");

router.post("/add", addComment);
router.post("/approve", approveComment);
router.get("/view", viewComments);
router.delete("/delete/:id", deleteComment);


module.exports = router;
