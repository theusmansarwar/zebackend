const express = require("express");
const { register, login, stats } = require("../Controller/authController");
const authMiddleware = require("../Middleware/authMiddleware");


const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/stats",authMiddleware, stats);

module.exports = router;
