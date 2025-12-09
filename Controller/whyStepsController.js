
const Service = require("../Models/serviceModel");
const WhySteps = require("../Models/whyStepsModel");

// ✅ Create Item and link to a Service
const addWhyStep = async (req, res) => {
  try {
    let { stepTitle, stepDescription, serviceid } = req.body;
    const missingFields = [];
    if (!stepTitle) {
      missingFields.push({ name: "stepTitle", message: "Step Title is required" });
    }
    if (!stepDescription) {
      missingFields.push({
        name: "stepDescription",
        message: "Step Description is required",
      });
    }
   
    if (!serviceid) {
      missingFields.push({
        name: "serviceid",
        message: "serviceid is required",
      });
    }

    if (missingFields.length > 0) {
      return res.status(400).json({
        status: 400,
        message: "Some fields are missing!",
        missingFields,
      });
    }
    stepTitle = stepTitle.trim();
    stepDescription = stepDescription.trim();

    const newWhyStep = new WhySteps({
      stepTitle,
      stepDescription,
    });

    const whyStepSaved = await newWhyStep.save();

    // Link to service
    const updatedService = await Service.findByIdAndUpdate(
      serviceid,
      { $push: { "whySteps.items": whyStepSaved._id } },
      { new: true }
    );

    if (!updatedService) {
      return res
        .status(404)
        .json({ message: "Service not found to link Item" });
    }

    res.status(201).json({
      status: 201,
      message: "Step added and linked to service successfully",
      whyStep: whyStepSaved,
      linkedService: updatedService._id,
    });
  } catch (error) {
    console.error("Error adding Item:", error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ Update Item
const updateWhyStep = async (req, res) => {
  try {
    const { id } = req.params;
    let { stepTitle, stepDescription } = req.body;

    const missingFields = [];
    if (!stepTitle) {
      missingFields.push({ name: "stepTitle", message: "Step Title is required" });
    }
    if (!stepDescription) {
      missingFields.push({
        name: "stepDescription",
        message: "Step Description is required",
      });
    }

    if (missingFields.length > 0) {
      return res.status(400).json({
        status: 400,
        message: "Some fields are missing!",
        missingFields,
      });
    }

    stepTitle = stepTitle.trim();
    stepDescription = stepDescription.trim();

    const updatedWhyStep = await WhySteps.findByIdAndUpdate(
      id,
      { stepTitle, stepDescription },
      { new: true, runValidators: true }
    );

    if (!updatedWhyStep) {
      return res.status(404).json({ message: "Step not found" });
    }

    res.status(200).json({
      status: 200,
      message: "Step updated successfully",
      whyStep: updatedWhyStep,
    });
  } catch (error) {
    console.error("Error updating Step:", error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ Delete single Item
const deleteWhyStep = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedWhyStep = await WhySteps.findByIdAndDelete(id);
    if (!deletedWhyStep) {
      return res.status(404).json({ message: "Step not found" });
    }

    res.status(200).json({
      status: 200,
      message: "Step deleted successfully",
      deletedId: id,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Delete multiple Items
const deleteAllWhySteps = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res
        .status(400)
        .json({ message: "Invalid request. Provide Steps IDs." });
    }

    const result = await WhySteps.deleteMany({ _id: { $in: ids } });
    res.status(200).json({
      status: 200,
      message: "Steps deleted successfully",
      deletedCount: result.deletedCount,
      deletedIds: ids,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  addWhyStep,
  updateWhyStep,
  deleteWhyStep,
  deleteAllWhySteps,
};
