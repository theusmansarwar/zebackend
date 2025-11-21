
const WhyChoose = require("../Models/WhyChooseModel");
const SubServices = require("../Models/subServiceModel");

// ✅ Create WhyChoose and link to a SubServices
const addWhyChoose = async (req, res) => {
  try {
    let { question, answer, SubServicesid } = req.body;
    
    const missingFields = [];
    if (!question ) {
       missingFields.push({ name: "question", message: "Heading is required" });
    }
     if (!answer) {
       missingFields.push({ name: "answer", message: "Description is required" });
    }
    if (!SubServicesid) {
     missingFields.push({ name: "SubServicesid", message: "Sub Services id is required" });
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

    const newWhyChoose = new WhyChoose({
      question,
      answer,
      
    });

    const WhyChooseSaved = await newWhyChoose.save();

    // Link to SubServices
    const updatedSubServices = await SubServices.findByIdAndUpdate(
      SubServicesid,
      { $push: { "WhyChoose.items": WhyChooseSaved._id } },
      { new: true }
    );

    if (!updatedSubServices) {
      return res.status(404).json({ message: "SubServices not found to link WhyChoose" });
    }

    res.status(201).json({
      status: 201,
      message: "WhyChoose added and linked to SubServices successfully",
      WhyChoose: WhyChooseSaved,
      linkedSubServices: updatedSubServices._id,
    });
  } catch (error) {
    console.error("Error adding WhyChoose:", error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ Update WhyChoose
const updateWhyChoose = async (req, res) => {
  try {
    const { id } = req.params;
    let { question, answer } = req.body;

    const missingFields = [];
    if (!question ) {
       missingFields.push({ name: "question", message: "Heading is required" });
    }
     if (!answer) {
       missingFields.push({ name: "answer", message: "Description is required" });
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

    const updatedWhyChoose = await WhyChoose.findByIdAndUpdate(
      id,
      { question, answer},
      { new: true, runValidators: true }
    );

    if (!updatedWhyChoose) {
      return res.status(404).json({ message: "WhyChoose not found" });
    }

    res.status(200).json({
      status: 200,
      message: "WhyChoose updated successfully",
      WhyChoose: updatedWhyChoose,
    });
  } catch (error) {
    console.error("Error updating WhyChoose:", error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ Delete single WhyChoose
const deleteWhyChoose = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedWhyChoose = await WhyChoose.findByIdAndDelete(id);
    if (!deletedWhyChoose) {
      return res.status(404).json({ message: "WhyChoose not found" });
    }

    res.status(200).json({
      status: 200,
      message: "WhyChoose deleted successfully",
      deletedId: id,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Delete multiple WhyChoose
const deleteAllWhyChoose = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "Invalid request. Provide WhyChoose IDs." });
    }

    const result = await WhyChoose.deleteMany({ _id: { $in: ids } });
    res.status(200).json({
      status: 200,
      message: "WhyChoose deleted successfully",
      deletedCount: result.deletedCount,
      deletedIds: ids,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};




module.exports = { addWhyChoose, updateWhyChoose, deleteWhyChoose, deleteAllWhyChoose };
