const mongoose = require("mongoose");

const ProvenStepsSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
  },
  { timestamps: true }
);

const ProvenSteps = mongoose.model("ProvenSteps", ProvenStepsSchema);
module.exports = ProvenSteps;
