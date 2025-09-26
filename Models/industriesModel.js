const mongoose = require("mongoose");

const IndustriesSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    published: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Industry = mongoose.model("Industries", IndustriesSchema);
module.exports = Industry;
