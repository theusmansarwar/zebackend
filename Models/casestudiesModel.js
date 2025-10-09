const mongoose = require("mongoose");

const CaseStudiesSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    detail: { type: String, required: true },
    image: { type: String, required: true },
    file: { type: String, required: true },
    published: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const CaseStudy = mongoose.model("CaseStudies", CaseStudiesSchema);
module.exports = CaseStudy;
