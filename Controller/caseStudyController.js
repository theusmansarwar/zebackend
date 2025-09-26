const CaseStudy = require("../Models/casestudiesModel");

// ✅ Add CaseStudy
const addCaseStudy = async (req, res) => {
  try {
    let { name, description,detail,file, image, published } = req.body;
    const missingFields = [];

    if (!name) missingFields.push({ name: "name", message: "Name is required" });
    if (!description) missingFields.push({ name: "description", message: "Description is required" });
     if (!detail) missingFields.push({ name: "detail", message: "Detail is required" });
    if (!image) missingFields.push({ name: "image", message: "Image is required" });
    if (!file) missingFields.push({ name: "file", message: "File is required" });

    if (missingFields.length > 0) {
      return res.status(400).json({
        status: 400,
        message: "Some fields are missing!",
        missingFields,
      });
    }

    name = name.trim();

    const existingCaseStudy = await CaseStudy.findOne({ name: new RegExp(`^${name}$`, "i") });
    if (existingCaseStudy) {
      return res.status(400).json({ message: "CaseStudy already exists" });
    }

    const newCaseStudy = new CaseStudy({ name, description, detail, image, file, published });
    await newCaseStudy.save();

    res.status(201).json({
      status: 201,
      message: "CaseStudy added successfully",
      CaseStudy: newCaseStudy,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Update CaseStudy (with missing field check)
const updateCaseStudy = async (req, res) => {
  try {
    const { id } = req.params;
    let { name, description,detail, image,file, published } = req.body;

    const missingFields = [];
    if (!name) missingFields.push({ name: "name", message: "Name is required" });
    if (!description) missingFields.push({ name: "description", message: "Description is required" });
    
    if (!file) missingFields.push({ name: "file", message: "File is required" });
     if (!detail) missingFields.push({ name: "detail", message: "Detail is required" });
    if (!image) missingFields.push({ name: "image", message: "Image is required" });

    if (missingFields.length > 0) {
      return res.status(400).json({
        status: 400,
        message: "Some fields are missing!",
        missingFields,
      });
    }

    name = name.trim();

    const existingCaseStudy = await CaseStudy.findOne({ name: new RegExp(`^${name}$`, "i") });
    if (existingCaseStudy && existingCaseStudy._id.toString() !== id) {
      return res.status(400).json({ message: "CaseStudy name already exists" });
    }

    const updatedCaseStudy = await CaseStudy.findByIdAndUpdate(
      id,
      { name, description, image, detail, file, published },
      { new: true, runValidators: true }
    );

    if (!updatedCaseStudy) return res.status(404).json({ message: "CaseStudy not found" });

    res.status(200).json({
      status: 200,
      message: "CaseStudy updated successfully",
      CaseStudy: updatedCaseStudy,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Get CaseStudy by ID
const getCaseStudyById = async (req, res) => {
  try {
    const { id } = req.params;

    const caseStudy = await CaseStudy.findById(id);

    if (!caseStudy) {
      return res.status(404).json({ 
        status: 404, 
        message: "CaseStudy not found" 
      });
    }

    res.status(200).json({
      status: 200,
      message: "CaseStudy fetched successfully",
      CaseStudy: caseStudy,
    });
  } catch (error) {
    console.error("Error fetching CaseStudy:", error);
    res.status(500).json({ 
      status: 500, 
      message: "Internal server error", 
      error: error.message 
    });
  }
};

// ✅ Delete CaseStudy
const deleteCaseStudy = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCaseStudy = await CaseStudy.findByIdAndDelete(id);

    if (!deletedCaseStudy) return res.status(404).json({ message: "CaseStudy not found" });

    res.status(200).json({ message: "CaseStudy deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Delete multiple CaseStudies
const deleteAllCaseStudies = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "Invalid request. Provide CaseStudy IDs." });
    }

    const result = await CaseStudy.deleteMany({ _id: { $in: ids } });

    res.status(200).json({
      status: 200,
      message: "CaseStudies deleted successfully.",
      deletedCount: result.deletedCount,
      deletedIds: ids,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ View CaseStudies with pagination
const viewCaseStudy = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const totalCaseStudies = await CaseStudy.countDocuments();
    const CaseStudies = await CaseStudy.find()
    .select("-detail")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    res.status(200).json({
      totalCaseStudies,
      totalPages: Math.ceil(totalCaseStudies / limit),
      currentPage: page,
      limit,
      CaseStudies,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ View only published CaseStudies
const liveCaseStudy = async (req, res) => {
  try {
    const CaseStudies = await CaseStudy.find({ published: true }).sort({ createdAt: -1 });
    res.status(200).json({
      totalCaseStudies: CaseStudies.length,
      CaseStudies,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  addCaseStudy,
  updateCaseStudy,
  deleteCaseStudy,
  viewCaseStudy,
  getCaseStudyById,
  liveCaseStudy,
  deleteAllCaseStudies,
};
