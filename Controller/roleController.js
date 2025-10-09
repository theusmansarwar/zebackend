const mongoose = require("mongoose");
const Role = require("../Models/roleModel");
const Blogs = require("../Models/blogModel"); // ✅ Required for blog-role relation

// ✅ Add Role
const addRole = async (req, res) => {
  try {
    let { name, published } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Role name is required" });
    }

    name = name.trim(); // ✅ Trim whitespace
    const existingRole = await Role.findOne({ name: new RegExp(`^${name}$`, "i") });

    if (existingRole) {
      return res.status(400).json({ message: "Role already exists" });
    }

    const role = new Role({ name, published });
    await role.save();
    
    res.status(201).json({ status: 201, message: "Role added successfully", role });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Update Role
const updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    let { name, published } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Role name is required" });
    }

    name = name.trim(); // ✅ Trim whitespace

    const existingRole = await Role.findOne({ name: new RegExp(`^${name}$`, "i") });
    if (existingRole && existingRole._id.toString() !== id) {
      return res.status(400).json({ message: "Role name already exists" });
    }

    const role = await Role.findByIdAndUpdate(
      id,
      { name, published },
      { new: true, runValidators: true }
    );

    if (!role) return res.status(404).json({ message: "Role not found" });

    res.status(200).json({ status: 200, message: "Role updated successfully", role });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



const deleteAllRole = async (req, res) => {
  try {
    const { ids } = req.body; // Expecting { ids: ["id1", "id2", ...] }

    // ✅ Validate input
    if (!Array.isArray(ids) || ids.length === 0) {
      return res
        .status(400)
        .json({ status: 400, message: "Invalid request. Provide role IDs." });
    }

    // ✅ Filter only valid ObjectIds
    const validIds = ids.filter((id) => mongoose.Types.ObjectId.isValid(id));
    if (validIds.length === 0) {
      return res
        .status(400)
        .json({ status: 400, message: "No valid role IDs provided." });
    }

    // ✅ Find blogs linked to these roles
    const linkedBlogs = await Blogs.find({ role: { $in: validIds } }).select(
      "title _id role"
    );

    // ✅ Extract role IDs that have linked blogs
    const rolesWithBlogs = [...new Set(linkedBlogs.map((blog) => blog.role.toString()))];

    // ✅ Filter out roles that can be safely deleted
    const rolesToDelete = validIds.filter((id) => !rolesWithBlogs.includes(id));

    if (rolesToDelete.length === 0) {
      return res.status(400).json({
        status: 400,
        message: "Cannot delete roles. All are linked to blogs.",
        linkedBlogs,
      });
    }

    // ✅ Soft delete roles that are not linked to any blogs
    await Role.updateMany(
      { _id: { $in: rolesToDelete } },
      { $set: { isDeleted: true } }
    );

    res.status(200).json({
      status: 200,
      message: `${rolesToDelete.length} role(s) soft-deleted successfully.`,
      deletedRoles: rolesToDelete,
      failedToDelete: rolesWithBlogs,
      linkedBlogs,
    });
  } catch (error) {
    console.error("Error soft deleting roles:", error);
    res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// ✅ View Roles with Pagination
const viewRole = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const totalRoles = await Role.countDocuments({ isDeleted: false });
    const roles = await Role.find({ isDeleted: false })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    res.status(200).json({
      totalRoles,
      totalPages: Math.ceil(totalRoles / limit),
      currentPage: page,
      limit,
      roles,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const liveRole = async (req, res) => {
    try {
      const roles = await Role.find({ published: true, isDeleted: false }).sort({ createdAt: -1 });
  
      res.status(200).json({
        totalRoles: roles.length,
        roles,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  

module.exports = { addRole, updateRole, viewRole, liveRole, deleteAllRole };
