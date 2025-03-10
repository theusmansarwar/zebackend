const mongoose = require("mongoose");

const ViewSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true, unique: true }, // Stores unique daily records
    views: { type: Number, default: 0 }, // Daily view count
  },
  { timestamps: true }
);

// Automatically delete records older than 30 days before each save
ViewSchema.pre("save", async function (next) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  await this.model("View").deleteMany({ date: { $lt: thirtyDaysAgo } });
  next();
});

const View = mongoose.model("View", ViewSchema);
module.exports = View;
