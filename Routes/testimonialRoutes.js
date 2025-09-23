const express = require("express");
const router = express.Router();

const {
    addTestimonial,
  updateTestimonial,
  deleteTestimonial,
  deleteAllTestimonial,
  viewTestimonial,
  liveTestimonial,
  viewTestimonialById,
} = require("../Controller/testimonialController");
const authMiddleware = require("../Middleware/authMiddleware");

router.post("/add", addTestimonial);
router.put("/update/:id", updateTestimonial);
router.get("/live",liveTestimonial)
router.get("/view",viewTestimonial)
router.get("/view/:id",viewTestimonialById)
router.delete("/delete",deleteAllTestimonial)
router.get("/delete/:id",deleteTestimonial)


module.exports = router;
