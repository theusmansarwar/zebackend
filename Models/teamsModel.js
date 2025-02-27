const mongoose = require("mongoose");

const TeamSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    role: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true }, // Store image URL
    socialLinks: {
      linkedin: { type: String, default: "" },
      instagram: { type: String, default: "" },
      facebook: { type: String, default: "" },
    },
    published: { type: Boolean, default: false }, // Optional publish status
  },
  { timestamps: true }
);

const Team = mongoose.model("TeamMember", TeamSchema);
module.exports = Team;
