const express = require("express");
const router = express.Router();

const {
  addRole,
  deleteRole,
  updateRole,
  viewRole,
  liveRole,
  deleteAllRole,
} = require("../Controller/roleController");

router.post("/add", addRole);
router.put("/update/:id", updateRole);
router.delete("/delete/:id", deleteRole);
router.delete("/delete", deleteAllRole);
router.get("/view", viewRole);
router.get("/live", liveRole);

module.exports = router;
