// models/permission.model.js
const mongoose = require("mongoose");

const permissionSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // e.g., "create_course", "delete_user"
  description: String,
});

module.exports = mongoose.model("Permission", permissionSchema);
