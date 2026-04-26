const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const protect = require('../middleware/authMiddleware');

// ==========================================
// 1. ADD CATEGORY (Protected)
// ==========================================
router.post('/', protect, async (req, res) => {
  try {
    const { name, icon } = req.body;
    const category = new Category({ name, icon });
    await category.save();
    res.status(201).json({ message: 'Category added', category });
  } catch (error) {
    res.status(500).json({ message: 'Error adding category', error: error.message });
  }
});

// ==========================================
// 2. GET ALL CATEGORIES (Public)
// ==========================================
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories', error: error.message });
  }
});

// ==========================================
// 3. UPDATE CATEGORY (Protected)
// ==========================================
router.put('/:id', protect, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });

    const updated = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ message: 'Category updated', category: updated });
  } catch (error) {
    res.status(500).json({ message: 'Error updating category', error: error.message });
  }
});

// ==========================================
// 4. REMOVE CATEGORY (Protected)
// ==========================================
router.delete('/:id', protect, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });

    await Category.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Category removed' });
  } catch (error) {
    res.status(500).json({ message: 'Error removing category', error: error.message });
  }
});

module.exports = router;
