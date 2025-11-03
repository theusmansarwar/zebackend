const express = require("express");
const router = express.Router();

const {
 addProvenSteps, updateProvenSteps, deleteProvenSteps, deleteAllProvenSteps 
} = require("../Controller/provenStepsController");

const authMiddleware = require("../Middleware/authMiddleware");
router.post("/add", addProvenSteps);
router.put("/update/:id",  updateProvenSteps);
router.delete("delete/:id",  deleteProvenSteps);
router.delete("/delete",  deleteAllProvenSteps);



module.exports = router;
