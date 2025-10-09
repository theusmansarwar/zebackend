const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema(
  {
    blogId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Blogs",
      required: true,
    },
    name: { type: String, required: true },
    email: { type: String, required: true },
    comment: { type: String, required: true },
    published: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Comment = mongoose.model("Comment", CommentSchema);
module.exports = Comment;
