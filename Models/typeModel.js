const mongoose = require("mongoose");

const USerTypeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    published: { type: Boolean, default: false }
  },
  { timestamps: true }
);

const UserType = mongoose.model("UserType", USerTypeSchema);
module.exports = UserType;
