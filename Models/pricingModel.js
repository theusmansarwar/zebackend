const mongoose = require("mongoose");

const PricingSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    price: {
      type: String,
      required: true,
    },
    validity: {
      type: String,
      required: true,
    },
    published: {
      type: Boolean,
      default: false,
    },
     isDeleted: { type: Boolean, default: false },
    features: [
      {
        type: String,
        required: true,
      },
    ],
  },
  { timestamps: true }
);

const Pricing = mongoose.model("Pricing", PricingSchema);
module.exports = Pricing;
