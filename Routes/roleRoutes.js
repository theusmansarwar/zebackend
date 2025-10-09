const express = require("express");
const router = express.Router();

const {
  addRole,
  updateRole,
  viewRole,
  liveRole,
  deleteAllRole,
} = require("../Controller/roleController");
const authMiddleware = require("../Middleware/authMiddleware");

router.post("/add", addRole);
router.put("/update/:id", updateRole);
router.delete("/delete", deleteAllRole);
router.get("/view", viewRole);
router.get("/live", liveRole);

module.exports = router;
