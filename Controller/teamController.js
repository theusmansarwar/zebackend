const Team = require("../Models/teamsModel");
const TeamCategory =require("../Models/teamCategoryModel")
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Role = require("../Models/roleModel");

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

// File filter to allow only images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

// Multer Upload Middleware
const upload = multer({ storage: storage, fileFilter: fileFilter });

// Create a new team member
const createTeamMember = async (req, res) => {
    try {
      const { name, role,  category, socialLinks, published } = req.body;
      const image = req.file ? `/uploads/${req.file.filename}` : null;
  
      const missingFields = [];
      if (!name) missingFields.push({ name: "name", message: "Name is required" });
      if (!role) missingFields.push({ name: "role", message: "Role is required" });
      if (!category) missingFields.push({ name: "category", message: "Category is required" });
      if (!image) missingFields.push({ name: "image", message: "Image is required" });
      if (missingFields.length > 0) {
        return res.status(400).json({
          status: 400,
          message: "Some fields are missing!",
          missingFields,
        });
      }
  
      // Fetch category by ID
      const categoryExists = await TeamCategory.findById(category);
      if (!categoryExists) {
        return res.status(400).json({ message: "Invalid category ID" });
      }
      const roleExists = await Role.findById(role);
      if (!roleExists) {
        return res.status(400).json({ message: "Invalid role ID" });
      }
      // Parse social links (handle JSON parsing safely)
      let parsedSocialLinks = {};
      try {
        parsedSocialLinks = socialLinks ? JSON.parse(socialLinks) : {};
      } catch (error) {
        return res.status(400).json({ message: "Invalid socialLinks format" });
      }
  
      // Create new team member
      const newMember = await Team.create({
        name,
        role: { _id: roleExists._id, name: roleExists.name },
       
        category: { _id: categoryExists._id, name: categoryExists.name }, // Store full category info
        image,
        socialLinks: parsedSocialLinks,
        published: published === "true" || published === true, // Ensure boolean conversion
      });
  
      res.status(201).json({status:200, message: "Team member created successfully", member: newMember });
    } catch (error) {
      console.error("Error creating team member:", error);
      res.status(500).json({ message: "Internal server error", error: error.message });
    }
  };

// Update a team member
const updateTeamMember = async (req, res) => {
    try {
      const { id } = req.params;
      let { name, role, description, category, socialLinks, published } = req.body;
      const image = req.file ? `/uploads/${req.file.filename}` : null;
  
      const existingMember = await Team.findById(id);
      if (!existingMember) {
        return res.status(404).json({ message: "Team member not found" });
      }
  
      // Fetch category details using only the category ID
      if (category) {
        const categoryExists = await TeamCategory.findById(category);
        if (!categoryExists) {
          return res.status(400).json({ message: "Invalid category ID" });
        }
        category = { _id: categoryExists._id, name: categoryExists.name }; // Store full category object
      }
      if (role) {
        const roleExists = await Role.findById(role);
        if (!roleExists) {
          return res.status(400).json({ message: "Invalid role ID" });
        }
        category = { _id: roleExists._id, name: roleExists.name }; // Store full category object
      }
  
      // Ensure socialLinks is a valid object
      if (typeof socialLinks === "string") {
        try {
          socialLinks = JSON.parse(socialLinks);
        } catch (error) {
          return res.status(400).json({ message: "Invalid socialLinks format" });
        }
      }
  
      // Update fields only if provided
      existingMember.name = name || existingMember.name;
      existingMember.role = role || existingMember.role;
      existingMember.description = description || existingMember.description;
      existingMember.category = category || existingMember.category;
      existingMember.socialLinks = socialLinks || existingMember.socialLinks;
      existingMember.published = published !== undefined ? published === "true" || published === true : existingMember.published;
  
      // Handle image update
      if (image) {
        // Remove old image if it exists
        if (existingMember.image) {
          const oldImagePath = path.join(__dirname, "..", "public", existingMember.image);
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        }
        existingMember.image = image;
      }
  
      await existingMember.save();
  
      res.status(200).json({ status: 200, message: "Team member updated successfully", member: existingMember });
    } catch (error) {
      console.error("Error updating team member:", error);
      res.status(500).json({ message: "Internal server error", error: error.message });
    }
  };
  
// Delete a team member
const deleteTeamMember = async (req, res) => {
  try {
    const { id } = req.params;

    const member = await Team.findById(id);
    if (!member) {
      return res.status(404).json({ message: "Team member not found" });
    }

    if (member.image) {
      const filePath = path.join(__dirname, "..", member.image);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await Team.findByIdAndDelete(id);

    res.status(200).json({ message: "Team member deleted successfully" });
  } catch (error) {
    console.error("Error deleting team member:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};
const deleteAllTeamMembers = async (req, res) => {
    try {
        const { ids } = req.body; // Expecting { ids: ["id1", "id2", ...] }
    
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
          return res.status(400).json({ message: "Invalid request. Provide Team IDs." });
        }
    
        await Team.deleteMany({ _id: { $in: ids } });
    
        res.status(200).json({
          status: 200,
          message: "Team deleted successfully.",
          deletedCategories: ids
        });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
  };

// Fetch all team members (No Pagination)
const getAllTeamMembers = async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;
  
      const totalMembers = await Team.countDocuments();
      const members = await Team.find()
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip);
  
      res.status(200).json({
        totalMembers,
        totalPages: Math.ceil(totalMembers / limit),
        currentPage: page,
        limit,
        members,
      });
    } catch (error) {
      console.error("Error fetching team members:", error);
      res.status(500).json({ message: "Internal server error", error: error.message });
    }
  };
  
  const getTeamLiveMember = async (req, res) => {
    try {
        // Fetch only published categories
        const categories = await TeamCategory.find({ published: true });

        // Fetch only active team members who are also published
        const teams = await Promise.all(categories.map(async (category) => {
            const members = await Team.find({ category: category._id, published: true }).sort({ createdAt: -1 });

            return {
                categoryName: category.name,
                members: members
            };
        }));

        res.status(200).json({ teams });
    } catch (error) {
        console.error("Error fetching team members:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// Fetch a single team member by ID
const getTeamMemberById = async (req, res) => {
  try {
    const { id } = req.params;
    const member = await Team.findById(id);
    if (!member) {
      return res.status(404).json({ message: "Team member not found" });
    }
    res.status(200).json({ member });
  } catch (error) {
    console.error("Error fetching team member:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

module.exports = {
  createTeamMember: [upload.single("image"), createTeamMember],
  updateTeamMember: [upload.single("image"), updateTeamMember],
  deleteTeamMember,
  getAllTeamMembers,
  deleteAllTeamMembers,
  getTeamMemberById,
  getTeamLiveMember
};
