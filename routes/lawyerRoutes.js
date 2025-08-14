const express = require('express');
const Lawyer = require('../models/Lawyer');
const router = express.Router();

// Get all lawyers
router.get('/', async (req, res) => {
  try {
    const lawyers = await Lawyer.find();
    res.json(lawyers);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new lawyer
router.post('/', async (req, res) => {
  try {
    const { name, email, password, specialization, experience, location, fees, image, bio } = req.body;
    if (!name || !email || !password || !specialization || !experience || !location || !fees) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }
    const existing = await Lawyer.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    const newLawyer = new Lawyer({
      id: Math.random().toString(36).substr(2, 9),
      name, email, password, specialization, location, experience, fees, image, bio
    });

    await newLawyer.save();
    res.status(201).json({ message: 'Lawyer registered successfully', lawyer: newLawyer });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
