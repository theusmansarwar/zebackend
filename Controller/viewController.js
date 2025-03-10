const Impression = require("../Models/adminModel");
const View = require("../Models/viewModel");

// ✅ Increment Impression Count
const incrementImpression = async (req, res) => {
  try {
    let impressionData = await View.findOne();

    if (!impressionData) {
      // If no document exists, create one with an initial count of 1
      impressionData = await View.create({ views: 1 });
    } else {
      // Increment the existing impression count
      impressionData.views += 1;
      await impressionData.save();
    }

    return res.status(200).json({ 
      message: "Impression recorded successfully",
      count: impressionData.views 
    });
  } catch (error) {
    return res.status(500).json({ message: "Error recording impression", error });
  }
};

module.exports = { incrementImpression };


