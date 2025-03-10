const User = require("../Models/adminModel");
const bcrypt = require("bcryptjs");
const Service = require("../Models/serviceModel");
const Comment = require("../Models/commentModel");
const Blogs = require("../Models/blogModel");
const Leads = require("../Models/leadsModel");
const { View, TotalImpression } = require("../Models/viewModel");

const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!email || !email.includes("@gmail.com")) {
    return res.status(400).json({
      status: 400,
      message: "Email field must contain @gmail.com",
    });
  }
  if (!name) {
    return res.status(400).json({
      status: 400,
      message: "Name field is required",
    });
  }

  if (!password) {
    return res.status(400).json({
      status: 400,
      message: "Password field is required",
    });
  }

  try {
    const emailAvailable = await User.findOne({ email });

    if (emailAvailable) {
      return res.status(400).json({
        status: 400,
        message: "Email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 4);

    const user = await User.create({
      name,
      email,

      password: hashedPassword,
    });
    const type = "Registion process";

    res.status(201).json({
      status: 201,
      message: "User registered successfully",
      data: {
        name: user.name,
        email: user.email,
      },
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
  if (!email || !email.includes("@gmail.com")) {
    return res.status(400).json({
      status: 400,
      message: "Email field must contain @gmail.com",
    });
  }
  if (!password) {
    return res.status(400).json({
      status: 400,
      message: "Password field is required",
    });
  }
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({
      message: "Email not found",
    });
  } else {
    const matchPassword = await bcrypt.compare(password, user.password);
    if (matchPassword) {
      res.status(200).json({
        status: 200,
        message: "LoggedIn Successfully",
        data: user,
        token: await user.generateToken(),
      });
    } else {
      res.status(400).json({
        message: "Invalid credientials",
      });
    }
  }
};

const stats = async (req, res) => {
  try {
    // ✅ TODAY
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59);

    // ✅ YESTERDAY
    const yesterdayStart = new Date();
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    yesterdayStart.setHours(0, 0, 0, 0);

    const yesterdayEnd = new Date();
    yesterdayEnd.setDate(yesterdayEnd.getDate() - 1);
    yesterdayEnd.setHours(23, 59, 59);

    // ✅ Counts
    const totalBlogs = await Blogs.countDocuments();
    const totalLeads = await Leads.countDocuments();

    // ✅ Leads
    const todayLeads = await Leads.countDocuments({ createdAt: { $gte: todayStart, $lt: todayEnd } });
    const yesterdayLeads = await Leads.countDocuments({ createdAt: { $gte: yesterdayStart, $lt: yesterdayEnd } });

    // ✅ Views/Impressions
    const todayImpressionData = await View.findOne({ date: todayStart.toISOString().split("T")[0] });
    const todayImpression = todayImpressionData ? todayImpressionData.views : 0;
   

    
    // ✅ Fetch total impressions count
    const totalImpressionRecord = await TotalImpression.findOne().select("totalImpression -_id");
    const totalImpressions = totalImpressionRecord ? totalImpressionRecord.totalImpression : 0;
    const yesterdayImpressionData = await View.findOne({ date: yesterdayStart.toISOString().split("T")[0] });
    const yesterdayImpression = yesterdayImpressionData ? yesterdayImpressionData.views : 0;

    const totalComments = await Comment.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalServices = await Service.countDocuments();

    return res.status(200).json({
      message: "Data fetched successfully",
      totalBlogs,
      totalLeads,
      todayLeads,
      yesterdayLeads, // ✅ Added yesterday's leads
      todayImpression,
      yesterdayImpression,
      totalImpressions, // ✅ Added yesterday's impressions
      totalComments,
      totalUsers,
      totalServices,
    });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching data", error });
  }
};


module.exports = {
  register,
  stats,
  login,
};
