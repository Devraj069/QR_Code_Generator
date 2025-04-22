
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Html5QrcodeScanner } = require("html5-qrcode");
const app = express();
const port = process.env.PORT || 3000;

// Set view engine to EJS
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Set up multer to use temporary storage in Vercel's /tmp folder
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Use Vercel's temporary folder for storing files
    cb(null, '/tmp');
  },
  filename: (req, file, cb) => {
    // Generate a unique filename based on the current timestamp
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// Routes

// Home Route
app.get('/', (req, res) => {
  res.render('index', {
    success: null,
    error: null,
    result: null,
    qrImage: null,
  });
});

// Generate QR Code Route
app.post('/generate', (req, res) => {
  const { qrtext } = req.body;

  // Generate QR Code using a QR Code library (for simplicity, we're using the qrcode library)
  const QRCode = require('qrcode');
  QRCode.toDataURL(qrtext, (err, qrImage) => {
    if (err) {
      return res.render('index', { success: null, error: 'Error generating QR code', result: null, qrImage: null });
    }
    res.render('index', {
      success: 'QR Code generated successfully!',
      error: null,
      result: null,
      qrImage: qrImage,
    });
  });
});

// Upload and Scan Image Route
app.post('/scan-image', upload.single('qrimage'), (req, res) => {
  if (!req.file) {
    return res.render('index', { success: null, error: 'No file uploaded', result: null, qrImage: null });
  }

  const filePath = `/tmp/${req.file.filename}`;
  
  // Add code here to scan the QR code from the uploaded image using the appropriate library (e.g. `qrcode-reader` or `jsqr`)
  const QRCodeReader = require('qrcode-reader');
  const Jimp = require('jimp');

  Jimp.read(filePath, (err, image) => {
    if (err) {
      return res.render('index', { success: null, error: 'Error reading image file', result: null, qrImage: null });
    }

    const qr = new QRCodeReader();
    qr.callback = (err, value) => {
      if (err) {
        return res.render('index', { success: null, error: 'Error scanning QR code', result: null, qrImage: null });
      }
      res.render('index', {
        success: 'QR Code scanned successfully!',
        error: null,
        result: value.result,
        qrImage: null,
      });
    };

    qr.decode(image.bitmap);
  });
});

// Serve Static Files from /tmp
app.use('/tmp', express.static('/tmp')); // This allows serving files directly from the /tmp folder

// Start Server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
