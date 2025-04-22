const express = require('express');
const router = express.Router();
const qrController = require('../controllers/qrController');
const multer = require('multer');

// File upload config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});

// Filter for PNG and JPG file types
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/png', 'image/jpeg'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true); // Accept file
  } else {
    req.flash('error', 'Only PNG and JPG files are allowed.');
    cb(null, false); // Reject file
  }
};

const upload = multer({ storage, fileFilter });

// Routes
router.get('/', qrController.getHome);
router.post('/generate', qrController.generateQR);
router.post('/scan-image', upload.single('qrimage'), qrController.scanImage);

module.exports = router;
