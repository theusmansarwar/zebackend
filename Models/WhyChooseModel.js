const mongoose = require("mongoose");

const WhyChooseSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
  },
  { timestamps: true }
);

const WhyChoose = mongoose.model("WhyChoose", WhyChooseSchema);
module.exports = WhyChoose;
