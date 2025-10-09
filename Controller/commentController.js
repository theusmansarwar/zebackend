const Blogs = require("../Models/blogModel");
const Comment = require("../Models/commentModel");

const addComment = async (req, res) => {
  try {
    const { blogId, name, email, comment } = req.body;
    const missingFields = [];
    if (!blogId)
      missingFields.push({ name: "blogId", message: "Blog Id is required" });
    if (!name)
      missingFields.push({ name: "name", message: "Name is required" });
    if (!email)
      missingFields.push({ name: "email", message: "Email is required" });
    if (!comment)
      missingFields.push({ name: "comment", message: "Comment is required" });
    if (missingFields.length > 0) {
      return res.status(400).json({
        status: 400,
        message: "Some fields are missing!",
        missingFields,
      });
    }
    const blog = await Blogs.findById(blogId);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }
    const newComment = await Comment.create({
      blogId,
      name,
      email,
      comment,
      published: false,
    });

    // Push comment ID into blog's comments array
    blog.comments.push(newComment._id);
    await blog.save();

    return res.status(201).json({
      status: 201,
      message: "Comment Submit Successfully.",
    });
  } catch (error) {
    console.error("Error while comment:", error);
    res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
};
const approveComment = async (req, res) => {
  const { status, commentId, comment } = req.body;

  try {
    const commentavailable = await Comment.findById(commentId);

    if (!commentavailable) {
      return res
        .status(404)
        .json({ status: 400, message: "Comment not found" });
    }

    // Ensure status is explicitly true or false
    if (typeof status !== "boolean") {
      return res
        .status(400)
        .json({
          status: 400,
          message: "Status is required and must be true or false",
        });
    }
    commentavailable.comment = comment;
    commentavailable.published = status;
    await commentavailable.save();

    return res
      .status(200)
      .json({
        status: 200,
        message: "Comment status updated successfully",
        comment,
      });
  } catch (error) {
    console.error("Error while approving comment:", error);
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const viewComments = async (req, res) => {
    try {
      // Get page and limit from query parameters, with default values
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;
  
      // Fetch total count for pagination
      const totalComments = await Comment.countDocuments({ isDeleted: false });
  
      const comments = await Comment.find({ isDeleted: false })
        .populate("blogId", "title")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
  
      if (!comments.length) {
        return res.status(404).json({ message: "No comments found" });
      }
  
      res.status(200).json({
        message: "Comments fetched successfully",
        comments,

          totalComments,
          totalPages: Math.ceil(totalComments / limit),
          currentPage: page,
      
      });
    } catch (error) {
      console.error("Error while fetching comments:", error);
      res.status(500).json({
        status: 500,
        message: "Internal server error",
        error: error.message,
      });
    }
  };
  
const approvedComments = async (req, res) => {
  try {
    const comment = await Comment.find({ published: true, deleted: false }).sort({
      createdAt: -1,
    });

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    res
      .status(200)
      .json({ status: 200, message: "Comment fetched successfully", comment });
  } catch (error) {
    console.error("Error while approving comment:", error);
    res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
};


const deleteAllComment = async (req, res) => {
  try {
    const { ids } = req.body; // Expecting { ids: ["id1", "id2", ...] }

    // ✅ Validate request body
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        status: 400,
        message: "Invalid request. Provide a non-empty array of comment IDs.",
      });
    }

    // ✅ Filter valid MongoDB ObjectIds
    const validIds = ids.filter(id => mongoose.Types.ObjectId.isValid(id));
    if (validIds.length === 0) {
      return res.status(400).json({
        status: 400,
        message: "No valid comment IDs provided.",
      });
    }

    // ✅ Find comments that exist
    const comments = await Comment.find({ _id: { $in: validIds }, isDeleted: false });

    if (comments.length === 0) {
      return res.status(404).json({
        status: 404,
        message: "No active comments found with the given IDs.",
      });
    }

    // ✅ Extract related blog IDs
    const blogIds = [...new Set(comments.map(comment => comment.blogId?.toString()))];

    // ✅ Optionally remove these comment references from Blog documents
    await Blogs.updateMany(
      { _id: { $in: blogIds } },
      { $pull: { comments: { $in: validIds } } }
    );

    // ✅ Perform soft delete by updating `isDeleted`
    await Comment.updateMany(
      { _id: { $in: validIds } },
      { $set: { isDeleted: true } }
    );

    res.status(200).json({
      status: 200,
      message: `${comments.length} comment(s) soft-deleted successfully.`,
      deletedComments: validIds,
    });
  } catch (error) {
    console.error("Error soft-deleting comments:", error);
    res.status(500).json({
      status: 500,
      message: "Internal server error.",
      error: error.message,
    });
  }
};

module.exports = {
  viewComments,
  addComment,
  approveComment,
  deleteAllComment,
  approvedComments,
};
