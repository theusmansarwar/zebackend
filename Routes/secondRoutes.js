const express = require("express");
const router = express.Router();

const authMiddleware = require("../Middleware/authMiddleware");
const { addSecond, updateSecond, deleteSecond, deleteAllSeconds } = require("../Controller/secondSectionController");


router.post("/add", addSecond);
router.put("/update/:id",  updateSecond);
router.delete("delete/:id",  deleteSecond);
router.delete("/delete",  deleteAllSeconds);



module.exports = router;
