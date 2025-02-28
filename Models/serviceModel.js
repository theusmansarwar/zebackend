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
  },
  services: [
    {
      icon: { type: String, required: true }, 
      name: { type: String, required: true },
      description: { type: String, required: true },
    },
  ],
  benefits: [
    {
      name: { type: String, required: true },
      img: { type: String, required: true }, 
      description: { type: String, required: true },
    },
  ],
  process: [
    {
      icon: { type: String, required: true }, // Store icon name as a string
      title: { type: String, required: true },
      description: { type: String, required: true },
    },
  ],
});


const Service = mongoose.model("Service", ServiceSchema);
module.exports = Service;
