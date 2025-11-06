const Jobs  = require("../Models/jobsModel");

// 🟢 Add Job
const addJob = async (req, res) => {
  try {
    const {
      jobtitle,
      jobCategory,
      description,
      noofyearsexperience,
      jobtype,
      location,
      WorkingDaysSchema,
      noofvacancies,
      officetiming,
      lastdatetoapply,
      isPublished,
    } = req.body;

    const missingFields = [];

    if (!jobtitle) missingFields.push({ name: "jobtitle", message: "Job title is required" });
    if (!description) missingFields.push({ name: "description", message: "Description is required" });
    if (!noofyearsexperience) missingFields.push({ name: "noofyearsexperience", message: "Years of experience is required" });
    if (!jobtype) missingFields.push({ name: "jobtype", message: "Job type is required" });
    if (!location) missingFields.push({ name: "location", message: "Location is required" });
    if (!noofvacancies) missingFields.push({ name: "noofvacancies", message: "Number of vacancies is required" });
    if (!officetiming) missingFields.push({ name: "officetiming", message: "Office timing is required" });
    if (!lastdatetoapply) missingFields.push({ name: "lastdatetoapply", message: "Last date to apply is required" });
    
    if (!jobCategory) missingFields.push({ name: "jobCategory", message: "jobCategory is required" });

    if (missingFields.length > 0) {
      return res.status(400).json({ status: false, missingFields });
    }

    // 🔍 Duplicate check (case-insensitive)
    const existingJob = await Jobs.findOne({ jobtitle: new RegExp("^" + jobtitle + "$", "i") });
    if (existingJob) {
      return res.status(400).json({ status: false, message: "Job with this title already exists" });
    }

    const newJob = await Jobs.create({
      jobtitle,
      description,
      noofyearsexperience,
      jobtype,
      location,
      jobCategory,
      WorkingDaysSchema,
      noofvacancies,
      officetiming,
      lastdatetoapply,
      isPublished,
    });

    res.status(201).json({
      status: 201,
      message: "Job added successfully",
      job: newJob,
    });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};

// 🟡 Update Job
const updateJob = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      jobtitle,
      description,
      noofyearsexperience,
      jobtype,
      location,
      WorkingDaysSchema,
      noofvacancies,
      officetiming,
      lastdatetoapply,
      isPublished,
      jobCategory
    } = req.body;

    const missingFields = [];

    if (!jobtitle) missingFields.push({ name: "jobtitle", message: "Job title is required" });
    if (!description) missingFields.push({ name: "description", message: "Description is required" });
    if (!noofyearsexperience) missingFields.push({ name: "noofyearsexperience", message: "Years of experience is required" });
    if (!jobtype) missingFields.push({ name: "jobtype", message: "Job type is required" });
    if (!location) missingFields.push({ name: "location", message: "Location is required" });
    if (!noofvacancies) missingFields.push({ name: "noofvacancies", message: "Number of vacancies is required" });
    if (!officetiming) missingFields.push({ name: "officetiming", message: "Office timing is required" });
    if (!lastdatetoapply) missingFields.push({ name: "lastdatetoapply", message: "Last date to apply is required" });
 if (!jobCategory) missingFields.push({ name: "jobCategory", message: "jobCategory is required" });
    if (missingFields.length > 0) {
      return res.status(400).json({ status: false, missingFields });
    }

    // 🔍 Duplicate check
    const duplicateJob = await Jobs.findOne({
      _id: { $ne: id },
      jobtitle: new RegExp("^" + jobtitle + "$", "i"),
    });
    if (duplicateJob) {
      return res.status(400).json({ status: false, message: "Another job with this title already exists" });
    }

    const updatedJob = await Jobs.findByIdAndUpdate(
      id,
      {
        jobtitle,
        description,
        noofyearsexperience,
        jobtype,
        location,
        WorkingDaysSchema,
        noofvacancies,
        officetiming,
        lastdatetoapply,
        isPublished,
        jobCategory
      },
      { new: true }
    );

    if (!updatedJob) {
      return res.status(404).json({ status: false, message: "Job not found" });
    }

    res.status(200).json({
      status: 200,
      message: "Job updated successfully",
      job: updatedJob,
    });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};

// 🔍 Get Job by ID
const getJobById = async (req, res) => {
  try {
    const { id } = req.params;
    const job = await Jobs.findById(id).populate("applications");

    if (!job || job.isDeleted) {
      return res.status(404).json({ status: false, message: "Job not found" });
    }

    res.status(200).json({ status: 200, job });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};

// 📋 View Jobs (search + pagination)
const viewJobs = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;

    const query = {
      isDeleted: false,
      $or: [{ jobtitle: { $regex: search, $options: "i" } }],
    };

    const totalCount = await Jobs.countDocuments(query);

    const jobs = await Jobs.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate("applications");

    res.status(200).json({
      status: 200,
       jobs,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: parseInt(page),
      totalCount,
    });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};

// 🌍 Live Jobs (Published only)
const liveJobs = async (req, res) => {
  try {
    const jobs = await Jobs.find({
      isPublished: true,
      isDeleted: false,
    })
      .sort({ createdAt: -1 })
      .populate("applications");

    res.status(200).json({ status: 200, data: jobs });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};

// 🗑️ Delete Multiple Jobs
const deleteAllJobs = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({ status: false, message: "IDs array is required" });
    }

    const validIds = ids.filter((id) => id);

    await Jobs.deleteMany({ _id: { $in: validIds } });

    res.status(200).json({
      status: 200,
      message: "Jobs deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};
module.exports = {
 addJob,
  deleteAllJobs,
  getJobById,
  liveJobs,
  updateJob,
  viewJobs,
};