const SecondSection = require("../Models/secondSectionModal");
const Service = require("../Models/serviceModel");

// ✅ Create Item and link to a Service
const addSecond = async (req, res) => {
  try {
    let { title, description, image, serviceid } = req.body;
    const missingFields = [];
    if (!title) {
      missingFields.push({ name: "title", message: "Title is required" });
    }
    if (!description) {
      missingFields.push({
        name: "description",
        message: "Description is required",
      });
    }
    if (!image)
      missingFields.push({ name: "image", message: "Image is required" });
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
    title = title.trim();
    description = description.trim();

    const newSecond = new SecondSection({
      title,
      description,
      image,
    });

    const secondSaved = await newSecond.save();

    // Link to service
    const updatedService = await Service.findByIdAndUpdate(
      serviceid,
      { $push: { "secondSection.items": secondSaved._id } },
      { new: true }
    );

    if (!updatedService) {
      return res
        .status(404)
        .json({ message: "Service not found to link Item" });
    }

    res.status(201).json({
      status: 201,
      message: "Item added and linked to service successfully",
      second: secondSaved,
      linkedService: updatedService._id,
    });
  } catch (error) {
    console.error("Error adding Item:", error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ Update Item
const updateSecond = async (req, res) => {
  try {
    const { id } = req.params;
    let { title, description, image } = req.body;

    const missingFields = [];
    if (!title) {
      missingFields.push({ name: "title", message: "Title is required" });
    }
    if (!description) {
      missingFields.push({
        name: "description",
        message: "Description is required",
      });
    }
    if (!image)
      missingFields.push({ name: "image", message: "Image is required" });

    if (missingFields.length > 0) {
      return res.status(400).json({
        status: 400,
        message: "Some fields are missing!",
        missingFields,
      });
    }

    title = title.trim();
    description = description.trim();

    const updatedSecond = await SecondSection.findByIdAndUpdate(
      id,
      { title, description, image },
      { new: true, runValidators: true }
    );

    if (!updatedSecond) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.status(200).json({
      status: 200,
      message: "Item updated successfully",
      second: updatedSecond,
    });
  } catch (error) {
    console.error("Error updating Item:", error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ Delete single Item
const deleteSecond = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedSecond = await SecondSection.findByIdAndDelete(id);
    if (!deletedSecond) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.status(200).json({
      status: 200,
      message: "Item deleted successfully",
      deletedId: id,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Delete multiple Items
const deleteAllSeconds = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res
        .status(400)
        .json({ message: "Invalid request. Provide Second IDs." });
    }

    const result = await SecondSection.deleteMany({ _id: { $in: ids } });
    res.status(200).json({
      status: 200,
      message: "Items deleted successfully",
      deletedCount: result.deletedCount,
      deletedIds: ids,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { addSecond, updateSecond, deleteSecond, deleteAllSeconds };
