const mongoose = require("mongoose");

const TeamSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    role: { type: mongoose.Schema.Types.ObjectId, ref: "Role" },

    description: { type: String, required: true },

    category: { type: mongoose.Schema.Types.ObjectId, ref: "TeamCategory" },

    image: { type: String, required: true },
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
