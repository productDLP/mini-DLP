const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pdfParse = require('pdf-parse');

// Initialize app
const app = express();
app.use(bodyParser.json());

// Serve static files (if frontend is included)
app.use(express.static(path.join(__dirname, '../frontend/build')));

// MongoDB connection
mongoose
  .connect('mongodb://localhost:27017/dlp', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Document schema
const DocumentSchema = new mongoose.Schema(
  {
    name: String,
    content: String,
    classification: String,
  },
  { collection: 'docs' } // Explicitly set the collection name
);

const Document = mongoose.model('Document', DocumentSchema);

// Classification rules
const classificationRules = {
  Aadhar: /\d{4}\s\d{4}\s\d{4}/, // Regex for Aadhar
  PAN: /[A-Z]{5}[0-9]{4}[A-Z]{1}/, // Regex for PAN
};

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Upload and parse document
app.post('/upload', upload.single('file'), async (req, res) => {
  const { file } = req;
  if (!file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    // Read and parse the uploaded file
    const fileData = fs.readFileSync(file.path);
    const parsedData = await pdfParse(fileData);
    const content = parsedData.text;

    // Save document to database
    const document = new Document({
      name: file.originalname,
      content,
      classification: 'Unknown',
    });
    await document.save();

    // Clean up uploaded file
    fs.unlinkSync(file.path);

    res.status(201).json({ message: 'Document uploaded and saved', document });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Classify documents
app.post('/classify', async (req, res) => {
  try {
    const documents = await Document.find();
    for (const doc of documents) {
      if (classificationRules.Aadhar.test(doc.content)) {
        doc.classification = 'Aadhar';
      } else if (classificationRules.PAN.test(doc.content)) {
        doc.classification = 'PAN';
      } else {
        doc.classification = 'Unknown';
      }
      await doc.save();
    }
    res.json({ message: 'Documents classified', documents });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Rule engine
app.get('/rules', async (req, res) => {
  try {
    const documents = await Document.find();
    let rulesMet = 0;
    let rulesViolated = 0;

    for (const doc of documents) {
      const expectedClassification =
        classificationRules.Aadhar.test(doc.content)
          ? 'Aadhar'
          : classificationRules.PAN.test(doc.content)
          ? 'PAN'
          : 'Unknown';

      if (doc.classification === expectedClassification) {
        rulesMet++;
      } else {
        rulesViolated++;
      }
    }

    res.json({ rulesMet, rulesViolated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start server
app.listen(5000, () => {
  console.log('Server running on http://localhost:5000');
});
