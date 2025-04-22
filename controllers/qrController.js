const QRCode = require('qrcode');
const Jimp = require('jimp');  // Ensure Jimp is used for image processing
const fs = require('fs');
const QrCodeReader = require('qrcode-reader');

exports.getHome = (req, res) => {
  res.render('index', { qrImage: null, qrText: null, result: null });
};

exports.generateQR = async (req, res) => {
  const input = req.body.qrtext;
  try {
    const qrImage = await QRCode.toDataURL(input);
    req.flash('success', 'QR Code generated successfully!');
    res.render('index', { qrImage, qrText: input, result: null });
  } catch (err) {
    req.flash('error', 'Failed to generate QR code.');
    res.redirect('/');
  }
};

exports.scanImage = async (req, res) => {
  const imagePath = req.file.path;
  console.log("Image Path: ", imagePath);

  try {
    // Use Jimp to load the image
    const image = await Jimp.read(imagePath);
    console.log("Image loaded successfully.");

    // Initialize QR code reader
    const qr = new QrCodeReader();

    // Define the callback for QR code decoding
    qr.callback = function (err, value) {
      if (err || !value) {
        console.error("Error decoding QR code:", err);
        req.flash('error', 'No QR Code found in the image.');
        return res.redirect('/');
      }

      console.log("QR Code decoded successfully: ", value.result);
      req.flash('success', 'QR Code scanned successfully!');
      res.render('index', {
        qrImage: null,
        qrText: null,
        result: value.result,
      });
    };

    // Decode the QR code from the image
    qr.decode(image.bitmap); // Use Jimp's bitmap data for decoding
  } catch (err) {
    console.error("Error reading image: ", err);
    req.flash('error', 'Error scanning QR code image.');
    res.redirect('/');
  }
};
