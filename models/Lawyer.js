const mongoose = require('mongoose');

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

module.exports = mongoose.models.Lawyer || mongoose.model('Lawyer', lawyerSchema);
