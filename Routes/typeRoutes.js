const express = require("express");
const router = express.Router();

const {
  addUserType,
  updateUserType,
  viewUserType,
  liveUserType,
  deleteAllUserType
} = require("../Controller/typeController");
const authMiddleware = require("../Middleware/authMiddleware");

router.post("/add", addUserType);
router.put("/update/:id", updateUserType);
router.delete("/delete", deleteAllUserType);
router.get("/view", viewUserType);
router.get("/live", liveUserType);

module.exports = router;
