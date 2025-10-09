const mongoose = require("mongoose");

const RoleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    published: { type: Boolean, default: false }, 
 isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Role = mongoose.model("Role", RoleSchema);
module.exports = Role;
