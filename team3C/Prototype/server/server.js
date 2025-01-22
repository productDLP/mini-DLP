const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const xlsx = require("xlsx");
const path = require("path");

const app = express();

// CORS setup
const corsOptions = {
  origin: ["http://localhost:3000"], // Allow requests from frontend
};
app.use(cors(corsOptions));

// JSON parser middleware
app.use(express.json());

// Load sensitive patterns
const sensitivePatterns = JSON.parse(
  fs.readFileSync("sensitive-words.json", "utf8")
).sensitivePatterns;

console.log("Sensitive Patterns Loaded:", sensitivePatterns);

// Multer configuration for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = "uploads/";
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir); // Ensure the uploads directory exists
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
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
});

// Helper to extract text from XLSX files
const extractTextFromXlsx = (filePath) => {
  const workbook = xlsx.readFile(filePath);
  let extractedText = "";

  workbook.SheetNames.forEach((sheetName) => {
    const sheet = workbook.Sheets[sheetName];
    const sheetData = xlsx.utils.sheet_to_csv(sheet);
    extractedText += sheetData + "\n";
  });

  return extractedText;
};

// File upload endpoint
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const filePath = path.resolve(req.file.path);
    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    let documentContent = "";

    // Process file based on type
    if (fileExtension === ".pdf") {
      const pdfBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(pdfBuffer);
      documentContent = pdfData.text;
    } else if (fileExtension === ".docx") {
      const mammothResult = await mammoth.extractRawText({ path: filePath });
      documentContent = mammothResult.value;
    } else if (fileExtension === ".xlsx") {
      documentContent = extractTextFromXlsx(filePath);
    } else {
      fs.unlinkSync(filePath);
      return res.status(400).json({ error: "Unsupported file type" });
    }

    const matchedPatterns = sensitivePatterns
      .map((pattern) => {
        const regex = new RegExp(pattern.pattern, "g");
        const matches = documentContent.match(regex);
        return matches ? { name: pattern.name, matches } : null;
      })
      .filter(Boolean);

    fs.unlinkSync(filePath);

    res.json({
      message: "File processed successfully",
      matchedPatterns,
    });
  } catch (error) {
    console.error("Error processing file:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const PORT = 8888;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
