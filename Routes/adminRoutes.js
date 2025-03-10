const express = require("express");
const { register, login, stats } = require("../Controller/authController");


const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/stats", stats);

module.exports = router;
