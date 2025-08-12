const mongoose = require('mongoose');

// MongoDB Connection
const mongoURI = 'mongodb+srv://kushandissanayake74:T3xIOkxvXOLHomUw@lawyers.hpuz8rq.mongodb.net/lawyersDB?retryWrites=true&w=majority';

mongoose.connect(mongoURI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Lawyer Schema (needed to fetch lawyer IDs)
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
  __v: { type: Number, default: 0 },
});

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
  __v: { type: Number, default: 0 },
});

const Lawyer = mongoose.model('Lawyer', lawyerSchema);
const Booking = mongoose.model('Booking', bookingSchema);

// Sample booking data
const bookings = [
  {
    _id: '688675e523318b3180b903fc',
    lawyerId: 'fs02543ft', // Matches Kushan Dissanayake
    clientName: 'Kushani Roshani',
    clientEmail: 'kushanirosha57@gmail.com',
    clientContact: '098989888',
    consultationNeed: 'Corporate Law',
    message: 'Need advice on business contract',
    createdAt: new Date('2025-07-27T18:54:29.989Z'),
    __v: 0,
  },
  {
    lawyerId: 'fs02543ft', // Kushan Dissanayake
    clientName: 'Saman Perera',
    clientEmail: 'saman.perera@gmail.com',
    clientContact: '0712345678',
    consultationNeed: 'Corporate Law',
    message: 'Consultation for merger agreement',
    createdAt: new Date('2025-07-26T10:30:00.000Z'),
    __v: 0,
  },
  {
    lawyerId: null, // To be replaced with Amara Perera's ID
    clientName: 'Nimali Silva',
    clientEmail: 'nimali.silva@gmail.com',
    clientContact: '0779876543',
    consultationNeed: 'Criminal Law',
    message: 'Defense strategy discussion',
    createdAt: new Date('2025-07-25T14:15:00.000Z'),
    __v: 0,
  },
  {
    lawyerId: null, // To be replaced with Nimal Wijesinghe's ID
    clientName: 'Anusha Fernando',
    clientEmail: 'anusha.fernando@gmail.com',
    clientContact: '0765432109',
    consultationNeed: 'Family Law',
    message: 'Child custody case inquiry',
    createdAt: new Date('2025-07-24T09:00:00.000Z'),
    __v: 0,
  },
  {
    lawyerId: null, // To be replaced with Sanjana Fernando's ID
    clientName: 'Ruwan Jayasinghe',
    clientEmail: 'ruwan.jayasinghe@gmail.com',
    clientContact: '0701234567',
    consultationNeed: 'Real Estate Law',
    message: 'Property transfer assistance',
    createdAt: new Date('2025-07-23T16:45:00.000Z'),
    __v: 0,
  },
  {
    lawyerId: null, // To be replaced with Ravi Silva's ID
    clientName: 'Dilani Wijesekara',
    clientEmail: 'dilani.wijesekara@gmail.com',
    clientContact: '0789876543',
    consultationNeed: 'Immigration Law',
    message: 'Visa application support',
    createdAt: new Date('2025-07-22T11:20:00.000Z'),
    __v: 0,
  },
  {
    lawyerId: null, // To be replaced with Lakshmi Rajapaksa's ID
    clientName: 'Chamara Bandara',
    clientEmail: 'chamara.bandara@gmail.com',
    clientContact: '0756789012',
    consultationNeed: 'Personal Injury',
    message: 'Accident claim consultation',
    createdAt: new Date('2025-07-21T13:10:00.000Z'),
    __v: 0,
  },
  {
    lawyerId: null, // To be replaced with Chathura Bandara's ID
    clientName: 'Malika Senanayake',
    clientEmail: 'malika.senanayake2@gmail.com',
    clientContact: '0723456789',
    consultationNeed: 'Corporate Law',
    message: 'Corporate compliance advice',
    createdAt: new Date('2025-07-20T08:50:00.000Z'),
    __v: 0,
  },
  {
    lawyerId: null, // To be replaced with Dilani Gunawardena's ID
    clientName: 'Tharindu Perera',
    clientEmail: 'tharindu.perera@gmail.com',
    clientContact: '0798765432',
    consultationNeed: 'Family Law',
    message: 'Divorce settlement query',
    createdAt: new Date('2025-07-19T15:30:00.000Z'),
    __v: 0,
  },
  {
    lawyerId: null, // To be replaced with Tharindu Jayasinghe's ID
    clientName: 'Sanjana Wijesinghe',
    clientEmail: 'sanjana.wijesinghe@gmail.com',
    clientContact: '0719876543',
    consultationNeed: 'Criminal Law',
    message: 'Court representation needed',
    createdAt: new Date('2025-07-18T12:00:00.000Z'),
    __v: 0,
  },
];

// Function to seed bookings
async function seedBookings() {
  try {
    // Fetch lawyer IDs from the lawyers collection
    const lawyers = await Lawyer.find({}, { id: 1 });
    const validLawyerIds = lawyers.map(lawyer => lawyer.id);

    if (validLawyerIds.length === 0) {
      throw new Error('No lawyers found in the database. Run the lawyer seed script first.');
    }

    // Update bookings with valid lawyerIds
    const updatedBookings = bookings.map((booking, index) => {
      if (index === 0) return booking; // Keep first booking as is
      return {
        ...booking,
        lawyerId: validLawyerIds[(index - 1) % validLawyerIds.length], // Cycle through valid lawyer IDs
      };
    });

    for (const booking of updatedBookings) {
      await Booking.updateOne(
        { _id: booking._id || new mongoose.Types.ObjectId() }, // Use provided _id or generate new
        { $set: booking }, // Update or set all fields
        { upsert: true } // Insert if not exists
      );
      console.log(`Upserted booking for client: ${booking.clientName}`);
    }
    console.log('All bookings seeded successfully');
  } catch (err) {
    console.error('Error seeding bookings:', err);
  } finally {
    mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seeding function
seedBookings();