const express = require("express");
const router = express.Router();

const {
 addFAQ, updateFAQ, deleteFAQ, deleteAllFAQs,addsubFAQ, updatesubFAQ, deletesubFAQ, deleteAllsubFAQs
} = require("../Controller/faqsController");

const authMiddleware = require("../Middleware/authMiddleware");
router.post("/add", addFAQ);
router.put("/update/:id",  updateFAQ);
router.delete("delete/:id",  deleteFAQ);
router.delete("/delete",  deleteAllFAQs);
router.post("/add-sub", addsubFAQ);
router.put("/update-sub/:id",  updatesubFAQ);
router.delete("delete-sub/:id",  deletesubFAQ);
router.delete("/delete-sub",  deleteAllsubFAQs);



module.exports = router;
