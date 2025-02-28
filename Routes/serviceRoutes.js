const express = require("express");
const { createService } = require("../Controller/serviceController");
const router = express.Router();


router.post("/add", createService);


module.exports = router;
