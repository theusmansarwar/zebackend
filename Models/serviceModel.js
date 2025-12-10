const mongoose = require("mongoose");

const ServiceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    metatitle: { type: String, required: true },
    description: { type: String },
    short_description: { type: String },
    metaDescription: { type: String, maxlength: 160, trim: true },
    slug: { type: String, unique: true },
    icon: { type: String },
    menuImg: { type: String },

    secondSection: {
      title: { type: String },
      image: { type: String },
      items: [{ type: mongoose.Schema.Types.ObjectId, ref: "SecondSection" }],
      published: { type: Boolean, default: false },
    },

    whySteps: {
      title: { type: String },
      description: { type: String },
      image: { type: String },
      items: [{ type: mongoose.Schema.Types.ObjectId, ref: "WhySteps" }],
      published: { type: Boolean, default: false },
    },

    faqs: {
      title: { type: String },
      description: { type: String },
      items: [{ type: mongoose.Schema.Types.ObjectId, ref: "Faqs" }],
      published: { type: Boolean, default: false },
    },

    imageSection: {
      title: { type: String },
      image: { type: String },
      published: { type: Boolean, default: false },
    },

    firstSection: {
      title: { type: String },
      description: { type: String },
      image: { type: String },
      published: { type: Boolean, default: false },
    },
    contentSection: {
      title: { type: String },
      description: { type: String },
      published: { type: Boolean, default: false },
    },

    subServices: {
      published: { type: Boolean, default: false },
      items: [{ type: mongoose.Schema.Types.ObjectId, ref: "subServices" }],
    },
    published: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Services = mongoose.model("Services", ServiceSchema);
module.exports = Services;
