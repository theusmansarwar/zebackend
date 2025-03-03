const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// ✅ Method to Generate JWT Token
userSchema.methods.generateToken = function () {
  try {
    return jwt.sign(
      { userId: this._id, email: this.email },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1d" }
    );
  } catch (error) {
    console.error("Token generation error:", error);
  }
};

const User = mongoose.model("User", userSchema);

module.exports = User;
