const View = require("../Models/viewModel");

// ✅ Increment Daily Impression Count
const incrementImpression = async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0]; // Format YYYY-MM-DD

    let impressionData = await View.findOne({ date: today });

    if (!impressionData) {
      // If no record exists for today, create a new one
      impressionData = await View.create({ date: today, views: 1 });
    } else {
      // Increment today's view count
      impressionData.views += 1;
      await impressionData.save();
    }

    // ✅ Delete records older than 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    await View.deleteMany({ date: { $lt: thirtyDaysAgo } });

    return res.status(200).json({ 
      message: "Impression recorded successfully",
      todayViews: impressionData.views 
    });
  } catch (error) {
    return res.status(500).json({ message: "Error recording impression", error });
  }
};


const getImpressionStats = async (req, res) => {
  try {
    const today = new Date();
    const last30Days = new Date();
    last30Days.setDate(today.getDate() - 30);

    // Fetch last 30 days records
    const last30DaysData = await View.find({ date: { $gte: last30Days, $lte: today } })
      .sort({ date: 1 }) // Sort by date ascending
      .select("date views -_id"); // Only return date and views

    return res.status(200).json({
      message: "Impressions fetched successfully",
      last30DaysData, // Send records for graph plotting
    });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching impressions", error });
  }
};

module.exports = { incrementImpression, getImpressionStats };
