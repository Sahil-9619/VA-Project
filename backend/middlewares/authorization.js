// middlewares/authorizePermission.js
const User = require("../models/user.model");

const authorizePermission = (permissionName) => {
  return async (req, res, next) => {
    const user = await User.findById(req.user._id).populate({
      path: "role",
      populate: {
        path: "permissions",
        model: "Permission",
      },
    });

    if (!user || !user.role) {
      return res.status(403).json({ message: "Role not assigned" });
    }

    const hasPermission = user.role.permissions.some(
      (perm) => perm.name === permissionName
    );

    if (!hasPermission) {
      return res.status(403).json({ message: "Permission denied" });
    }

    next();
  };
};

module.exports = authorizePermission;
