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

// ✅ Delete UserType (with check for related blogs)
const deleteUserType = async (req, res) => {
  try {
    const { id } = req.params;

    const linkedBlogs = await Blogs.find({ UserType: id }).select("title _id slug");

    if (linkedBlogs.length > 0) {
      return res.status(400).json({
        message: "Cannot delete UserType. It is linked to blogs.",
        blogs: linkedBlogs,
      });
    }

    const deleted = await UserType.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "UserType not found" });

    res.status(200).json({ message: "UserType deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Delete Multiple UserType Safely
const deleteAllUserType = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "Invalid request. Provide UserType IDs." });
    }

    const linkedBlogs = await Blogs.find({ UserType: { $in: ids } }).select("title _id UserType");
    const usedTypeIds = [...new Set(linkedBlogs.map(blog => blog.UserType.toString()))];
    const deletableIds = ids.filter(id => !usedTypeIds.includes(id));

    if (deletableIds.length === 0) {
      return res.status(400).json({
        message: "Cannot delete UserType. All are linked to blogs.",
        linkedBlogs,
      });
    }

    await UserType.deleteMany({ _id: { $in: deletableIds } });

    res.status(200).json({
      status: 200,
      message: "UserType deleted successfully.",
      deletedUserType: deletableIds,
      failedToDelete: usedTypeIds,
      linkedBlogs,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ View All User Types with Pagination
const viewUserType = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const totalUserType = await UserType.countDocuments();
    const userType = await UserType.find()
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
    const userType = await UserType.find({ published: true }).sort({ createdAt: -1 });

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
  deleteUserType,
  deleteAllUserType,
  viewUserType,
  liveUserType,
};
