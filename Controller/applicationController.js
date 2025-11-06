
const Applications = require("../Models/jobApplicationModel");
const Jobs = require("../Models/jobsModel");


// ✅ Add Application
const addApplication = async (req, res) => {
  try {
    const {
      jobId,
      name,
      email,
      phone,
      education,
      basedInLahore,
      willingToRelocate,
      experience,
      currentCompany,
      university,
      cgpa,
      graduationYear,
      linkedinProfile,
      currentSalary,
      expectedSalary,
      resume,
      whyDoYouWantToSwitch,
    } = req.body;

    // Missing field validation
    const requiredFields = {
      jobId,
      name,
      email,
      phone,
      education,
      basedInLahore,
      willingToRelocate,
      experience,
    };

    const missingFields = Object.keys(requiredFields).filter(
      (key) => requiredFields[key] === undefined || requiredFields[key] === ""
    );

    if (missingFields.length > 0) {
      return res.status(400).json({
        status: false,
        message: `Missing required fields`,
        missingFields,
      });
    }

    // Check job exists
    const jobExists = await Jobs.findById(jobId);
    if (!jobExists) {
      return res
        .status(404)
        .json({ status: false, message: "Job not found for this application" });
    }

    const newApplication = await Applications.create({
      jobId,
      name,
      email,
      phone,
      education,
      basedInLahore,
      willingToRelocate,
      experience,
      currentCompany,
      university,
      cgpa,
      graduationYear,
      linkedinProfile,
      currentSalary,
      expectedSalary,
      resume,
      whyDoYouWantToSwitch,
    });

    // push to job applications array
    await Jobs.findByIdAndUpdate(jobId, {
      $push: { applications: newApplication._id },
    });

    res.status(200).json({
      status: true,
      message: "Application submitted successfully",
      data: newApplication,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, message: error.message });
  }
};

// ✅ View Applications (with pagination + search)
const viewApplications = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;

    const query = {
      isDeleted: false,
      $or: [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { education: { $regex: search, $options: "i" } },
      ],
    };

    const applications = await Applications.find(query)
      .populate("jobId", "jobtitle location")
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Applications.countDocuments(query);

    res.status(200).json({
      status: true,
      message: "Applications fetched successfully",
      data: applications,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};

// ✅ Get Application by ID
const getApplicationById = async (req, res) => {
  try {
    const { id } = req.params;
    const application = await Applications.findById(id).populate(
      "jobId",
      "jobtitle location"
    );

    if (!application || application.isDeleted) {
      return res.status(404).json({
        status: false,
        message: "Application not found",
      });
    }

    res.status(200).json({
      status: true,
      data: application,
    });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};

// ✅ Update Application
const updateApplication = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedApplication = await Applications.findByIdAndUpdate(
      id,
      req.body,
      { new: true }
    );

    if (!updatedApplication) {
      return res.status(404).json({
        status: false,
        message: "Application not found",
      });
    }

    res.status(200).json({
      status: true,
      message: "Application updated successfully",
      data: updatedApplication,
    });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};

// ✅ Delete All (soft delete)
const deleteAllApplications = async (req, res) => {
  try {
    await Applications.updateMany({ isDeleted: false }, { isDeleted: true });
    res.status(200).json({
      status: true,
      message: "All applications marked as deleted",
    });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};

module.exports = {
  addApplication,
  viewApplications,
  getApplicationById,
  updateApplication,
  deleteAllApplications,
};
