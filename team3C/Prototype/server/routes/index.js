const express = require('express');
const router = express.Router();
const patternController = require('../controllers/patternController');
const documentController = require('../controllers/documentController');
const multer = require('multer');
const fs = require('fs');

// Multer configuration
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = 'uploads/';
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir);
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueName = Date.now() + '-' + file.originalname;
      cb(null, uniqueName);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
});

router.get('/patterns', patternController.getPatterns);
router.post('/patterns', patternController.addPattern);
router.delete('/patterns/:index', patternController.deletePattern);
router.post('/check-text', documentController.checkText);
router.post('/upload-file', upload.single('file'), documentController.processFile);
router.get('/view/:filename', documentController.viewFile);
router.get('/download/:filename', documentController.downloadFile);

module.exports = router;