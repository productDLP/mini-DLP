const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const pdfParse = require("pdf-parse");
const path = require("path");

const app = express();

// CORS setup
const corsOptions = {
  origin: ["http://localhost:3000"], // Allow requests from frontend
};
app.use(cors(corsOptions));

// JSON parser middleware
app.use(express.json());

// Load sensitive words
const sensitiveWords = JSON.parse(
  fs.readFileSync("sensitive-words.json", "utf8")
).sensitiveWords;

// Log sensitive words
console.log("Sensitive Words Loaded:", sensitiveWords);

// Multer configuration for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = "uploads/";
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir); 
        console.log("Uploads directory created:", uploadDir);
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueName = Date.now() + "-" + file.originalname;
      console.log("Generated unique file name:", uniqueName);
      cb(null, uniqueName);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, 
});

// File upload endpoint
app.post("/upload", upload.single("file"), async (req, res) => {
  console.log("Request received at /upload endpoint");

  try {
    // Check if file is provided
    if (!req.file) {
      console.error("No file uploaded");
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Log file details
    console.log("Uploaded File Details:", req.file);

    // Resolve file path
    const filePath = path.resolve(req.file.path);
    console.log("File Path:", filePath);

    // Read and parse the PDF content
    const pdfBuffer = fs.readFileSync(filePath);
    console.log("Reading PDF buffer...");
    const pdfData = await pdfParse(pdfBuffer);
    const documentContent = pdfData.text;
    console.log("Extracted Document Content:", documentContent);

    // Match sensitive words
    console.log("Matching sensitive words...");
    const matchedWords = sensitiveWords.filter((word) =>
      documentContent.toLowerCase().includes(word.toLowerCase())
    );

    console.log("Matched Words:", matchedWords);

    // Delete the file after processing
    fs.unlinkSync(filePath);
    console.log("File deleted after processing:", filePath);

    // Send response
    res.json({ matchedWords });
  } catch (error) {
    console.error("Error processing file:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Start the server
const PORT = 8888;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
