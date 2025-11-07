
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

    const missingFields = [];

    // ✅ Basic required field checks
    if (!jobId)
      missingFields.push({ name: "jobId", message: "Job ID is required" });
    if (!name)
      missingFields.push({ name: "name", message: "Applicant name is required" });
    if (!email)
      missingFields.push({ name: "email", message: "Email is required" });
    if (!phone)
      missingFields.push({ name: "phone", message: "Phone number is required" });
    if (!education)
      missingFields.push({ name: "education", message: "Education is required" });
    if (basedInLahore === undefined)
      missingFields.push({
        name: "basedInLahore",
        message: "Please specify if applicant is based in Lahore",
      });
    if (experience === undefined || experience === "")
      missingFields.push({
        name: "experience",
        message: "Experience field is required",
      });

    // ✅ Conditional check
    if (basedInLahore === true && willingToRelocate === undefined) {
      missingFields.push({
        name: "willingToRelocate",
        message:
          "Please specify if applicant is willing to relocate (required when based in Lahore)",
      });
    } else if (basedInLahore === false && willingToRelocate === undefined) {
      // Optional: you can still keep a message for clarity if needed
      missingFields.push({
        name: "willingToRelocate",
        message: "Please specify if applicant is willing to relocate",
      });
    }

    // ✅ Stop here if any fields are missing
    if (missingFields.length > 0) {
      return res.status(400).json({
        status: 400,
        message: "Some required fields are missing!",
        missingFields,
      });
    }

    // ✅ Check job exists
    const jobExists = await Jobs.findById(jobId);
    if (!jobExists) {
      return res
        .status(404)
        .json({ status: false, message: "Job not found for this application" });
    }

    // ✅ Create new application
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

    // ✅ Push to job’s application list
    await Jobs.findByIdAndUpdate(jobId, {
      $push: { applications: newApplication._id },
    });

    res.status(200).json({
      status: true,
      message: "Application submitted successfully",
      data: newApplication,
    });
  } catch (error) {
    console.error("Error adding application:", error);
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
