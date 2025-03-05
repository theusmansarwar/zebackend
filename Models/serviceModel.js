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

} ,
{ timestamps: true });

ServiceSchema.pre("save", function (next) {
  if (!this.pricing || !Array.isArray(this.pricing)) {
    this.pricing = [];
  }
  next();
});

const Service = mongoose.model("Service", ServiceSchema);
module.exports = Service;
