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

// ✅ Delete Role (Show List of Related Blogs)
const deleteRole = async (req, res) => {
    try {
      const { id } = req.params;
  
      // ✅ Find all blogs linked to this role
      const existingBlogs = await Blogs.find({ role: id }).select("title _id slug");
  
      if (existingBlogs.length > 0) {
        return res.status(400).json({ 
          message: "Cannot delete role. It is linked to blogs.", 
          blogs: existingBlogs // ✅ Return list of linked blogs (ID + Title)
        });
      }
  
      // ✅ Delete the role if no linked blogs
      const role = await Role.findByIdAndDelete(id);
      if (!role) return res.status(404).json({ message: "Role not found" });
  
      res.status(200).json({ message: "Role deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
};

// ✅ Delete Multiple Roles
const deleteAllRole = async (req, res) => {
  try {
    const { ids } = req.body; // Expecting { ids: ["id1", "id2", ...] }

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "Invalid request. Provide role IDs." });
    }
    const linkedBlogs = await Blogs.find({ role: { $in: ids } }).select("title _id role");

    // ✅ Extract role IDs that have linked blogs
    const rolesWithBlogs = [...new Set(linkedBlogs.map(blog => blog.role.toString()))];

    // ✅ Filter out roles that can be deleted
    const rolesToDelete = ids.filter(id => !rolesWithBlogs.includes(id));

    if (rolesToDelete.length === 0) {
      return res.status(400).json({ 
        message: "Cannot delete roles. All are linked to blogs.", 
        linkedBlogs
      });
    }

    // ✅ Delete roles that are not linked to any blogs
    await Role.deleteMany({ _id: { $in: rolesToDelete } });

    res.status(200).json({
      status:200,
      message: "Roles deleted successfully.",
      deletedRoles: rolesToDelete,
      failedToDelete: rolesWithBlogs,
      linkedBlogs
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ View Roles with Pagination
const viewRole = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const totalRoles = await Role.countDocuments();
    const roles = await Role.find()
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
      const roles = await Role.find({ published: true }).sort({ createdAt: -1 });
  
      res.status(200).json({
        totalRoles: roles.length,
        roles,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  

module.exports = { addRole, updateRole, deleteRole, viewRole, liveRole, deleteAllRole };
