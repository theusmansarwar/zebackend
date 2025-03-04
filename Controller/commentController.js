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
    const comment = await Comment.find()
      .populate("blogId", "title")
      .sort({ createdAt: -1 });

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    res.status(200).json({ message: "Comment fetched successfully", comment });
  } catch (error) {
    console.error("Error while approving comment:", error);
    res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
};
const approvedComments = async (req, res) => {
  try {
    const comment = await Comment.find({ published: true }).sort({
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
const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;

    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // ✅ Remove comment from the Blog's comments array
    await Blogs.findByIdAndUpdate(comment.blogId, {
      $pull: { comments: id },
    });

    // ✅ Delete the comment
    await Comment.findByIdAndDelete(id);

    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Error deleting comment:", error);
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

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res
        .status(400)
        .json({ message: "Invalid request. Provide comment IDs." });
    }

    // ✅ Find all comments that need to be deleted
    const comments = await Comment.find({ _id: { $in: ids } });

    if (comments.length === 0) {
      return res
        .status(404)
        .json({ message: "No comments found with the given IDs." });
    }

    // ✅ Extract the blog IDs related to these comments
    const blogIds = [
      ...new Set(comments.map((comment) => comment.blogId.toString())),
    ];

    await Blogs.updateMany(
      { _id: { $in: blogIds } },
      { $pull: { comments: { $in: ids } } }
    );

    // ✅ Delete comments from the database
    await Comment.deleteMany({ _id: { $in: ids } });

    res.status(200).json({
      status: 200,
      message: "Comments deleted successfully.",
      deletedComments: ids,
    });
  } catch (error) {
    console.error("Error deleting comments:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = {
  viewComments,
  addComment,
  approveComment,
  deleteComment,
  deleteAllComment,
  approvedComments,
};
