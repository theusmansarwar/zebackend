const Portfolio = require("../Models/portfolioModel");

const addPortfolio = async (req, res) => {
  try {
    let { title, description, thumbnail, images, videos, published} = req.body;

    if (!title ) {
      return res.status(400).json({ message: "Title are required" });
    }

    const newPortfolio = new Portfolio({
      title,
      description,
      thumbnail: thumbnail || "",
      images: images || [],
      videos: videos || [],
      published: published ?? false,
    });

    const savedPortfolio = await newPortfolio.save();

    res.status(201).json({
      status: 201,
      message: "Portfolio created successfully",
      portfolio: savedPortfolio,
    });
  } catch (error) {
    console.error("Error adding portfolio:", error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ Update Portfolio
const updatePortfolio = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, thumbnail, images, videos, published } = req.body;

    const updatedPortfolio = await Portfolio.findByIdAndUpdate(
      id,
      {
        title,
        description,
        thumbnail: thumbnail || "",
        images: images || [],
        videos: videos || [],
        published: published ?? false,
      },
      { new: true, runValidators: true }
    );

    if (!updatedPortfolio) {
      return res.status(404).json({ message: "Portfolio not found" });
    }

    res.status(200).json({
      status: 200,
      message: "Portfolio updated successfully",
      portfolio: updatedPortfolio,
    });
  } catch (error) {
    console.error("Error updating portfolio:", error);
    res.status(500).json({ error: error.message });
  }
};


// ✅ Delete Portfolio
const deletePortfolio = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedPortfolio = await Portfolio.findByIdAndDelete(id);
    if (!deletedPortfolio) {
      return res.status(404).json({ message: "Portfolio not found" });
    }


    res.status(200).json({
      status: 200,
      message: "Portfolio deleted ",
      deletedId: id,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// ✅ Delete multiple Portfolios
const deleteAllPortfolios = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "Invalid request. Provide portfolio IDs." });
    }

    // delete portfolios
    const result = await Portfolio.deleteMany({ _id: { $in: ids } });

   

    res.status(200).json({
      status: 200,
      message: "Portfolios deleted successfully",
      deletedCount: result.deletedCount,
      deletedIds: ids,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Get all portfolios with pagination (excluding deleted)
const getPortfolios = async (req, res) => {
  try {
    let { page = 1, limit = 10 } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    // Fetch portfolios that exist (not deleted)
    const portfolios = await Portfolio.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Portfolio.countDocuments();

    res.status(200).json({
      status: 200,
      page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      portfolios,
    });
  } catch (error) {
    console.error("Error fetching portfolios:", error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ Get only published portfolios with pagination
const getPublishedPortfolios = async (req, res) => {
  try {
    let { page = 1, limit = 10 } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    // Fetch only published portfolios
    const portfolios = await Portfolio.find({ published: true })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Portfolio.countDocuments({ published: true });

    res.status(200).json({
      status: 200,
      page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      portfolios,
    });
  } catch (error) {
    console.error("Error fetching published portfolios:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  addPortfolio,
  updatePortfolio,
  deletePortfolio,
  deleteAllPortfolios,
  getPortfolios,
  getPublishedPortfolios,
};
