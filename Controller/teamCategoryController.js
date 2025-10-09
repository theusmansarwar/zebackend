const mongoose = require("mongoose");
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

const deleteAllTeamCategories = async (req, res) => {
  try {
    const { ids } = req.body; // Expecting { ids: ["id1", "id2", ...] }

    // ✅ Validate input
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        status: 400,
        message: "Invalid request. Provide team category IDs.",
      });
    }

    // ✅ Filter valid ObjectIds
    const validIds = ids.filter((id) => mongoose.Types.ObjectId.isValid(id));
    if (validIds.length === 0) {
      return res
        .status(400)
        .json({ status: 400, message: "No valid category IDs provided." });
    }

    // ✅ Check if these team categories exist and are not already deleted
    const existingCategories = await TeamCategory.find({
      _id: { $in: validIds },
      isDeleted: false,
    });

    if (existingCategories.length === 0) {
      return res.status(404).json({
        status: 404,
        message: "No active team categories found with the given IDs.",
      });
    }

    // ✅ Soft delete categories (set isDeleted: true)
    await TeamCategory.updateMany(
      { _id: { $in: validIds } },
      { $set: { isDeleted: true } }
    );

    res.status(200).json({
      status: 200,
      message: `${existingCategories.length} team category(ies) soft-deleted successfully.`,
      deletedCategories: validIds,
    });
  } catch (error) {
    console.error("Error soft deleting team categories:", error);
    res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// ✅ View All Team Categories with Pagination
const viewTeamCategory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Default page = 1
    const limit = parseInt(req.query.limit) || 10; // Default limit = 10

    const totalCategories = await TeamCategory.countDocuments({ isDeleted: false });
    const categories = await TeamCategory.find({ isDeleted: false })
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

    const totalCategories = await TeamCategory.countDocuments({ published: true , deleted: false});
    const categories = await TeamCategory.find({ published: true, isDeleted: false })
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
  deleteAllTeamCategories,
  viewTeamCategory,
  liveTeamCategory
};
