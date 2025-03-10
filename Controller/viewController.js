const { View, TotalImpression } = require("../Models/viewModel");

const incrementImpression = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize time to midnight

    // ✅ Find today's view record
    let viewRecord = await View.findOne({ date: today });

    if (!viewRecord) {
      viewRecord = await View.create({ date: today, views: 1 });
    } else {
      viewRecord.views += 1;
      await viewRecord.save();
    }

    // ✅ Update Total Impression Count
    let totalImpressionRecord = await TotalImpression.findOne();
    if (!totalImpressionRecord) {
      totalImpressionRecord = await TotalImpression.create({ totalImpression: 1 });
    } else {
      totalImpressionRecord.totalImpression += 1;
      await totalImpressionRecord.save();
    }

    // ✅ Remove records older than 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    await View.deleteMany({ date: { $lt: thirtyDaysAgo } });

    return res.status(200).json({
      message: "View recorded successfully",
      todayViews: viewRecord.views,
      totalImpressions: totalImpressionRecord.totalImpression,
    });

  } catch (error) {
    return res.status(500).json({ message: "Error recording view", error });
  }
};

// ✅ Fetch last 30 days records + Yesterday's views
const getImpressionStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize time

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1); // Get yesterday's date

    const last30Days = new Date();
    last30Days.setDate(today.getDate() - 30);

    // ✅ Fetch last 30 days records
    const last30DaysData = await View.find({ date: { $gte: last30Days, $lte: today } })
      .sort({ date: 1 }) // Sort by date ascending
      .select("date views -_id"); // Only return date and views


    return res.status(200).json({
      message: "Impressions fetched successfully",
      last30DaysData, // Data for graph

    });

  } catch (error) {
    return res.status(500).json({ message: "Error fetching impressions", error });
  }
};

module.exports = { incrementImpression, getImpressionStats };
