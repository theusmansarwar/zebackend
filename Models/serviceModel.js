const mongoose = require("mongoose");

const ServiceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    short_description: { type: String },
    metaDescription: { type: String, maxlength: 160, trim: true },
    slug: { type: String, unique: true },
    icon: { type: String},
    faqs: {
      title: { type: String },
      description: { type: String },
      items: [{ type: mongoose.Schema.Types.ObjectId, ref: "Faqs" }],
      published: { type: Boolean, default: false },
    },
    how_we_delivered: {
      description: { type: String },
      lower_description: { type: String },
      image: { type: String },
      published: { type: Boolean, default: false },
    },
    portfolio: {
      items: [{ type: mongoose.Schema.Types.ObjectId, ref: "Portfolio" }],
      published: { type: Boolean, default: false },
    },
    video: {
      description: { type: String },
      url: { type: String },
      published: { type: Boolean, default: false },
    },
    detail: { type: String },
    published: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Services = mongoose.model("Services", ServiceSchema);
module.exports = Services;
