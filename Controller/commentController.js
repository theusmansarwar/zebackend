const Blogs = require("../Models/blogModel");
const Comment = require("../Models/commentModel");

const addComment = async (req, res) => {
try {
    const { blogId, name, email, comment} = req.body;
    const missingFields = [];
    if (!blogId) missingFields.push({ name: "blogId", message: "Blog Id is required" });
    if (!name) missingFields.push({ name: "name", message: "Name is required" });
    if (!email) missingFields.push({ name: "email", message: "Email is required" });
    if (!comment) missingFields.push({ name: "comment", message: "Comment is required" });
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
    const newComment = await Comment.create({ blogId, name, email, comment, published: false });

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
        error: error.message
    });
}
};
const approveComment = async (req, res) => {
    const {status,commentId } = req.body;
    try{
    const comment = await Comment.findById(commentId);
  
    if (!comment) {
        return res.status(404).json({ message: "Comment not found" });
    }
    if(!status){
        return res.status(400).json({ message: "status is required" });
    }
    comment.published = true; 
    await comment.save();

    res.status(200).json({ message: "Comment approved successfully", comment });
} catch (error) {
    console.error("Error while approving comment:", error);
    res.status(500).json({
        status: 500,
        message: "Internal server error",
        error: error.message
    });
}
}
const viewComments = async (req, res) => {
    
    try{
    const comment = await Comment.find().populate("blogId", "title");
  
    if (!comment) {
        return res.status(404).json({ message: "Comment not found" });
    }
 

    res.status(200).json({ message: "Comment fetched successfully", comment });
} catch (error) {
    console.error("Error while approving comment:", error);
    res.status(500).json({
        status: 500,
        message: "Internal server error",
        error: error.message
    });
}
}
const deleteComment = async (req, res) => {
    try {
        const { id } = req.params;

        
        const comment = await Comment.findById(id);
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        // ✅ Remove comment from the Blog's comments array
        await Blogs.findByIdAndUpdate(comment.blogId, { 
            $pull: { comments: id } 
        });

        // ✅ Delete the comment
        await Comment.findByIdAndDelete(id);

        res.status(200).json({ message: "Comment deleted successfully" });
    } catch (error) {
        console.error("Error deleting comment:", error);
        res.status(500).json({ 
            status: 500, 
            message: "Internal server error", 
            error: error.message 
        });
    }
};



module.exports = {
    viewComments,
    addComment,
    approveComment,
    deleteComment
};
