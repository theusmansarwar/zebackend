const express = require("express");
const router = express.Router();

const { incrementImpression } = require("../Controller/viewController");



router.post('/count', incrementImpression);


module.exports = router;