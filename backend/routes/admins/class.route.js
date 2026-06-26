const express = require("express");
const router = express.Router();
const classController = require("../../controllers/admins/class.controller");

router.post("/", classController.createClass);

router.get("/", classController.getAllClasses);

router.get("/:id", classController.getClassById);
router.put("/:id", classController.updateClass);

router.delete("/:id", classController.deleteClass);


module.exports = router;