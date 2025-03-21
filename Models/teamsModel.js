const mongoose = require("mongoose");

const TeamSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    role: {
        _id: { type: mongoose.Schema.Types.ObjectId,  ref: "Role" },
        name: { type: String,  }
      },
   
    category: {
         _id: { type: mongoose.Schema.Types.ObjectId,  ref: "TeamCategory" },
         name: { type: String,  }
       },
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
