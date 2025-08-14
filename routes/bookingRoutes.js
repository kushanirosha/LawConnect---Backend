const express = require('express');
const Booking = require('../models/Booking');
const Lawyer = require('../models/Lawyer');
const router = express.Router();

// Create booking
router.post('/', async (req, res) => {
  try {
    const { lawyerId, clientName, clientEmail, clientContact, consultationNeed, message } = req.body;
    if (!lawyerId || !clientName || !clientEmail || !clientContact || !consultationNeed) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }
    const lawyer = await Lawyer.findOne({ id: lawyerId });
    if (!lawyer) return res.status(404).json({ message: 'Lawyer not found' });

    const booking = new Booking({ lawyerId, clientName, clientEmail, clientContact, consultationNeed, message });
    await booking.save();
    res.status(201).json({ message: 'Booking created successfully', booking });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
