const mongoose = require("mongoose");

const ViewSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true, unique: true }, // Stores unique daily records
    views: { type: Number, default: 0 }, // Daily view count
  },
  { timestamps: true }
);

// ✅ Schema for Storing Total Impressions Separately
const TotalImpressionSchema = new mongoose.Schema(
  {
    totalImpression: { type: Number, default: 0 }
  }
);

// ✅ Automatically delete records older than 30 days (BUT KEEP totalImpression)
ViewSchema.pre("save", async function (next) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  await this.model("View").deleteMany({ date: { $lt: thirtyDaysAgo } });

  next();
});

// ✅ Create Models
const View = mongoose.model("View", ViewSchema);
const TotalImpression = mongoose.model("TotalImpression", TotalImpressionSchema);

module.exports = { View, TotalImpression };
