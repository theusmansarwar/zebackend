const express = require("express");
const router = express.Router();

const {
    addIndustry,
  updateIndustry,
  deleteIndustry,
  viewIndustry,
  liveIndustry,
  getIndustryById,
  deleteAllIndustries,
} = require("../Controller/industriesController");

router.post("/add", addIndustry);
router.put("/update/:id", updateIndustry);
router.get("/get/:id", getIndustryById);
router.get("/view", viewIndustry);
router.get("/live", liveIndustry);
router.delete("/delete/:id", deleteIndustry);
router.delete("/delete", deleteAllIndustries);

module.exports = router;
