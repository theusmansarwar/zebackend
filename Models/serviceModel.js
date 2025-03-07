const mongoose = require("mongoose");

const ServiceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  introduction: {
    type: String,
    required: true,
  },
  image: {
    type: String, 
    required: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  published: { type: Boolean, default: false },
  subservices: [
    {
      _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
      image: { type: String, required: true }, 
      title: { type: String, required: true },
      description: { type: String, required: true },
      published: { type: Boolean, default: false },
    },
  ],
  benefits: [
    {
      _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
      title: { type: String, required: true },
      image: { type: String, required: true }, 
      description: { type: String, required: true },
      published: { type: Boolean, default: false },
    },
  ],
  process: [
    {
      _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
      image: { type: String, required: true },
      title: { type: String, required: true },
      description: { type: String, required: true },
      published: { type: Boolean, default: false },
    },
  ],
  isPricing: { type: Boolean, default: false },
  pricing: [{ type: mongoose.Schema.Types.ObjectId, ref: "Pricing" }],

} ,
{ timestamps: true });



const Service = mongoose.model("Service", ServiceSchema);
module.exports = Service;
