
const ProvenSteps = require("../Models/provenstepsModel");
const SubServices = require("../Models/subServiceModel");

// ✅ Create ProvenSteps and link to a SubServices
const addProvenSteps = async (req, res) => {
  try {
    let { question, answer, SubServicesid } = req.body;
    
    const missingFields = [];
    if (!question ) {
       missingFields.push({ name: "question", message: "Question is required" });
    }
     if (!answer) {
       missingFields.push({ name: "answer", message: "Answer is required" });
    }
    if (!serviceid) {
     missingFields.push({ name: "serviceid", message: "serviceid is required" });
    }

     if (missingFields.length > 0) {
      return res.status(400).json({
        status: 400,
        message: "Some fields are missing!",
        missingFields,
      });
    }

    question = question.trim();
    answer = answer.trim();

    const newProvenSteps = new ProvenSteps({
      question,
      answer,
      
    });

    const ProvenStepsaved = await newProvenSteps.save();

    // Link to SubServices
    const updatedSubServices = await SubServices.findByIdAndUpdate(
      SubServicesid,
      { $push: { "provenSteps.items": ProvenStepsaved._id } },
      { new: true }
    );

    if (!updatedSubServices) {
      return res.status(404).json({ message: "SubServices not found to link ProvenSteps" });
    }

    res.status(201).json({
      status: 201,
      message: "ProvenSteps added and linked to SubServices successfully",
      ProvenSteps: ProvenStepsaved,
      linkedSubServices: updatedSubServices._id,
    });
  } catch (error) {
    console.error("Error adding ProvenSteps:", error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ Update ProvenSteps
const updateProvenSteps = async (req, res) => {
  try {
    const { id } = req.params;
    let { question, answer } = req.body;

    const missingFields = [];
    if (!question ) {
       missingFields.push({ name: "question", message: "Question is required" });
    }
     if (!answer) {
       missingFields.push({ name: "answer", message: "Answer is required" });
    }
    if (!serviceid) {
     missingFields.push({ name: "serviceid", message: "serviceid is required" });
    }

     if (missingFields.length > 0) {
      return res.status(400).json({
        status: 400,
        message: "Some fields are missing!",
        missingFields,
      });
    }
    question = question.trim();
    answer = answer.trim();

    const updatedProvenSteps = await ProvenSteps.findByIdAndUpdate(
      id,
      { question, answer},
      { new: true, runValidators: true }
    );

    if (!updatedProvenSteps) {
      return res.status(404).json({ message: "ProvenSteps not found" });
    }

    res.status(200).json({
      status: 200,
      message: "ProvenSteps updated successfully",
      ProvenSteps: updatedProvenSteps,
    });
  } catch (error) {
    console.error("Error updating ProvenSteps:", error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ Delete single ProvenSteps
const deleteProvenSteps = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedProvenSteps = await ProvenSteps.findByIdAndDelete(id);
    if (!deletedProvenSteps) {
      return res.status(404).json({ message: "ProvenSteps not found" });
    }

    res.status(200).json({
      status: 200,
      message: "ProvenSteps deleted successfully",
      deletedId: id,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Delete multiple ProvenSteps
const deleteAllProvenSteps = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "Invalid request. Provide ProvenSteps IDs." });
    }

    const result = await ProvenSteps.deleteMany({ _id: { $in: ids } });
    res.status(200).json({
      status: 200,
      message: "ProvenSteps deleted successfully",
      deletedCount: result.deletedCount,
      deletedIds: ids,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};




module.exports = { addProvenSteps, updateProvenSteps, deleteProvenSteps, deleteAllProvenSteps };
