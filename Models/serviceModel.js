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
      img: { type: String, required: true }, 
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
  pricing: [
    {
      _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
      name: { type: String, required: true }, 
      price: { type: String, required: true },
      title: { type: String, required: true },
      published: { type: Boolean, default: false },
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
