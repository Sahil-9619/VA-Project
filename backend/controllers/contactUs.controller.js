const Contact = require("../models/contactUs.model");

/* ===============================
   1️⃣ Create Contact (Public)
=================================*/
exports.createContact = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be filled",
      });
    }

    const newContact = await Contact.create({
      name,
      email,
      phone,
      subject,
      message,
    });

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: newContact,
    });
  } catch (error) {
    console.error("Create Contact Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/* ===============================
   2️⃣ Get All Contacts (Admin)
=================================*/
exports.getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.find()
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: contacts.length,
      data: contacts,
    });
  } catch (error) {
    console.error("Get Contacts Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/* ===============================
   3️⃣ Get Single Contact Details
=================================*/
exports.getContactById = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found",
      });
    }

    res.status(200).json({
      success: true,
      data: contact,
    });
  } catch (error) {
    console.error("Get Contact Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/* ===============================
   4️⃣ Update Contact Status (Admin)
=================================*/
exports.updateContactStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["pending", "resolved"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }

    const updatedContact = await Contact.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updatedContact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Status updated successfully",
      data: updatedContact,
    });
  } catch (error) {
    console.error("Update Contact Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/* ===============================
   5️⃣ Delete Contact (Admin)
=================================*/
exports.deleteContact = async (req, res) => {
  try {
    const deletedContact = await Contact.findByIdAndDelete(req.params.id);

    if (!deletedContact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Contact deleted successfully",
    });
  } catch (error) {
    console.error("Delete Contact Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
