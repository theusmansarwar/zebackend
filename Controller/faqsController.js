
const Faqs = require("../Models/faqsModel");
const Service = require("../Models/serviceModel");

// ✅ Create FAQ and link to a Service
const addFAQ = async (req, res) => {
  try {
    let { question, answer, serviceid } = req.body;
    
    if (!question ) {
      return res.status(400).json({ message: "FAQ question are required" });
    }
     if (!answer) {
      return res.status(400).json({ message: "FAQ answer are required" });
    }
    if (!serviceid) {
      return res.status(400).json({ message: "Service ID is required" });
    }

    question = question.trim();
    answer = answer.trim();

    const newFAQ = new Faqs({
      question,
      answer,
      
    });

    const faqSaved = await newFAQ.save();

    // Link to service
    const updatedService = await Service.findByIdAndUpdate(
      serviceid,
      { $push: { "faqs.items": faqSaved._id } },
      { new: true }
    );

    if (!updatedService) {
      return res.status(404).json({ message: "Service not found to link FAQ" });
    }

    res.status(201).json({
      status: 201,
      message: "FAQ added and linked to service successfully",
      faq: faqSaved,
      linkedService: updatedService._id,
    });
  } catch (error) {
    console.error("Error adding FAQ:", error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ Update FAQ
const updateFAQ = async (req, res) => {
  try {
    const { id } = req.params;
    let { question, answer } = req.body;

    if (!question || !answer) {
      return res.status(400).json({ message: "FAQ question and answer are required" });
    }

    question = question.trim();
    answer = answer.trim();

    const updatedFAQ = await Faqs.findByIdAndUpdate(
      id,
      { question, answer},
      { new: true, runValidators: true }
    );

    if (!updatedFAQ) {
      return res.status(404).json({ message: "FAQ not found" });
    }

    res.status(200).json({
      status: 200,
      message: "FAQ updated successfully",
      faq: updatedFAQ,
    });
  } catch (error) {
    console.error("Error updating FAQ:", error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ Delete single FAQ
const deleteFAQ = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedFAQ = await FAQ.findByIdAndDelete(id);
    if (!deletedFAQ) {
      return res.status(404).json({ message: "FAQ not found" });
    }

    res.status(200).json({
      status: 200,
      message: "FAQ deleted successfully",
      deletedId: id,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Delete multiple FAQs
const deleteAllFAQs = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "Invalid request. Provide FAQ IDs." });
    }

    const result = await Faqs.deleteMany({ _id: { $in: ids } });
    res.status(200).json({
      status: 200,
      message: "FAQs deleted successfully",
      deletedCount: result.deletedCount,
      deletedIds: ids,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



module.exports = { addFAQ, updateFAQ, deleteFAQ, deleteAllFAQs };
