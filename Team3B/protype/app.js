import express from "express";
import mongoose from "mongoose";

const app = express();
const PORT = 3000;

// Middleware to parse JSON
app.use(express.json());

// MongoDB Connection String
const connectionString =
  "mongodb+srv://productdlp3:Product%40123@product3-dlp.ctbtp.mongodb.net/?retryWrites=true&w=majority&appName=Product3-DLP";

// Connect to MongoDB
mongoose
  .connect(connectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("MongoDB connection error:", error));

// Define the Document Schema
const documentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
});

// Create the Document Model
const Document = mongoose.model("Document", documentSchema);

// Routes
app.get("/", (req, res) => {
  res.send("Welcome to the Document Management API!");
});

// Create a new document
app.post("/api/documents", async (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: "Title and content are required." });
  }
  try {
    const newDocument = new Document({ title, content });
    await newDocument.save();
    res
      .status(201)
      .json({ message: "Document created.", document: newDocument });
  } catch (error) {
    res.status(500).json({ error: "Failed to create document." });
  }
});

// Get all documents
app.get("/api/documents", async (req, res) => {
  try {
    const documents = await Document.find();
    res.json({ documents });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch documents." });
  }
});

// Get a specific document by ID
app.get("/api/documents/:docId", async (req, res) => {
  try {
    const document = await Document.findById(req.params.docId);
    if (!document) {
      return res.status(404).json({ error: "Document not found." });
    }
    res.json({ document });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch document." });
  }
});

// Update a document by ID
app.put("/api/documents/:docId", async (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: "Title and content are required." });
  }
  try {
    const updatedDocument = await Document.findByIdAndUpdate(
      req.params.docId,
      { title, content, updatedAt: new Date() },
      { new: true }
    );
    if (!updatedDocument) {
      return res.status(404).json({ error: "Document not found." });
    }
    res.json({ message: "Document updated.", document: updatedDocument });
  } catch (error) {
    res.status(500).json({ error: "Failed to update document." });
  }
});

// Delete a document by ID
app.delete("/api/documents/:docId", async (req, res) => {
  try {
    const deletedDocument = await Document.findByIdAndDelete(req.params.docId);
    if (!deletedDocument) {
      return res.status(404).json({ error: "Document not found." });
    }
    res.json({ message: "Document deleted.", document: deletedDocument });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete document." });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log("Server running on http://localhost:${PORT}");
});
