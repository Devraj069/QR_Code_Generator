const express = require('express');
const multer = require('multer');
const path = require('path');
const axios = require('axios');
const imageKit = require('imagekit');
const QRCode = require('qrcode');
const Jimp = require('jimp');
const app = express();
const port = process.env.PORT || 3000;

// Set view engine to EJS
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Set up multer to handle file uploads (in-memory storage)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// ImageKit API Configuration (Replace with your credentials)
const imageKitInstance = new imageKit({
  publicKey: 'public_96Pj+aP4l4DR+7wFS15XsoT6J4A=',
  privateKey: 'private_l6kKWodED4JJ56Tj4xhYlJJ13CQ=',
  urlEndpoint: 'https://ik.imagekit.io/a6wgpzjy2', // Example: https://ik.imagekit.io/your_imagekit_id
});

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

  // Generate QR Code using a QR Code library
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
app.post('/scan-image', upload.single('qrimage'), async (req, res) => {
  if (!req.file) {
    return res.render('index', { success: null, error: 'No file uploaded', result: null, qrImage: null });
  }

  // Prepare file data for ImageKit.io
  const fileBuffer = req.file.buffer;
  const fileName = Date.now() + path.extname(req.file.originalname);

  try {
    // Upload image to ImageKit.io
    const uploadResponse = await imageKitInstance.upload({
      file: fileBuffer, // File buffer
      fileName: fileName, // Name of the file
      folder: '/uploads', // Optional folder path
    });

    const imageUrl = uploadResponse.url;

    // Now, scan the uploaded QR code using Jimp and QRCodeReader
    Jimp.read(uploadResponse.url, (err, image) => {
      if (err) {
        return res.render('index', { success: null, error: 'Error reading image file', result: null, qrImage: null });
      }

      const QRCodeReader = require('qrcode-reader');
      const qr = new QRCodeReader();
      qr.callback = (err, value) => {
        if (err) {
          return res.render('index', { success: null, error: 'Error scanning QR code', result: null, qrImage: null });
        }
        res.render('index', {
          success: 'QR Code scanned successfully!',
          error: null,
          result: value.result, // QR code data
          qrImage: imageUrl, // Image URL from ImageKit
        });
      };
      qr.decode(image.bitmap);
    });

  } catch (err) {
    console.error('Error uploading image:', err);
    res.render('index', { success: null, error: 'Error uploading image', result: null, qrImage: null });
  }
});

// Start Server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
