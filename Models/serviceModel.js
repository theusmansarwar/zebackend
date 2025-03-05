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
      icon: { type: String, required: true },
      title: { type: String, required: true },
      description: { type: String, required: true },
    },
  ],
  pricing: [
    {
      name: { type: String, required: true }, 
      price: { type: String, required: true },
      title: { type: String, required: true },
      services: [
        {
          name: { type: String, required: true },
        },
      ],
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

ServiceSchema.pre("save", function (next) {
  if (!this.pricing || !Array.isArray(this.pricing)) {
    this.pricing = [];
  }
  next();
});

const Service = mongoose.model("Service", ServiceSchema);
module.exports = Service;
