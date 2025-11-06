const express = require("express");
const router = express.Router();

const {
  addCaseStudy,
  updateCaseStudy,
  viewCaseStudy,
  liveCaseStudy,
  deleteAllCaseStudies,
  getCaseStudyById,
} = require("../Controller/caseStudyController");

router.post("/add", addCaseStudy);
router.put("/update/:id", updateCaseStudy);
router.get("/get/:id", getCaseStudyById);
router.get("/view", viewCaseStudy);
router.get("/live", liveCaseStudy);
router.delete("/delete", deleteAllCaseStudies);

module.exports = router;
