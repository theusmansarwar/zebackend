const mongoose = require("mongoose");

const TestimonialSchema = new mongoose.Schema(
  {
    image: { type: String, required: true },
    whatwedid: { type: String, required: true },
    clientsays: { type: String, required: true },
    rating: { type: Number, required: true, min: 0, max: 5 }, 
    published: { type: Boolean, default: false },
    boost: { type: String, required: true },
     boosttext: { type: String, required: true },
  
  },
  { timestamps: true }
);

const Testimonials = mongoose.model("Testimonials", TestimonialSchema);
module.exports = Testimonials;
