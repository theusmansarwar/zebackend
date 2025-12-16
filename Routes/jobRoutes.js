const express = require("express");
const router = express.Router();

const {
  addJob,
  deleteAllJobs,
  getJobById,
  liveJobs,
  updateJob,
  viewJobs,
} = require("../Controller/jobController");
router.post("/add", addJob);
router.put("/update/:id", updateJob);
router.get("/get/:id", getJobById);
router.get("/view", viewJobs);
router.get("/live", liveJobs);
router.delete("/delete", deleteAllJobs);
module.exports = router;
