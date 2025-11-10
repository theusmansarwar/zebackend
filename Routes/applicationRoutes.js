const express = require("express");
const router = express.Router();

const {
  addApplication,
  viewApplications,
  getApplicationById,
  updateApplication,
  deleteAllApplications,
} = require("../Controller/applicationController");

router.post("/add", addApplication);
router.get("/view", viewApplications);
router.get("/get/:id", getApplicationById);
router.put("/update/:id", updateApplication);
router.delete("/deleteAll", deleteAllApplications);

module.exports = router;
