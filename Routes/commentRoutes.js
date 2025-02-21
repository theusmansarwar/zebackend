const express = require("express");
const router = express.Router();

const {
  addComment,
  approveComment,
} = require("../Controller/commentController");

router.post("/add", addComment);
router.post("/approve", approveComment);

module.exports = router;
