const Portfolio = require("../Models/portfolioModel");
const Services = require("../Models/serviceModel");

// ✅ Create Portfolio & Link to Service
const addPortfolio = async (req, res) => {
  try {
    let { title, description, thumbnail, images, videos, published, serviceid } = req.body;

    if (!title || !serviceid) {
      return res.status(400).json({ message: "Title and Service ID are required" });
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

    // link to service
    const updatedService = await Services.findByIdAndUpdate(
      serviceid,
      { $push: { "portfolio.items": savedPortfolio._id } },
      { new: true }
    );

    if (!updatedService) {
      return res.status(404).json({ message: "Service not found to link Portfolio" });
    }

    res.status(201).json({
      status: 201,
      message: "Portfolio created & linked to service successfully",
      portfolio: savedPortfolio,
      linkedService: updatedService._id,
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

    // unlink from all services
    await Services.updateMany(
      { "portfolio.items": id },
      { $pull: { "portfolio.items": id } }
    );

    res.status(200).json({
      status: 200,
      message: "Portfolio deleted & unlinked from services",
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

    // unlink from all services
    await Services.updateMany(
      { "portfolio.items": { $in: ids } },
      { $pull: { "portfolio.items": { $in: ids } } }
    );

    res.status(200).json({
      status: 200,
      message: "Portfolios deleted & unlinked from services successfully",
      deletedCount: result.deletedCount,
      deletedIds: ids,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


module.exports = { addPortfolio, updatePortfolio, deletePortfolio, deleteAllPortfolios };
