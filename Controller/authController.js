const User = require("../Models/adminModel");
const bcrypt = require("bcryptjs");
const Service = require("../Models/serviceModel");
const Comment = require("../Models/commentModel");
const Blogs = require("../Models/blogModel");
const Leads = require("../Models/leadsModel");
const UserType = require("../Models/typeModel");

const { View, TotalImpression } = require("../Models/viewModel");
const { default: mongoose } = require("mongoose");

const register = async (req, res) => {
  const { name, email, password,published,typeId } = req.body;
  const missingFields = [];

  if (!email) {
    missingFields.push({ name: "email", message: "Email is required" });
  } else if (!email.includes("@")) {
    missingFields.push({ name: "email", message: "Email must contain @" });
  }

  if (!name) {
    missingFields.push({ name: "name", message: "Name is required" });
  }
  if (!typeId) {
    missingFields.push({ name: "typeId", message: "typeId is required" });
  }

  if (!password) {
    missingFields.push({ name: "password", message: "Password is required" });
  }

  if (missingFields.length > 0) {
    return res.status(400).json({
      status: 400,
      message: "Some fields are missing or invalid!",
      missingFields,
    });
  }

  try {
    const userType = await UserType.findById(typeId);
    if (!userType) {
      return res.status(400).json({
        status: 400,
        message: "Invalid user type",
        missingFields: [{ name: "typeId", message: "Invalid user type ID" }],
      });
    }
    const emailAvailable = await User.findOne({ email });
    if (emailAvailable) {
      return res.status(400).json({
        status: 400,
        message: "Email already exists",
        missingFields: [{ name: "email", message: "Email already exists" }],
      });
    }

    const hashedPassword = await bcrypt.hash(password, 4);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
       type: userType._id
    });

     const populatedUser = await User.findById(user._id).populate("type");

    res.status(201).json({
      status: 201,
      message: "User registered successfully",
      data: populatedUser,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
    });
  }
};


const login = async (req, res) => {
  const { email, password } = req.body;
  const missingFields = [];

  if (!email) {
    missingFields.push({ name: "email", message: "Email is required" });
  } else if (!email.includes("@")) {
    missingFields.push({ name: "email", message: "Email must contain @" });
  }
  if (!password) {
    missingFields.push({ name: "password", message: "Password is required" });
  }

  if (missingFields.length > 0) {
    return res.status(400).json({
      status: 400,
      message: "Some fields are missing or invalid!",
      missingFields,
    });
  }

  const user = await User.findOne({ email }).populate("type");
  if (!user) {
    return res.status(404).json({
      status: 404,
      message: "Email not found",
      missingFields: [{ name: "email", message: "Email not found" }],
    });
  }

  const matchPassword = await bcrypt.compare(password, user.password);
  if (!matchPassword) {
    return res.status(400).json({
      status: 400,
      message: "Invalid credentials",
      missingFields: [{ name: "password", message: "Password does not match" }],
    });
  }

  res.status(200).json({
    status: 200,
    message: "Logged in successfully",
    data: user,
    token: await user.generateToken(),
  });
};



const stats = async (req, res) => {
  try {
    // ✅ TODAY
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // ✅ YESTERDAY
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);

    const yesterdayEnd = new Date(yesterdayStart);
    yesterdayEnd.setHours(23, 59, 59, 999);

    // ✅ Counts
    const totalBlogs = await Blogs.countDocuments();
    const totalLeads = await Leads.countDocuments();

    // ✅ Leads
    const todayLeads = await Leads.countDocuments({
      createdAt: { $gte: todayStart, $lte: todayEnd }
    });

    const yesterdayLeads = await Leads.countDocuments({
      createdAt: { $gte: yesterdayStart, $lte: yesterdayEnd }
    });

    // ✅ Views/Impressions (Use `$gte` and `$lt` for date range)
    const todayImpressionData = await View.findOne({
      date: { $gte: todayStart, $lte: todayEnd }
    });

    const yesterdayImpressionData = await View.findOne({
      date: { $gte: yesterdayStart, $lte: yesterdayEnd }
    });

    // ✅ Set default values
    const todayImpression = todayImpressionData ? todayImpressionData.views : 0;
    const yesterdayImpression = yesterdayImpressionData ? yesterdayImpressionData.views : 0;

    // ✅ Fetch total impressions count
    const totalImpressionRecord = await TotalImpression.findOne().select("totalImpression -_id");
    const totalImpressions = totalImpressionRecord ? totalImpressionRecord.totalImpression : 0;

    const totalComments = await Comment.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalServices = await Service.countDocuments();

    return res.status(200).json({
      message: "Data fetched successfully",
      totalBlogs,
      totalLeads,
      todayLeads,
      yesterdayLeads, // ✅ Fixed yesterday's leads
      todayImpression,
      yesterdayImpression, // ✅ Fixed yesterday's impressions
      totalImpressions, // ✅ All-time impressions count
      totalComments,
      totalUsers,
      totalServices,
    });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching data", error });
  }
};



const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; 
    const limit = parseInt(req.query.limit) || 10;

    const totalUsers = await User.countDocuments(); // ✅ count all users

    const users = await User.find()
      .select("-password")
      .populate("type")
      .sort({ createdAt: -1 }) // ✅ latest first
      .limit(limit)
      .skip((page - 1) * limit);

    res.status(200).json({
      status: 200,
      data: users,
      totalUsers,
      totalPages: Math.ceil(totalUsers / limit),
      currentPage: page,
      limit: limit,
    });
  } catch (error) {
    res.status(500).json({ status: 500, message: "Failed to fetch users", error });
  }
};


// ✅ Get user by ID
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password").populate("type");
    if (!user) {
      return res.status(404).json({ status: 404, message: "User not found" });
    }
    res.status(200).json({ status: 200, data: user });
  } catch (error) {
    res.status(500).json({ status: 500, message: "Failed to fetch user", error });
  }
};

// ✅ Update user by ID
const updateUser = async (req, res) => {
  try {
    const { name, email, typeId } = req.body;

    const updateData = { name, email };
    if (typeId) {
      const userType = await UserType.findById(typeId);
      if (!userType) {
        return res.status(400).json({ status: 400, message: "Invalid user type" });
      }
      updateData.type = {
        _id: userType._id,
        name: userType.name,
      };
    }

    const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true }).select("-password");
    if (!user) {
      return res.status(404).json({ status: 404, message: "User not found" });
    }
    res.status(200).json({ status: 200, message: "User updated", data: user });
  } catch (error) {
    res.status(500).json({ status: 500, message: "Failed to update user", error });
  }
};

// ✅ Delete user by ID
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ status: 404, message: "User not found" });
    }
    res.status(200).json({ status: 200, message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ status: 500, message: "Failed to delete user", error });
  }
};



const deleteMultipleUsers = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "Invalid or empty list of user IDs" });
    }

    // ✅ Filter only valid MongoDB ObjectIds
    const validIds = ids.filter(id => mongoose.Types.ObjectId.isValid(id));

    if (validIds.length === 0) {
      return res.status(400).json({ message: "No valid user IDs provided" });
    }

    // ✅ Check if users exist
    const users = await User.find({ _id: { $in: validIds } });

    if (users.length === 0) {
      return res.status(404).json({ message: "No users found with the given IDs" });
    }

    // ✅ Delete users
    await User.deleteMany({ _id: { $in: validIds } });

    res.status(200).json({
      status: 200,
      message: `${users.length} user(s) deleted successfully`,
    });
  } catch (error) {
    console.error("Error deleting users:", error);
    res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
};


module.exports = {
  register,
  stats,
  login,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  deleteMultipleUsers

};

