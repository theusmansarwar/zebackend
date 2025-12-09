const mongoose = require("mongoose");

const WhyStepsSchema = new mongoose.Schema(
  {
    stepTitle: { type: String, required: true },
    stepDescription: { type: String, required: true },
  },
  { timestamps: true }
);

const WhySteps = mongoose.model("WhySteps", WhyStepsSchema);
module.exports = WhySteps;
