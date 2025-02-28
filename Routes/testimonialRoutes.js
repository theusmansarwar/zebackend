const express = require("express");
const router = express.Router();

const {
    addTestimonial
} = require("../Controller/testimonialController");

router.post("/add", addTestimonial);


module.exports = router;
