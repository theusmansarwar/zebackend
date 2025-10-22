const express = require("express");
const router = express.Router();

const {
 addFAQ, updateFAQ, deleteFAQ, deleteAllFAQs
} = require("../Controller/faqsController");

const authMiddleware = require("../Middleware/authMiddleware");
router.post("/add", addFAQ);
router.put("/update/:id",  updateFAQ);
router.delete("delete/:id",  deleteFAQ);
router.delete("/delete",  deleteAllFAQs);



module.exports = router;
