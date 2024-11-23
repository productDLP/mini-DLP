const express = require('express');
const multer = require('multer');
const app = express();
const cors = require("cors");
const corsOptions = {
    origin :["http://localhost:3000"]
}

const upload = multer({ dest: 'uploads/' }); // Files will be stored in the 'uploads' folder

app.use(cors(corsOptions))
app.use(express.json());

// File upload route
app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
  
    // You can process the file here (e.g., move it to a permanent location or parse it)
    res.status(200).json({ message: 'File uploaded successfully!', fileName: req.file.originalname });
  });



const PORT = 8888;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
