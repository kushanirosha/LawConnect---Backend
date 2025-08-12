const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increased to 10MB for image uploads

// MongoDB Connection
const mongoURI = 'mongodb+srv://kushandissanayake74:T3xIOkxvXOLHomUw@lawyers.hpuz8rq.mongodb.net/lawyersDB?retryWrites=true&w=majority';
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Lawyer Schema
const lawyerSchema = new mongoose.Schema({
  id: String,
  name: String,
  email: String,
  password: String,
  specialization: String,
  location: String,
  experience: String,
  fees: String,
  image: { type: String, default: '' },
  bio: { type: String, default: '' },
});

const Lawyer = mongoose.model('Lawyer', lawyerSchema);

// Booking Schema
const bookingSchema = new mongoose.Schema({
  lawyerId: { type: String, required: true },
  clientName: { type: String, required: true },
  clientEmail: { type: String, required: true },
  clientContact: { type: String, required: true },
  consultationNeed: { type: String, required: true },
  message: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  completed: { type: Boolean, default: false },
});

const Booking = mongoose.model('Booking', bookingSchema);

// API Endpoint to Login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find lawyer by email
    const lawyer = await Lawyer.findOne({ email });
    if (!lawyer) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Compare plain text password
    if (lawyer.password !== password) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.status(200).json({ message: 'Login successful', lawyer });
  } catch (err) {
    console.error('Error in POST /api/login:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// API Endpoint to Get Lawyers
app.get('/api/lawyers', async (req, res) => {
  try {
    const lawyers = await Lawyer.find();
    res.json(lawyers);
  } catch (err) {
    console.error('Error in GET /api/lawyers:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// API Endpoint to Create a Lawyer
app.post('/api/lawyers', async (req, res) => {
  try {
    const { name, email, password, specialization, experience, location, fees, image, bio } = req.body;
    
    // Basic validation
    if (!name || !email || !password || !specialization || !experience || !location || !fees) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    // Check for duplicate email
    const existingLawyer = await Lawyer.findOne({ email });
    if (existingLawyer) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Create new lawyer
    const newLawyer = new Lawyer({
      id: Math.random().toString(36).substr(2, 9),
      name,
      email,
      password, // Store plain text password
      specialization,
      location,
      experience,
      fees,
      image: image || '',
      bio: bio || '',
    });

    await newLawyer.save();
    res.status(201).json({ message: 'Lawyer registered successfully', lawyer: newLawyer });
  } catch (err) {
    console.error('Error in POST /api/lawyers:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// API Endpoint to Update a Lawyer
app.put('/api/lawyers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, specialization, experience, location, fees, image, bio } = req.body;

    // Basic validation
    if (!name || !email || !specialization || !experience || !location || !fees) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    // Check for duplicate email (excluding current lawyer)
    const existingLawyer = await Lawyer.findOne({ email, id: { $ne: id } });
    if (existingLawyer) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Update lawyer
    const updatedLawyer = await Lawyer.findOneAndUpdate(
      { id },
      { name, email, specialization, experience, location, fees, image, bio },
      { new: true }
    );

    if (!updatedLawyer) {
      return res.status(404).json({ message: 'Lawyer not found' });
    }

    res.status(200).json({ message: 'Lawyer updated successfully', lawyer: updatedLawyer });
  } catch (err) {
    console.error('Error in PUT /api/lawyers:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// API Endpoint to Create a Booking
app.post('/api/bookings', async (req, res) => {
  try {
    const { lawyerId, clientName, clientEmail, clientContact, consultationNeed, message } = req.body;

    // Basic validation
    if (!lawyerId || !clientName || !clientEmail || !clientContact || !consultationNeed) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    // Verify lawyer exists
    const lawyer = await Lawyer.findOne({ id: lawyerId });
    if (!lawyer) {
      return res.status(404).json({ message: 'Lawyer not found' });
    }

    // Create new booking
    const newBooking = new Booking({
      lawyerId,
      clientName,
      clientEmail,
      clientContact,
      consultationNeed,
      message: message || '',
    });

    await newBooking.save();
    res.status(201).json({ message: 'Booking created successfully', booking: newBooking });
  } catch (err) {
    console.error('Error in POST /api/bookings:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// API Endpoint to Get Bookings by Lawyer ID
app.get('/api/bookings/lawyer/:lawyerId', async (req, res) => {
  try {
    const { lawyerId } = req.params;
    const bookings = await Booking.find({ lawyerId });
    res.json(bookings);
  } catch (err) {
    console.error('Error in GET /api/bookings/lawyer:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// API Endpoint to Update Booking Status
app.patch('/api/bookings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { completed } = req.body;

    if (typeof completed !== 'boolean') {
      return res.status(400).json({ message: 'Completed status must be a boolean' });
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      id,
      { completed },
      { new: true }
    );

    if (!updatedBooking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.status(200).json({ message: 'Booking updated successfully', booking: updatedBooking });
  } catch (err) {
    console.error('Error in PATCH /api/bookings:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Handle 413 Payload Too Large errors
app.use((err, req, res, next) => {
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ message: 'Payload too large. Please upload a smaller image.' });
  }
  next(err);
});

// Catch-all for 404 errors
app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint not found' });
});

// Start Server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});