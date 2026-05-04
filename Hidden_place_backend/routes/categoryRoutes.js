const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const protect = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');
const Place = require('../models/Place');

// ==========================================
// 1. ADD CATEGORY (Admin Only)
// ==========================================
router.post('/', protect, admin, async (req, res) => {
  try {
    const { name, icon, description } = req.body;
    const category = new Category({ name, icon, description });
    await category.save();
    res.status(201).json({ message: 'Category added successfully', category });
  } catch (error) {
    res.status(500).json({ message: 'Error adding category', error: error.message });
  }
});

// ==========================================
// 2. GET ALL CATEGORIES (Public)
// ==========================================
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories', error: error.message });
  }
});

// ==========================================
// 3. GET POPULAR CATEGORIES (Public)
// ==========================================
router.get('/popular', async (req, res) => {
  try {
    // Aggragate categories by place count
    const popular = await Place.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 6 }
    ]);
    
    const categoryIds = popular.map(p => p._id);
    const categories = await Category.find({ _id: { $in: categoryIds } });
    
    // Sort them by the original popular order
    const sorted = categoryIds.map(id => categories.find(c => c._id.toString() === id.toString())).filter(c => c);
    
    res.status(200).json(sorted);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching popular categories', error: error.message });
  }
});

// ==========================================
// 4. UPDATE CATEGORY (Admin Only)
// ==========================================
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const updated = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Category not found' });
    res.status(200).json({ message: 'Category updated successfully', category: updated });
  } catch (error) {
    res.status(500).json({ message: 'Error updating category', error: error.message });
  }
});

// ==========================================
// 5. REMOVE CATEGORY (Admin Only)
// ==========================================
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });

    await Category.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Category removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error removing category', error: error.message });
  }
});

module.exports = router;
