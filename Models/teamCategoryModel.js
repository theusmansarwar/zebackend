const mongoose = require("mongoose");

const TeamCategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    published: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const TeamCategory = mongoose.model("TeamCategory", TeamCategorySchema);
module.exports = TeamCategory;
