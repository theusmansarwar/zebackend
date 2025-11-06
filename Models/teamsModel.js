const mongoose = require("mongoose");

const TeamSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    role: { type: mongoose.Schema.Types.ObjectId, ref: "Role" },

    description: { type: String, required: true },

    category: { type: mongoose.Schema.Types.ObjectId, ref: "TeamCategory" },

    image: { type: String, required: true },
    socialLinks: {
      linkedin: { type: String, default: null },
      github: { type: String, default: null },
      instagram: { type: String, default: null },
      facebook: { type: String, default: null },
      portfolio:{ type: String, default: null },
    },
    published: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    showonteamsection: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Team = mongoose.model("TeamMember", TeamSchema);
module.exports = Team;
