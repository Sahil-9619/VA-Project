require("dotenv").config();
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const fs = require("fs");


const routes = require("./routes/route");
const seedSettings = require("./config/seedSettings");

const express = require("express");
const cors = require("cors");
const seedRoles = require("./config/seedRole");
const seedCourseCategory = require("./config/seedCategory");
const app = express();
const path = require("path");
app.use(
  cors({
    origin: process.env.CLIENT_URL, // or your frontend URL
    credentials: true, // allow sending cookies/headers
  })
);
app.use(express.json());
app.use(cookieParser());
const mongoURI = process.env.MONGO_URI;

mongoose
  .connect(mongoURI)
  .then(() => {
    // for adding roles in db liek user instructor admin
    // seedRoles();
    seedCourseCategory();
    seedSettings();

    console.log("✅ MongoDB connected to local instance.");
  })
  .catch((error) => {
    console.error("❌ Connection error:", error.message);
  });

//run this for the first time to seed roles and permissions
app.use(morgan("dev")); // Shows :method :url :status :response-time ms
app.use(express.urlencoded({ extended: true }));


// all routs in route folder
app.use("/api", routes); // All routes prefixed with /api
app.use("/api/uploads", express.static(path.join(__dirname, "uploads")));

// 👇 add custom streaming route for videos
app.get("/api/uploads/:filename", (req, res) => {
  const filePath = path.join(__dirname, "uploads", req.params.filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).send("File not found");
  }

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  // CORS headers (important for Flutter)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Range");
  res.setHeader(
    "Access-Control-Expose-Headers",
    "Content-Range, Accept-Ranges"
  );
  res.setHeader("Accept-Ranges", "bytes");

  if (range) {
    // Handle partial request
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

    if (start >= fileSize || end >= fileSize) {
      res.status(416).send("Requested range not satisfiable");
      return;
    }

    const chunkSize = end - start + 1;
    const file = fs.createReadStream(filePath, { start, end });

    res.writeHead(206, {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunkSize,
      "Content-Type": "video/mp4",
    });

    file.pipe(res);
  } else {
    // Normal full download
    res.writeHead(200, {
      "Content-Length": fileSize,
      "Content-Type": "video/mp4",
      "Accept-Ranges": "bytes",
    });
    fs.createReadStream(filePath).pipe(res);
  }
});
app.get("/", (req, res) => {
  res.json("hii from lms backend");
});

let port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`Server is running on ${port}`);
});

module.exports = app;
