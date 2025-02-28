const mongoose = require("mongoose");

const TestimonialSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    service: { type: String, required: true },
    location: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    rating: { type: Number, required: true, min: 0, max: 5 }, // Rating between 0 and 5
    published: { type: Boolean, default: false },
  
  },
  { timestamps: true }
);

const Testimonials = mongoose.model("Testimonials", TestimonialSchema);
module.exports = Testimonials;
