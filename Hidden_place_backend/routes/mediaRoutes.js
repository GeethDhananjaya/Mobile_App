const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const MediaAsset = require('../models/MediaAsset');
const protect = require('../middleware/authMiddleware');

// ==========================================
// 1. MULTER STORAGE CONFIG
// ==========================================
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Make sure this folder exists!
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// ==========================================
// 2. UPLOAD MEDIA (Protected)
// ==========================================
router.post('/upload', protect, upload.single('media'), async (req, res) => {
  try {
    if (!req.file) {
      console.error('⚠️ Multer did not receive a file!');
      return res.status(400).json({ message: 'No file uploaded. Check field name is "media".' });
    }

    const { place, caption, type } = req.body;
    
    if (!place) {
      console.error('⚠️ Upload error: No Place ID provided in the body!');
      return res.status(400).json({ message: 'Place ID is required to link the media.' });
    }

    const newMedia = new MediaAsset({
      place,
      url: `/uploads/${req.file.filename}`,
      caption: caption || '',
      type: type || 'image',
      uploadedBy: req.user
    });

    const savedMedia = await newMedia.save();
    const totalCount = await MediaAsset.countDocuments(); // 🚨 NEW: Let's count them!
    console.log(`✅ Saved to MediaAsset! Total photos in DB: ${totalCount}`);
    res.status(201).json({ message: 'Media uploaded successfully', media: savedMedia });
  } catch (error) {
    console.error('❌ Upload internal error:', error.message);
    res.status(500).json({ message: 'Upload internal error', error: error.message });
  }
});

// ==========================================
// 3. GET PLACE GALLERY (Public)
// ==========================================
router.get('/:placeId', async (req, res) => {
  try {
    const gallery = await MediaAsset.find({ place: req.params.placeId });
    res.status(200).json(gallery);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching gallery', error: error.message });
  }
});

// ==========================================
// 4. UPDATE CAPTION (Protected)
// ==========================================
router.put('/:id', protect, async (req, res) => {
  try {
    const media = await MediaAsset.findById(req.params.id);
    if (!media) return res.status(404).json({ message: 'Media not found' });
    if (media.uploadedBy.toString() !== req.user) return res.status(401).json({ message: 'Unauthorized' });

    media.caption = req.body.caption;
    await media.save();
    res.status(200).json({ message: 'Caption updated', media });
  } catch (error) {
    res.status(500).json({ message: 'Error updating caption', error: error.message });
  }
});

// ==========================================
// 5. DELETE MEDIA (Protected)
// ==========================================
router.delete('/:id', protect, async (req, res) => {
  try {
    const media = await MediaAsset.findById(req.params.id);
    if (!media) return res.status(404).json({ message: 'Media not found' });
    if (media.uploadedBy.toString() !== req.user) return res.status(401).json({ message: 'Unauthorized' });

    await MediaAsset.findByIdAndDelete(req.params.id);
    // Ideally delete file from disk here too using fs.unlink
    res.status(200).json({ message: 'Media deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting media', error: error.message });
  }
});

module.exports = router;
