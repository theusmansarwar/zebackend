const mongoose = require("mongoose");

const ServiceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    short_description: { type: String },
    metaDescription: { type: String, maxlength: 160, trim: true },
    slug: { type: String, unique: true },
    icon: { type: String},

     introduction: {
      title: { type: String },
      description: { type: String },
      image: { type: String },
      published: { type: Boolean, default: false },
    },
    provenSteps: {
      title: { type: String },
      steps: [{ type: String }],
      published: { type: Boolean, default: false },
    },
      cta: {
      title: { type: String },
      description: { type: String },
      published: { type: Boolean, default: false },
    },
    imageSection: {
      title: { type: String },
      description: { type: String },
      image: { type: String },
      published: { type: Boolean, default: false },
    },
     whysection: {
      title: { type: String },
      description: { type: String },
      published: { type: Boolean, default: false },
    },
    faqs: {
      title: { type: String },
      description: { type: String },
      items: [{ type: mongoose.Schema.Types.ObjectId, ref: "Faqs" }],
      published: { type: Boolean, default: false },
    },
   
   
    portfolio: {
      items: [{ type: mongoose.Schema.Types.ObjectId, ref: "Portfolio" }],
      published: { type: Boolean, default: false },
    },
    published: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const SubServices = mongoose.model("subServices", ServiceSchema);
module.exports = SubServices;
