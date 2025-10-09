const mongoose = require("mongoose");
const UserType = require("../Models/typeModel");
const Blogs = require("../Models/blogModel"); // ✅ Import your Blogs model

// ✅ Add UserType
const addUserType = async (req, res) => {
  try {
    let { name, published } = req.body;

    if (!name) {
      return res.status(400).json({ message: "UserType name is required" });
    }

    name = name.trim();
    const existing = await UserType.findOne({ name: new RegExp(`^${name}$`, "i") });

    if (existing) {
      return res.status(400).json({ message: "UserType already exists" });
    }

    const newUserType = new UserType({ name, published });
    await newUserType.save();

    res.status(201).json({ status: 201, message: "UserType added successfully", UserType: newUserType });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Update UserType
const updateUserType = async (req, res) => {
  try {
    const { id } = req.params;
    let { name, published } = req.body;

    if (!name) {
      return res.status(400).json({ message: "UserType name is required" });
    }

    name = name.trim();
    const existing = await UserType.findOne({ name: new RegExp(`^${name}$`, "i") });

    if (existing && existing._id.toString() !== id) {
      return res.status(400).json({ message: "UserType name already exists" });
    }

    const updated = await UserType.findByIdAndUpdate(
      id,
      { name, published },
      { new: true, runValidators: true }
    );

    if (!updated) return res.status(404).json({ message: "UserType not found" });

    res.status(200).json({ status: 200, message: "UserType updated successfully", UserType: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Delete Multiple UserType Safely
const deleteAllUserType = async (req, res) => {
  try {
    const { ids } = req.body;

    // ✅ Validate input
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        status: 400,
        message: "Invalid request. Provide UserType IDs.",
      });
    }

    // ✅ Find all blogs that are linked with these UserTypes
    const linkedBlogs = await Blogs.find({ UserType: { $in: ids } }).select(
      "title _id UserType"
    );

    // ✅ Extract UserType IDs that are currently linked to blogs
    const usedTypeIds = [
      ...new Set(linkedBlogs.map((blog) => blog.UserType.toString())),
    ];

    // ✅ Filter out IDs that can be safely soft deleted
    const deletableIds = ids.filter((id) => !usedTypeIds.includes(id));

    if (deletableIds.length === 0) {
      return res.status(400).json({
        status: 400,
        message: "Cannot delete UserType. All are linked to blogs.",
        linkedBlogs,
      });
    }

    // ✅ Perform soft delete (mark as deleted)
    const result = await UserType.updateMany(
      { _id: { $in: deletableIds } },
      { $set: { isDeleted: true } }
    );

    res.status(200).json({
      status: 200,
      message: `${result.modifiedCount} UserType(s) soft deleted successfully.`,
      softDeletedUserTypes: deletableIds,
      failedToDelete: usedTypeIds,
      linkedBlogs,
    });
  } catch (error) {
    console.error("Error soft deleting UserTypes:", error);
    res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
};


// ✅ View All User Types with Pagination
const viewUserType = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const totalUserType = await UserType.countDocuments({ isDeleted: false });
    const userType = await UserType.find({ isDeleted: false })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      totalUserType,
      totalPages: Math.ceil(totalUserType / limit),
      currentPage: page,
      limit,
      userType,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ View Only Published UserTypes
const liveUserType = async (req, res) => {
  try {
    const userType = await UserType.find({ published: true, deleted: false }).sort({ createdAt: -1 });

    res.status(200).json({
      totalUserType: userType.length,
      userType,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  addUserType,
  updateUserType,
  deleteAllUserType,
  viewUserType,
  liveUserType,
};
