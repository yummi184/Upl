const express = require('express');
const multer = require('multer');
const path = require('path');
const shortid = require('shortid');
const fs = require('fs');
const os = require('os');
const app = express();
const PORT = process.env.PORT || 4000;
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = './public/uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = shortid.generate() + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});
const fileFilter = (req, file, cb) => {
  cb(null, true);
};
const upload = multer({ storage, fileFilter });
app.use(express.static('public'));
const startTime = Date.now();  
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});
app.get('/uptime', (req, res) => {
  const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);
  const hours = Math.floor(uptimeSeconds / 3600);
  const minutes = Math.floor((uptimeSeconds % 3600) / 60);
  const seconds = uptimeSeconds % 60;
  res.json({
    uptime: `${hours} hours, ${minutes} minutes, ${seconds} seconds`
  });
});
app.get('/media', (req, res) => {
  const uploadDir = './public/uploads';
  fs.readdir(uploadDir, (err, files) => {
    if (err) {
      return res.status(500).json({ message: 'Error reading media files.' });
    }
    const mediaFiles = files.map(file => `/uploads/${file}`);
    res.json({ mediaFiles });
  });
});
app.post('/upload', upload.single('media'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded.' });
  }
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({
    message: 'File uploaded successfully!',
    url: fileUrl
  });
});
app.listen(PORT, () => {
  console.log(`Running On http://localhost:${PORT}`);
});