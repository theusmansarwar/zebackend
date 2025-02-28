const express = require("express");
const router = express.Router();

const {
    addTestimonial,
  updateTestimonial,
  deleteTestimonial,
  deleteAllTestimonial,
  viewTestimonial,
  liveTestimonial,
} = require("../Controller/testimonialController");

router.post("/add", addTestimonial);
router.put("/update/:id", updateTestimonial);
router.get("/live",liveTestimonial)
router.get("/view",viewTestimonial)
router.delete("/delete",deleteAllTestimonial)
router.get("/delete/:id",deleteTestimonial)


module.exports = router;
