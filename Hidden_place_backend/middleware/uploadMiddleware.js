const multer = require('multer');
const path = require('path');

// 1. Tell Multer WHERE to save the files and WHAT to name them
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Saves the files in that new folder you just made!
  },
  filename: function (req, file, cb) {
    // Gives the file a unique name using the current timestamp so files don't overwrite each other
    cb(null, Date.now() + path.extname(file.originalname)); 
  }
});

// 2. Make sure the user is only uploading images (no malicious files!)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true); // It's an image, let it through!
  } else {
    cb(new Error('Not an image! Please upload only images.'), false); // Reject it!
  }
};

// 3. Put it all together
const upload = multer({ 
  storage: storage, 
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // Optional: limit file size to 5MB
});

module.exports = upload;