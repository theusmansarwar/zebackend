const Team = require("../Models/teamsModel");
const Role = require("../Models/roleModel");
const TeamCategory = require("../Models/teamCategoryModel");
const fs = require("fs");
const path = require("path");

// ✅ Create Team Member
const createTeamMember = async (req, res) => {
  try {
    const { name, role, description, category, socialLinks, image, published } = req.body;

    const missingFields = [];
    if (!name) missingFields.push({ name: "name", message: "Name is required" });
    if (!role) missingFields.push({ name: "role", message: "Role is required" });
    if (!description) missingFields.push({ name: "description", message: "Description is required" });
    if (!category) missingFields.push({ name: "category", message: "Category is required" });
    if (!image) missingFields.push({ name: "image", message: "Image is required" });

    if (missingFields.length > 0) {
      return res.status(400).json({ status: 400, message: "Some fields are missing!", missingFields });
    }

    const roleExists = await Role.findById(role);
    if (!roleExists) return res.status(400).json({ message: "Invalid role ID" });

    const categoryExists = await TeamCategory.findById(category);
    if (!categoryExists) return res.status(400).json({ message: "Invalid category ID" });

    const newMember = await Team.create({
      name,
      role,
      description,
      category,
      image, // ✅ path string from upload API
      socialLinks: socialLinks
  ? typeof socialLinks === "string"
    ? JSON.parse(socialLinks)
    : socialLinks
  : {},

      published: published === "true" || published === true,
    });

    res.status(201).json({ status: 201, message: "Team member created", member: newMember });
  } catch (error) {
    console.error("Error creating team member:", error);
    res.status(500).json({ status: 500, message: "Internal server error" });
  }
};

// ✅ Update Team Member
const updateTeamMember = async (req, res) => {
  try {
    const { id } = req.params;
    let { name, role, description, category, socialLinks, published, image } = req.body;

    const member = await Team.findById(id);
    if (!member) return res.status(404).json({ message: "Team member not found" });

    // ✅ validate role
    if (role) {
      const roleExists = await Role.findById(role);
      if (!roleExists) return res.status(400).json({ message: "Invalid role ID" });
      member.role = role;
    }

    // ✅ validate category
    if (category) {
      const categoryExists = await TeamCategory.findById(category);
      if (!categoryExists) return res.status(400).json({ message: "Invalid category ID" });
      member.category = category;
    }

    // ✅ assign values safely
    member.name = name || member.name;
    member.description = description || member.description;

    // ✅ handle socialLinks (stringified or object)
    if (socialLinks) {
      if (typeof socialLinks === "string") {
        try {
          member.socialLinks = JSON.parse(socialLinks);
        } catch (err) {
          return res.status(400).json({ message: "Invalid socialLinks format" });
        }
      } else {
        member.socialLinks = socialLinks;
      }
    }

    // ✅ handle published (boolean or string)
    if (published !== undefined) {
      member.published =
        published === "true" || published === true || published === 1;
    }

    // ✅ update image only if provided
    if (image) {
      member.image = image;
    }

    await member.save();

    res.status(200).json({ status: 200, message: "Team member updated", member });
  } catch (error) {
    console.error("Error updating team member:", error);
    res.status(500).json({ status: 500, message: "Internal server error" });
  }
};


const deleteTeamMember = async (req, res) => {
  try {
    const { id } = req.params;
    const member = await Team.findById(id);
    if (!member) return res.status(404).json({ message: "Team member not found" });

    if (member.image) {
      const filePath = path.join(__dirname, "..", member.image);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await Team.findByIdAndDelete(id);
    res.status(200).json({ status: 200, message: "Team member deleted" });
  } catch (error) {
    console.error("Error deleting team member:", error);
    res.status(500).json({ status: 500, message: "Internal server error" });
  }
};
const deleteAllTeamMembers = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) return res.status(400).json({ message: "Invalid IDs" });

    await Team.deleteMany({ _id: { $in: ids } });
    res.status(200).json({ status: 200, message: "Team members deleted", deleted: ids });
  } catch (error) {
    console.error("Error deleting multiple team members:", error);
    res.status(500).json({ status: 500, message: "Internal server error" });
  }
};

// ✅ Get All Team Members (paginated)
const getAllTeamMembers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Team.countDocuments();
    const members = await Team.find().populate("role").populate("category").skip(skip).limit(limit);

    res.status(200).json({
      status: 200,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      members,
    });
  } catch (error) {
    console.error("Error fetching team members:", error);
    res.status(500).json({ status: 500, message: "Internal server error" });
  }
};

// ✅ Get Single Team Member
const getTeamMemberById = async (req, res) => {
  try {
    const member = await Team.findById(req.params.id).populate("role").populate("category");
    if (!member) return res.status(404).json({ message: "Team member not found" });

    res.status(200).json({ status: 200, member });
  } catch (error) {
    console.error("Error fetching team member:", error);
    res.status(500).json({ status: 500, message: "Internal server error" });
  }
};

// ✅ Get Published Teams Only (Live Teams)
const getTeamLiveMember = async (req, res) => {
  try {
    const teams = await Team.find({ published: true }).populate("role").populate("category").sort({ createdAt: -1 });
    res.status(200).json({ status: 200, message: "Live team members", members: teams });
  } catch (error) {
    console.error("Error fetching live team members:", error);
    res.status(500).json({ status: 500, message: "Internal server error" });
  }
};

module.exports = {
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
  deleteAllTeamMembers,
  getAllTeamMembers,
  getTeamMemberById,
  getTeamLiveMember,
};
