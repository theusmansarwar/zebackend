const Industry = require("../Models/industriesModel");

// ✅ Add Industry
const addIndustry = async (req, res) => {
  try {
    let { name, description,detail, image, published } = req.body;
    const missingFields = [];

    if (!name) missingFields.push({ field: "name", message: "Name is required" });
    if (!description) missingFields.push({ field: "description", message: "Description is required" });
     if (!detail) missingFields.push({ field: "detail", message: "Detail is required" });
    if (!image) missingFields.push({ field: "image", message: "Image is required" });

    if (missingFields.length > 0) {
      return res.status(400).json({
        status: 400,
        message: "Some fields are missing!",
        missingFields,
      });
    }

    name = name.trim();

    const existingIndustry = await Industry.findOne({ name: new RegExp(`^${name}$`, "i") });
    if (existingIndustry) {
      return res.status(400).json({ message: "Industry already exists" });
    }

    const newIndustry = new Industry({ name, description, detail, image, published });
    await newIndustry.save();

    res.status(201).json({
      status: 201,
      message: "Industry added successfully",
      industry: newIndustry,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Update Industry (with missing field check)
const updateIndustry = async (req, res) => {
  try {
    const { id } = req.params;
    let { name, description,detail, image, published } = req.body;

    const missingFields = [];
    if (!name) missingFields.push({ field: "name", message: "Name is required" });
    if (!description) missingFields.push({ field: "description", message: "Description is required" });
    
     if (!detail) missingFields.push({ field: "detail", message: "Detail is required" });
    if (!image) missingFields.push({ field: "image", message: "Image is required" });

    if (missingFields.length > 0) {
      return res.status(400).json({
        status: 400,
        message: "Some fields are missing!",
        missingFields,
      });
    }

    name = name.trim();

    const existingIndustry = await Industry.findOne({ name: new RegExp(`^${name}$`, "i") });
    if (existingIndustry && existingIndustry._id.toString() !== id) {
      return res.status(400).json({ message: "Industry name already exists" });
    }

    const updatedIndustry = await Industry.findByIdAndUpdate(
      id,
      { name, description, image, detail,published },
      { new: true, runValidators: true }
    );

    if (!updatedIndustry) return res.status(404).json({ message: "Industry not found" });

    res.status(200).json({
      status: 200,
      message: "Industry updated successfully",
      industry: updatedIndustry,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// ✅ Get CaseStudy by ID
const getIndustryById = async (req, res) => {
  try {
    const { id } = req.params;

    const industry = await Industry.findById(id);

    if (!industry) {
      return res.status(404).json({ 
        status: 404, 
        message: "Industry not found" 
      });
    }

    res.status(200).json({
      status: 200,
      message: "Industry fetched successfully",
      industry: industry,
    });
  } catch (error) {
    console.error("Error fetching Industry:", error);
    res.status(500).json({ 
      status: 500, 
      message: "Internal server error", 
      error: error.message 
    });
  }
};
// ✅ Delete Industry
const deleteIndustry = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedIndustry = await Industry.findByIdAndDelete(id);

    if (!deletedIndustry) return res.status(404).json({ message: "Industry not found" });

    res.status(200).json({ message: "Industry deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Delete multiple industries
const deleteAllIndustries = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "Invalid request. Provide Industry IDs." });
    }

    const result = await Industry.deleteMany({ _id: { $in: ids } });

    res.status(200).json({
      status: 200,
      message: "Industries deleted successfully.",
      deletedCount: result.deletedCount,
      deletedIds: ids,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ View Industries with pagination
const viewIndustry = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const totalIndustries = await Industry.countDocuments();
    const industries = await Industry.find()
    .select("-detail")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    res.status(200).json({
      totalIndustries,
      totalPages: Math.ceil(totalIndustries / limit),
      currentPage: page,
      limit,
      industries,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ View only published industries
const liveIndustry = async (req, res) => {
  try {
    const industries = await Industry.find({ published: true }).sort({ createdAt: -1 });
    res.status(200).json({
      totalIndustries: industries.length,
      industries,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  addIndustry,
  updateIndustry,
  deleteIndustry,
  viewIndustry,
  liveIndustry,
  deleteAllIndustries,
  getIndustryById
};
