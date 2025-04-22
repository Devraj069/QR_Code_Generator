
const Jimp = require('jimp');

Jimp.read('./path/to/sample-image.png')  // Update the path to an actual image
  .then(image => {
    console.log('Image loaded successfully');
    image.write('./output-image.png');  // Write the image to a file
  })
  .catch(err => {
    console.error('Error loading image:', err);
  });

