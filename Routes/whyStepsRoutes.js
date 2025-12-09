const express = require("express");
const router = express.Router();


const authMiddleware = require("../Middleware/authMiddleware");
const { addWhyStep, updateWhyStep, deleteWhyStep, deleteAllWhySteps } = require("../Controller/whyStepsController");
router.post("/add", addWhyStep);
router.put("/update/:id", updateWhyStep);
router.delete("delete/:id", deleteWhyStep);
router.delete("/delete", deleteAllWhySteps);

module.exports = router;
