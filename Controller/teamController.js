const mongoose = require("mongoose");
const Team = require("../Models/teamsModel");
const Role = require("../Models/roleModel");
const TeamCategory = require("../Models/teamCategoryModel");
const fs = require("fs");
const path = require("path");

// ✅ Create Team Member
// ✅ Create Team Member
const createTeamMember = async (req, res) => { 
  try {
    const { name, role, description, category, socialLinks, image, published, showonteamsection } = req.body;

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
      showonteamsection: showonteamsection === "true" || showonteamsection === true
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
    let { name, role, description, category, socialLinks, published, showonteamsection, image } = req.body;

    // 🔍 collect missing fields
    const missingFields = [];
    if (!name) missingFields.push({ name: "name", message: "Name is required" });
    if (!role) missingFields.push({ name: "role", message: "Role is required" });
    if (!description) missingFields.push({ name: "description", message: "Description is required" });
    if (!category) missingFields.push({ name: "category", message: "Category is required" });
    if (!image) missingFields.push({ name: "image", message: "Image is required" });

    if (missingFields.length > 0) {
      return res.status(400).json({
        status: 400,
        message: "Some fields are missing!",
        missingFields,
      });
    }

    const member = await Team.findById(id);
    if (!member) return res.status(404).json({ message: "Team member not found" });

    // ✅ validate and assign role
    const roleExists = await Role.findById(role);
    if (!roleExists) return res.status(400).json({ message: "Invalid role ID" });
    member.role = role;

    // ✅ validate and assign category
    const categoryExists = await TeamCategory.findById(category);
    if (!categoryExists) return res.status(400).json({ message: "Invalid category ID" });
    member.category = category;

    // ✅ assign basic fields
    member.name = name;
    member.description = description;
    member.image = image;

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

    // ✅ handle published
    if (published !== undefined) {
      member.published = published === "true" || published === true || published === 1;
    }

    // ✅ handle showonteamsection
    if (showonteamsection !== undefined) {
      member.showonteamsection = showonteamsection === "true" || showonteamsection === true || showonteamsection === 1;
    }

    await member.save();

    res.status(200).json({ status: 200, message: "Team member updated", member });
  } catch (error) {
    console.error("Error updating team member:", error);
    res.status(500).json({ status: 500, message: "Internal server error" });
  }
};

const deleteAllTeamMembers = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "Invalid request. Provide team member IDs." });
    }

    // ✅ Soft delete: set isDeleted = true
    const result = await Team.updateMany(
      { _id: { $in: ids } },
      { $set: { isDeleted: true } }
    );

    res.status(200).json({
      status: 200,
      message: `${result.modifiedCount} team member(s) soft deleted successfully.`,
      deleted: ids,
    });
  } catch (error) {
    console.error("Error soft deleting multiple team members:", error);
    res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
};


// ✅ Get All Team Members (Paginated + Search)
const getAllTeamMembers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const { search } = req.query;
    const skip = (page - 1) * limit;

    // ✅ Base filter
    let filter = { isDeleted: false };

    // ✅ Safely escape regex
    const escapeRegex = (text) =>
      text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");

    // ✅ Apply search filter if provided
    if (search && search.trim() !== "") {
      const escapedSearch = escapeRegex(search);
      const regex = new RegExp(escapedSearch, "i");

      // Search across multiple relevant fields
      filter.$or = [
        { name: { $regex: regex } },
        { description: { $regex: regex } },
      ];
    }

    // ✅ Count total documents
    const total = await Team.countDocuments(filter);

    // ✅ Fetch paginated + populated members
    const members = await Team.find(filter)
      .populate("role", "name")
      .populate("category", "name")
      .select("-isDeleted -updatedAt -__v")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // ✅ Send response
    res.status(200).json({
      status: 200,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      limit,
      members,
    });
  } catch (error) {
    console.error("Error fetching team members:", error);
    res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
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
    // 1. Fetch all published categories
    const categories = await TeamCategory.find({ published: true }).sort({ createdAt: 1 });

    // 2. For each category, fetch only published members
    const teams = await Promise.all(
      categories.map(async (category) => {
        const members = await Team.find({
          category: category._id,
          published: true, // ✅ only published members
        }).populate("role").sort({ createdAt: 1 });

        return {
          categoryId: category._id,
          categoryName: category.name,
          members, // always an array (empty if none)
        };
      })
    );

    // 3. Send final response
    res.status(200).json({
      status: 200,
      message: "Live team members fetched successfully",
      categories: teams,
    });
  } catch (error) {
    console.error("Error fetching live team members:", error);
    res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
};
const getTeamFeaturedMember = async (req, res) => {
  try {
    // 1. Fetch all published categories
    const teams = await Team.find({ published: true, showonteamsection:true }).populate("role","name -_id").select('name role image -_id').sort({ createdAt: 1 });

    res.status(200).json({
      status: 200,
      message: "Live team members fetched successfully",
      Members: teams,
    });
  } catch (error) {
    console.error("Error fetching live team members:", error);
    res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
};


module.exports = {
  createTeamMember,
  updateTeamMember,
  deleteAllTeamMembers,
  getAllTeamMembers,
  getTeamMemberById,
  getTeamLiveMember,
  getTeamFeaturedMember
};
