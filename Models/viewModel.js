const mongoose = require("mongoose");

const ViewSchema = new mongoose.Schema(
  {
    views: { type: Number, default: 0 },
  },
  { timestamps: true } // ✅ Adds `createdAt` and `updatedAt`
);

const View = mongoose.model("View", ViewSchema);
module.exports = View;
