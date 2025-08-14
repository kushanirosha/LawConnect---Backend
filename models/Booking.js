const mongoose = require('mongoose');

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

module.exports = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);
