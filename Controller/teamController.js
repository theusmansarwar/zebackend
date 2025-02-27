const Team = require("../Models/teamModel");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

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
    const { name, role, description, category, socialLinks, published } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    if (!name || !role || !description || !category) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newMember = await Team.create({
      name,
      role,
      description,
      category: JSON.parse(category),
      image,
      socialLinks: socialLinks ? JSON.parse(socialLinks) : {},
      published: published === "true" || published === true,
    });

    res.status(201).json({ message: "Team member created successfully", member: newMember });
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

    if (category) category = JSON.parse(category);
    if (socialLinks) socialLinks = JSON.parse(socialLinks);

    existingMember.name = name || existingMember.name;
    existingMember.role = role || existingMember.role;
    existingMember.description = description || existingMember.description;
    existingMember.category = category || existingMember.category;
    existingMember.socialLinks = socialLinks || existingMember.socialLinks;
    existingMember.published = published !== undefined ? published === "true" || published === true : existingMember.published;

    if (image) {
      // Remove old image if it exists
      if (existingMember.image) {
        const oldImagePath = path.join(__dirname, "..", existingMember.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      existingMember.image = image;
    }

    await existingMember.save();

    res.status(200).json({ message: "Team member updated successfully", member: existingMember });
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

// Fetch all team members (No Pagination)
const getAllTeamMembers = async (req, res) => {
  try {
    const members = await Team.find().sort({ createdAt: -1 });
    res.status(200).json({ members });
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
  getTeamMemberById,
};
