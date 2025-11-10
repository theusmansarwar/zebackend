
const Applications = require("../Models/jobApplicationModel");
const Jobs = require("../Models/jobsModel");


// ✅ Add Application
const addApplication = async (req, res) => {
  try {
    let {
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

    console.log("Incoming data from request :::::", req.body);

    const missingFields = [];

    // ✅ Convert string booleans only if not empty
    const rawBasedInLahore = basedInLahore;
    const rawWillingToRelocate = willingToRelocate;

    // If string is not empty, then convert
    basedInLahore =
      basedInLahore === "true" || basedInLahore === true
        ? true
        : basedInLahore === "false" || basedInLahore === false
        ? false
        : null;

    willingToRelocate =
      willingToRelocate === "true" || willingToRelocate === true
        ? true
        : willingToRelocate === "false" || willingToRelocate === false
        ? false
        : null;

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
    if (!currentCompany)
      missingFields.push({
        name: "currentCompany",
        message: "Current Company is required",
      });
    if (!university)
      missingFields.push({
        name: "university",
        message: "University is required",
      });
    if (!cgpa)
      missingFields.push({ name: "cgpa", message: "CGPA is required" });
    if (!graduationYear)
      missingFields.push({
        name: "graduationYear",
        message: "Graduation Year is required",
      });
    if (!linkedinProfile)
      missingFields.push({
        name: "linkedinProfile",
        message: "LinkedIn Profile is required",
      });
    if (!currentSalary)
      missingFields.push({
        name: "currentSalary",
        message: "Current Salary is required",
      });
    if (!expectedSalary)
      missingFields.push({
        name: "expectedSalary",
        message: "Expected Salary is required",
      });
    if (!resume)
      missingFields.push({ name: "resume", message: "Resume is required" });
    if (!whyDoYouWantToSwitch)
      missingFields.push({
        name: "whyDoYouWantToSwitch",
        message: "Reason is required",
      });

    // ✅ Explicit check for basedInLahore missing
    if (rawBasedInLahore === "" || basedInLahore === null)
      missingFields.push({
        name: "basedInLahore",
        message: "Please specify if applicant is based in Lahore",
      });

    if (experience === undefined || experience === "")
      missingFields.push({
        name: "experience",
        message: "Experience field is required",
      });

    // ✅ Conditional relocation check
    if (basedInLahore === false) {
      if (rawWillingToRelocate === "" || willingToRelocate === null) {
        missingFields.push({
          name: "willingToRelocate",
          message: "Please specify if applicant is willing to relocate",
        });
      }
    }

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
      return res.status(404).json({
        status: false,
        message: "Job not found for this application",
      });
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
