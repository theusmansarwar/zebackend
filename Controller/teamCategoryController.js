const TeamCategory = require("../Models/teamCategoryModel");

// ✅ Add Team Category
const addTeamCategory = async (req, res) => {
  try {
    let { name, published } = req.body;

    if (!name) return res.status(400).json({ message: "Category name is required" });

    name = name.trim();
    const existingCategory = await TeamCategory.findOne({ name: new RegExp(`^${name}$`, "i") });

    if (existingCategory) {
      return res.status(400).json({ message: "Category already exists" });
    }

    const category = new TeamCategory({ name, published });
    await category.save();

    res.status(201).json({ status: 201, message: "Team Category added successfully", category });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Update Team Category
const updateTeamCategory = async (req, res) => {
  try {
    const { id } = req.params;
    let { name, published } = req.body;

    if (!name) return res.status(400).json({ message: "Category name is required" });

    name = name.trim();
    const existingCategory = await TeamCategory.findOne({ name: new RegExp(`^${name}$`, "i") });

    if (existingCategory && existingCategory._id.toString() !== id) {
      return res.status(400).json({ message: "Category name already exists" });
    }

    const category = await TeamCategory.findByIdAndUpdate(
      id,
      { name, published },
      { new: true, runValidators: true }
    );

    if (!category) return res.status(404).json({ message: "Category not found" });

    res.status(200).json({ status: 200, message: "Category updated successfully", category });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Delete Team Category
const deleteTeamCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await TeamCategory.findByIdAndDelete(id);

    if (!category) return res.status(404).json({ message: "Category not found" });

    res.status(200).json({ message: "Team Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Delete Multiple Team Categories
const deleteAllTeamCategories = async (req, res) => {
  try {
    const { ids } = req.body; // Expecting { ids: ["id1", "id2", ...] }

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "Invalid request. Provide category IDs." });
    }

    await TeamCategory.deleteMany({ _id: { $in: ids } });

    res.status(200).json({
      status: 200,
      message: "Team Categories deleted successfully.",
      deletedCategories: ids
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ View All Team Categories with Pagination
const viewTeamCategory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Default page = 1
    const limit = parseInt(req.query.limit) || 10; // Default limit = 10

    const totalCategories = await TeamCategory.countDocuments();
    const categories = await TeamCategory.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    res.status(200).json({
      totalCategories,
      totalPages: Math.ceil(totalCategories / limit),
      currentPage: page,
      limit,
      categories
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ View Only Published Team Categories with Pagination
const liveTeamCategory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const totalCategories = await TeamCategory.countDocuments({ published: true });
    const categories = await TeamCategory.find({ published: true })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    res.status(200).json({
      totalCategories,
      totalPages: Math.ceil(totalCategories / limit),
      currentPage: page,
      limit,
      categories
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  addTeamCategory,
  updateTeamCategory,
  deleteTeamCategory,
  deleteAllTeamCategories,
  viewTeamCategory,
  liveTeamCategory
};
