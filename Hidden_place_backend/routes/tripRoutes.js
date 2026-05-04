const express = require('express');
const router = express.Router();
const TripPlan = require('../models/TripPlan');
const protect = require('../middleware/authMiddleware');

// ==========================================
// 1. CREATE TRIP PLAN (Protected)
// ==========================================
router.post('/', protect, async (req, res) => {
  try {
    const { title, places, startDate, endDate } = req.body;
    const newTrip = new TripPlan({
      title, user: req.user, places, startDate, endDate
    });
    await newTrip.save();
    res.status(201).json({ message: 'Trip planned successfully', trip: newTrip });
  } catch (error) {
    res.status(500).json({ message: 'Error planning trip', error: error.message });
  }
});

// ==========================================
// 2. GET MY TRIPS (Protected)
// ==========================================
router.get('/my', protect, async (req, res) => {
  try {
    const trips = await TripPlan.find({ user: req.user }).populate('places', 'title location imageUrl');
    res.status(200).json(trips);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching trips', error: error.message });
  }
});

// ==========================================
// 3. UPDATE TRIP STATUS (Protected)
// ==========================================
router.put('/:id/status', protect, async (req, res) => {
  try {
    const trip = await TripPlan.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    if (trip.user.toString() !== req.user) return res.status(401).json({ message: 'Unauthorized' });

    trip.status = req.body.status;
    await trip.save();
    res.status(200).json({ message: 'Trip status updated', trip });
  } catch (error) {
    res.status(500).json({ message: 'Error updating trip', error: error.message });
  }
});

// ==========================================
// 4. CANCEL TRIP (Protected)
// ==========================================
router.delete('/:id', protect, async (req, res) => {
  try {
    const trip = await TripPlan.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    if (trip.user.toString() !== req.user) return res.status(401).json({ message: 'Unauthorized' });

    await TripPlan.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Trip cancelled' });
  } catch (error) {
    res.status(500).json({ message: 'Error cancelling trip', error: error.message });
  }
});

// ==========================================
// 5. GET TRIP BY ID (Protected)
// ==========================================
router.get('/:id', protect, async (req, res) => {
  try {
    const trip = await TripPlan.findById(req.params.id)
      .populate('places', 'title description location imageUrl')
      .populate('user', 'name email')
      .populate('guide', 'name email');
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    res.status(200).json(trip);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching trip details', error: error.message });
  }
});

// ==========================================
// 6. UPDATE TRIP DETAILS (Protected)
// ==========================================
router.put('/:id', protect, async (req, res) => {
  try {
    const { title, places, startDate, endDate } = req.body;
    const trip = await TripPlan.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    // Allow owner or joined guide to edit
    const isOwner = trip.user.toString() === req.user;
    const isGuide = trip.guide && trip.guide.toString() === req.user;
    
    if (!isOwner && !isGuide) return res.status(401).json({ message: 'Unauthorized' });

    trip.title = title || trip.title;
    trip.places = places || trip.places;
    trip.startDate = startDate || trip.startDate;
    trip.endDate = endDate || trip.endDate;

    await trip.save();
    res.status(200).json({ message: 'Trip updated successfully', trip });
  } catch (error) {
    res.status(500).json({ message: 'Error updating trip', error: error.message });
  }
});

// ==========================================
// 7. JOIN AS GUIDE (Protected)
// ==========================================
router.put('/:id/join', protect, async (req, res) => {
  try {
    const trip = await TripPlan.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    if (trip.guide) return res.status(400).json({ message: 'Guide already joined this trip' });

    trip.guide = req.user;
    await trip.save();
    res.status(200).json({ message: 'Joined as guide', trip });
  } catch (error) {
    res.status(500).json({ message: 'Error joining trip', error: error.message });
  }
});

// ==========================================
// 8. LEAVE AS GUIDE (Protected)
// ==========================================
router.put('/:id/leave', protect, async (req, res) => {
  try {
    const trip = await TripPlan.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    if (trip.guide?.toString() !== req.user) return res.status(401).json({ message: 'Not authorized' });

    trip.guide = undefined;
    await trip.save();
    res.status(200).json({ message: 'Left trip as guide', trip });
  } catch (error) {
    res.status(500).json({ message: 'Error leaving trip', error: error.message });
  }
});

module.exports = router;
