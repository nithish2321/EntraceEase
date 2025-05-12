const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { parse } = require('csv-parse');
const fs = require('fs');
const path = require('path');
const generateHallTicket = require('./generateHallTicket.js');

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

require('dotenv').config();
const Mailgen = require('mailgen');
const nodemailer = require('nodemailer');

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Configure Mailgen
const mailGenerator = new Mailgen({
  theme: 'default',
  product: {
    name: 'Exam Management System',
    link: 'http://localhost:3000',
  },
});

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.error('MongoDB Connection Error:', err));

// Schemas
const CollegeSchema = new mongoose.Schema({
  CollegeName: String,
  CollegeConductingExamName: String,
  ExamEligibilityQualification: String,
  ExamFees: Number,
  Nationality: String,
  AgeLimit: Number,
  SubjectEligibility: String,
  ProgrammesOffered: String,
  PreviousYearCutOff: Number,
  ExamSyllabus: String,
  SeatAvailablity: String,
  ExamDate: String,
  ExamSlots: [String],
  ExamDuration: Number,
  ExamPattern: String,
  ExamType: String,
  ExamMode: String,
  BookedDates: [
    {
      Date: { type: Date, required: true },
      Slots: [
        {
          Slot: { type: String, required: true },
          SeatsBooked: { type: Number, required: true },
          TestCenterId: { type: mongoose.Schema.Types.ObjectId, ref: 'TestCenter', required: true },
          BookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
        },
      ],
    },
  ],
});

const TestCenterSchema = new mongoose.Schema({
  TestCenterName: String,
  Location: String,
  NormalVaccancy: Number,
  TotalVaccancy: Number,
  BookingAvailableSeats: [
    {
      BookingDate: { type: Date, required: true },
      Slots: [
        {
          Slot: { type: String, required: true },
          AvailableSeats: { type: Number, required: true },
        },
      ],
    },
  ],
  BookingHistory: [
    {
      CollegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College' },
      BookingDate: Date,
      Slots: [{ Slot: String, SeatsBooked: Number }],
      Timestamp: Date,
    },
  ],
});

const BookingSchema = new mongoose.Schema({
  TestCenters: [
    {
      TestCenterId: { type: mongoose.Schema.Types.ObjectId, ref: 'TestCenter' },
      BookingDates: [
        {
          Date: Date,
          Slots: [{ Slot: String, SeatsToBook: Number }],
        },
      ],
    },
  ],
  College: [{ type: mongoose.Schema.Types.ObjectId, ref: 'College' }],
});

const CollegeExamConductingAuthoritySchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College' },
});

const TestCenterManagerSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  testCenterId: { type: mongoose.Schema.Types.ObjectId, ref: 'TestCenter' },
});

const dataSchema = new mongoose.Schema(
  {
    collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true },
  },
  { strict: false }
);

// Models
const College = mongoose.model('College', CollegeSchema);
const TestCenter = mongoose.model('TestCenter', TestCenterSchema);
const Booking = mongoose.model('Booking', BookingSchema);
const CollegeExamConductingAuthority = mongoose.model(
  'CollegeExamConductingAuthority',
  CollegeExamConductingAuthoritySchema
);
const TestCenterManager = mongoose.model('TestCenterManager', TestCenterManagerSchema);
const Students = mongoose.model('Students', dataSchema);

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied: No token provided' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.error('Token verification failed:', err.message);
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    console.log('Authenticated user:', user);
    req.user = user;
    next();
  });
};

// Multer setup for file upload
const upload = multer({ dest: 'uploads/' });

// College Routes
app.post('/api/college/register', async (req, res) => {
  const { email, password, collegeData } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const college = new College(collegeData);
    await college.save();
    const authority = new CollegeExamConductingAuthority({
      email,
      password: hashedPassword,
      collegeId: college._id,
    });
    await authority.save();
    res.status(201).json({ message: 'College registered successfully' });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Failed to register college' });
  }
});

app.post('/api/college/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const authority = await CollegeExamConductingAuthority.findOne({ email });
    if (!authority || !(await bcrypt.compare(password, authority.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign(
      { id: authority._id, role: 'college', collegeId: authority.collegeId },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    res.json({ token, collegeId: authority.collegeId });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Failed to login' });
  }
});

app.get('/api/college/profile', authenticateToken, async (req, res) => {
  if (req.user.role !== 'college') return res.status(403).json({ error: 'Forbidden' });

  try {
    console.log('Fetching profile for user ID:', req.user.id);
    const authority = await CollegeExamConductingAuthority.findById(req.user.id).populate({
      path: 'collegeId',
      populate: {
        path: 'BookedDates.Slots.TestCenterId',
        select: 'TestCenterName Location',
      },
    });

    if (!authority) {
      console.log('No authority found for ID:', req.user.id);
      return res.status(404).json({ error: 'College authority not found' });
    }
    if (!authority.collegeId) {
      console.log('No college linked to authority:', authority._id);
      return res.status(404).json({ error: 'College not linked to this authority' });
    }

    console.log('Returning college data:', authority.collegeId);
    res.json(authority.collegeId);
  } catch (err) {
    console.error('Error fetching college profile:', err.stack);
    res.status(500).json({ error: 'Failed to fetch college profile: ' + err.message });
  }
});

app.put('/api/college/update', authenticateToken, async (req, res) => {
  if (req.user.role !== 'college') return res.status(403).json({ error: 'Forbidden' });
  try {
    const authority = await CollegeExamConductingAuthority.findById(req.user.id);
    const college = await College.findByIdAndUpdate(authority.collegeId, req.body, { new: true });
    res.json(college);
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Test Center Routes
app.post('/api/test-center/register', async (req, res) => {
  const { email, password, testCenterData } = req.body;
  try {
    const { NormalVaccancy, AvailableDates, AvailableSlots } = testCenterData;
    const totalVaccancy = NormalVaccancy * AvailableDates.length * AvailableSlots.length;
    const bookingAvailableSeats = AvailableDates.map((date) => ({
      BookingDate: date,
      Slots: AvailableSlots.map((slot) => ({ Slot: slot, AvailableSeats: NormalVaccancy })),
    }));
    testCenterData.TotalVaccancy = totalVaccancy;
    testCenterData.BookingAvailableSeats = bookingAvailableSeats;
    const testCenter = new TestCenter(testCenterData);
    await testCenter.save();
    const hashedPassword = await bcrypt.hash(password, 10);
    const manager = new TestCenterManager({
      email,
      password: hashedPassword,
      testCenterId: testCenter._id,
    });
    await manager.save();
    res.status(201).json({ message: 'Test Center registered successfully', testCenter });
  } catch (err) {
    console.error('Test center registration error:', err);
    res.status(500).json({ error: 'Failed to register test center' });
  }
});

app.post('/api/test-center/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const manager = await TestCenterManager.findOne({ email });
    if (!manager || !(await bcrypt.compare(password, manager.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: manager._id, role: 'test-center' }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });
    res.json({ token, testCenterId: manager.testCenterId });
  } catch (err) {
    console.error('Test center login error:', err);
    res.status(500).json({ error: 'Failed to login' });
  }
});

app.get('/api/test-center/profile', authenticateToken, async (req, res) => {
  if (req.user.role !== 'test-center') return res.status(403).json({ error: 'Forbidden' });
  try {
    const manager = await TestCenterManager.findById(req.user.id).populate('testCenterId');
    res.json(manager.testCenterId);
  } catch (err) {
    console.error('Test center profile error:', err);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

app.put('/api/test-center/update', authenticateToken, async (req, res) => {
  if (req.user.role !== 'test-center') return res.status(403).json({ error: 'Forbidden' });
  try {
    const manager = await TestCenterManager.findById(req.user.id);
    const testCenter = await TestCenter.findByIdAndUpdate(manager.testCenterId, req.body, {
      new: true,
    });
    res.json(testCenter);
  } catch (err) {
    console.error('Test center update error:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

app.get('/api/test-center/availability', authenticateToken, async (req, res) => {
  if (req.user.role !== 'test-center') return res.status(403).json({ error: 'Forbidden' });
  try {
    const manager = await TestCenterManager.findById(req.user.id).populate('testCenterId');
    const testCenter = manager.testCenterId;
    res.json({
      TotalVaccancy: testCenter.TotalVaccancy,
      BookingAvailableSeats: testCenter.BookingAvailableSeats,
    });
  } catch (err) {
    console.error('Availability error:', err);
    res.status(500).json({ error: 'Failed to fetch availability' });
  }
});

app.get('/api/test-center/bookings', authenticateToken, async (req, res) => {
  if (req.user.role !== 'test-center') return res.status(403).json({ error: 'Forbidden' });
  try {
    const manager = await TestCenterManager.findById(req.user.id).populate({
      path: 'testCenterId',
      populate: {
        path: 'BookingHistory.CollegeId',
        select: 'CollegeName CollegeConductingExamName',
      },
    });
    res.json(manager.testCenterId.BookingHistory);
  } catch (err) {
    console.error('Booking history error:', err);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Booking Route
app.post('/api/bookings', authenticateToken, async (req, res) => {
  if (req.user.role !== 'college') return res.status(403).json({ error: 'Forbidden' });

  const { TestCenters } = req.body;

  try {
    const authority = await CollegeExamConductingAuthority.findById(req.user.id);
    if (!authority) return res.status(404).json({ error: 'College authority not found' });

    const college = await College.findById(authority.collegeId);
    if (!college) return res.status(404).json({ error: 'College not found' });

    let booking = new Booking({ TestCenters, Colleges: [authority.collegeId] });

    for (const testCenter of TestCenters) {
      const center = await TestCenter.findById(testCenter.TestCenterId);
      if (!center) {
        return res.status(404).json({ error: `Test Center ${testCenter.TestCenterId} not found` });
      }

      for (const bookingDate of testCenter.BookingDates) {
        const availabilityEntry = center.BookingAvailableSeats.find(
          (entry) => entry.BookingDate.toISOString() === new Date(bookingDate.Date).toISOString()
        );

        if (!availabilityEntry) {
          return res.status(400).json({ error: `No availability for date ${bookingDate.Date}` });
        }

        for (const slot of bookingDate.Slots) {
          const slotEntry = availabilityEntry.Slots.find((s) => s.Slot === slot.Slot);
          if (!slotEntry || slotEntry.AvailableSeats < slot.SeatsToBook) {
            return res.status(400).json({
              error: `Not enough seats in slot ${slot.Slot} on ${bookingDate.Date} (Available: ${
                slotEntry?.AvailableSeats || 0
              })`,
            });
          }

          slotEntry.AvailableSeats -= slot.SeatsToBook;
          center.TotalVaccancy -= slot.SeatsToBook;

          center.BookingHistory.push({
            CollegeId: authority.collegeId,
            BookingDate: bookingDate.Date,
            Slots: [{ Slot: slot.Slot, SeatsBooked: slot.SeatsToBook }],
            Timestamp: new Date(),
          });

          const existingDate = college.BookedDates.find(
            (d) => new Date(d.Date).toISOString() === new Date(bookingDate.Date).toISOString()
          );
          if (existingDate) {
            existingDate.Slots.push({
              Slot: slot.Slot,
              SeatsBooked: slot.SeatsToBook,
              TestCenterId: testCenter.TestCenterId,
              BookingId: booking._id,
            });
          } else {
            college.BookedDates.push({
              Date: bookingDate.Date,
              Slots: [
                {
                  Slot: slot.Slot,
                  SeatsBooked: slot.SeatsToBook,
                  TestCenterId: testCenter.TestCenterId,
                  BookingId: booking._id,
                },
              ],
            });
          }
        }
      }
      await center.save();
    }

    await college.save();
    await booking.save();

    res.json({ message: 'Booking successful', booking });
  } catch (err) {
    console.error('Booking error:', err);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// Existing Routes
app.get('/api/colleges', async (req, res) => {
  try {
    const colleges = await College.find();
    res.json(colleges);
  } catch (err) {
    console.error('Colleges fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch colleges' });
  }
});

app.get('/api/test-centers', async (req, res) => {
  try {
    const centers = await TestCenter.find();
    res.json(centers);
  } catch (err) {
    console.error('Test centers fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch test centers' });
  }
});

app.post('/api/colleges', async (req, res) => {
  try {
    const college = new College(req.body);
    await college.save();
    res.status(201).json(college);
  } catch (err) {
    console.error('College creation error:', err);
    res.status(500).json({ error: 'Failed to create college' });
  }
});

app.post('/api/test-centers', async (req, res) => {
  try {
    const { TestCenterName, Location, NormalVaccancy, AvailableDates, AvailableSlots } = req.body;
    const totalVaccancy = NormalVaccancy * AvailableDates.length * AvailableSlots.length;
    const bookingAvailableSeats = AvailableDates.map((date) => ({
      BookingDate: date,
      Slots: AvailableSlots.map((slot) => ({ Slot: slot, AvailableSeats: NormalVaccancy })),
    }));

    const testCenter = new TestCenter({
      TestCenterName,
      Location,
      NormalVaccancy,
      TotalVaccancy: totalVaccancy,
      BookingAvailableSeats: bookingAvailableSeats,
      BookingHistory: [],
    });

    await testCenter.save();
    res.status(201).json(testCenter);
  } catch (err) {
    console.error('Test center creation error:', err);
    res.status(500).json({ error: 'Failed to create test center' });
  }
});

app.get('/api/college/bookings', authenticateToken, async (req, res) => {
  if (req.user.role !== 'college') return res.status(403).json({ error: 'Forbidden' });
  try {
    const authority = await CollegeExamConductingAuthority.findById(req.user.id);
    const bookings = await Booking.find({ College: authority.collegeId }).populate({
      path: 'TestCenters.TestCenterId',
      select: 'TestCenterName Location',
    });
    res.json(bookings);
  } catch (err) {
    console.error('College bookings error:', err);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

app.put('/api/bookings/:id', authenticateToken, async (req, res) => {
  try {
    const bookingId = req.params.id;
    const { TestCenters } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    const college = await College.findById(booking.Colleges[0]);

    for (const testCenter of TestCenters) {
      const center = await TestCenter.findById(testCenter.TestCenterId);
      for (const bookingDate of testCenter.BookingDates) {
        const availabilityEntry = center.BookingAvailableSeats.find(
          (entry) => entry.BookingDate.toISOString() === new Date(bookingDate.Date).toISOString()
        );
        for (const slot of bookingDate.Slots) {
          const slotEntry = availabilityEntry.Slots.find((s) => s.Slot === slot.Slot);
          const oldBooking = booking.TestCenters.find(
            (tc) => tc.TestCenterId.toString() === testCenter.TestCenterId.toString()
          );
          const oldDate = oldBooking.BookingDates.find(
            (d) => new Date(d.Date).toISOString() === new Date(bookingDate.Date).toISOString()
          );
          const oldSlot = oldDate.Slots.find((s) => s.Slot === slot.Slot);
          const seatDifference = oldSlot.SeatsToBook - slot.SeatsToBook;

          slotEntry.AvailableSeats += seatDifference;
          center.TotalVaccancy += seatDifference;

          const historyEntry = center.BookingHistory.find(
            (h) =>
              h.CollegeId.toString() === booking.Colleges[0].toString() &&
              new Date(h.BookingDate).toISOString() === new Date(bookingDate.Date).toISOString()
          );
          historyEntry.Slots = historyEntry.Slots.map((s) =>
            s.Slot === slot.Slot ? { ...s, SeatsBooked: slot.SeatsToBook } : s
          );

          const collegeDate = college.BookedDates.find(
            (d) => new Date(d.Date).toISOString() === new Date(bookingDate.Date).toISOString()
          );
          collegeDate.Slots = collegeDate.Slots.map((s) =>
            s.Slot === slot.Slot && s.TestCenterId.toString() === testCenter.TestCenterId.toString()
              ? { ...s, SeatsBooked: slot.SeatsToBook }
              : s
          );
        }
        await center.save();
      }
    }

    booking.TestCenters = TestCenters;
    await booking.save();
    await college.save();

    res.json({ message: 'Booking updated successfully', booking });
  } catch (err) {
    console.error('Booking update error:', err);
    res.status(500).json({ error: 'Failed to update booking' });
  }
});

// CSV Upload Route
app.post('/upload', authenticateToken, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const collegeId = req.user.collegeId || req.body.collegeId;
  if (!collegeId) {
    return res.status(400).json({ error: 'College ID required' });
  }

  const results = [];

  fs.createReadStream(req.file.path)
    .pipe(parse({ delimiter: ',', columns: true }))
    .on('data', (row) => {
      results.push({ ...row, collegeId });
    })
    .on('error', (error) => {
      console.error('CSV parsing error:', error);
      res.status(400).json({ error: 'Invalid CSV file' });
    })
    .on('end', async () => {
      if (results.length === 0) {
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ error: 'CSV file is empty' });
      }

      try {
        await Students.insertMany(results, { ordered: false });
        fs.unlinkSync(req.file.path);
        res.status(200).json({ message: 'CSV data uploaded successfully' });
      } catch (error) {
        console.error('Insert error:', error);
        fs.unlinkSync(req.file.path);
        res.status(500).json({ error: 'Error inserting data' });
      }
    });
});

// Fetch Students Route
app.get('/students', authenticateToken, async (req, res) => {
  try {
    const collegeId = req.user.collegeId || req.query.collegeId;
    if (!collegeId) {
      return res.status(400).json({ error: 'College ID required' });
    }
    if (!mongoose.Types.ObjectId.isValid(collegeId)) {
      return res.status(400).json({ error: 'Invalid college ID' });
    }
    const students = await Students.find({ collegeId });
    res.status(200).json(students);
  } catch (error) {
    console.error('Fetch error:', error);
    res.status(500).json({ error: 'Error fetching data' });
  }
});

const StudentAssignmentSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Students', required: true },
  collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true },
  testCenterId: { type: mongoose.Schema.Types.ObjectId, ref: 'TestCenter', required: true },
  examDate: { type: Date, required: true },
  slot: { type: String, required: true },
  emailStatus: { type: String, enum: ['sent', 'failed', 'pending'], default: 'pending' },
  regno: { type: String, required: true }, // New field for registration number
  assignedAt: { type: Date, default: Date.now },
});

const StudentAssignment = mongoose.model('StudentAssignment', StudentAssignmentSchema);

// Define custom emails list
const custom_emails = [
  'nithishkumarbcsmca@gmail.com',
  'kanthravi2002@gmail.com',
  'y3015661@gmail.com',
];

// Updated /api/assign-test-centers endpoint
app.post('/api/assign-test-centers', authenticateToken, async (req, res) => {
  if (req.user.role !== 'college') {
    return res.status(403).json({ error: 'Forbidden: Only colleges can assign test centers' });
  }

  try {
    const authority = await CollegeExamConductingAuthority.findById(req.user.id);
    if (!authority) {
      return res.status(404).json({ error: 'College authority not found' });
    }

    const collegeId = authority.collegeId;
    const college = await College.findById(collegeId).populate({
      path: 'BookedDates.Slots.TestCenterId',
      select: 'TestCenterName Location',
    });
    if (!college) {
      return res.status(404).json({ error: 'College not found' });
    }

    const students = await Students.find({ collegeId });
    if (students.length === 0) {
      return res.status(400).json({ error: 'No students found for this college' });
    }

    const bookedSlots = college.BookedDates.flatMap((date) =>
      date.Slots.map((slot) => ({
        date: date.Date,
        slot: slot.Slot,
        seatsBooked: slot.SeatsBooked,
        testCenterId: slot.TestCenterId._id,
        testCenterName: slot.TestCenterId.TestCenterName,
        testCenterLocation: slot.TestCenterId.Location,
      }))
    );

    if (bookedSlots.length === 0) {
      return res.status(400).json({ error: 'No booked slots available for assignment' });
    }

    const totalBookedSeats = bookedSlots.reduce((sum, slot) => sum + slot.seatsBooked, 0);
    if (students.length > totalBookedSeats) {
      let remaining =  totalBookedSeats-students.length
      return res.status(400).json({
        error: `Not enough booked seats (${totalBookedSeats}) for ${students.length} students, We need  ${remaining} more seats`,
      });
    }

    // Track sequence numbers for each date-slot combination
    const sequenceTrackers = {};

    // Distribute students across slots
    const assignments = [];
    let studentIndex = 0;

    for (const slot of bookedSlots) {
      const seatsToAssign = Math.min(slot.seatsBooked, students.length - studentIndex);
      for (let i = 0; i < seatsToAssign && studentIndex < students.length; i++) {
        const student = students[studentIndex];

        // Generate regno
        const examDate = new Date(slot.date);
        const day = examDate.getDate().toString().padStart(2, '0');
        const month = (examDate.getMonth() + 1).toString().padStart(2, '0');
        const year = examDate.getFullYear().toString();
        const slotCode = slot.slot.toLowerCase() === 'morning' ? '1' : '2';

        // Initialize sequence tracker for this date-slot if not exists
        const trackerKey = `${day}${month}${year}${slotCode}`;
        if (!sequenceTrackers[trackerKey]) {
          sequenceTrackers[trackerKey] = 1; // Start from 0001
        }

        // Generate sequence number (0001 to 1600)
        const sequence = sequenceTrackers[trackerKey].toString().padStart(4, '0');
        const regno = `${day}${month}${year}${slotCode}${sequence}`;

        // Increment sequence for next student
        sequenceTrackers[trackerKey]++;
        if (sequenceTrackers[trackerKey] > 1600) {
          return res.status(400).json({
            error: `Maximum registration numbers exceeded for ${slot.date} slot ${slot.slot}`,
          });
        }

        assignments.push({
          studentId: student._id,
          collegeId,
          testCenterId: slot.testCenterId,
          examDate: slot.date,
          slot: slot.slot,
          emailStatus: 'pending', // Default to pending
          regno,
        });
        studentIndex++;
      }

      // Update test center availability
      const testCenter = await TestCenter.findById(slot.testCenterId);
      const availabilityEntry = testCenter.BookingAvailableSeats.find(
        (entry) => new Date(entry.BookingDate).toISOString() === new Date(slot.date).toISOString()
      );
      if (availabilityEntry) {
        const slotEntry = availabilityEntry.Slots.find((s) => s.Slot === slot.slot);
        if (slotEntry) {
          slotEntry.AvailableSeats = Math.max(0, slotEntry.AvailableSeats - seatsToAssign);
        }
      }
      testCenter.TotalVaccancy = Math.max(0, testCenter.TotalVaccancy - seatsToAssign);
      await testCenter.save();
    }

    // Save assignments
    await StudentAssignment.deleteMany({ collegeId });
    const insertedAssignments = await StudentAssignment.insertMany(assignments);

    host = " http://localhost:5173"
    // Send emails to students only if their email is in custom_emails
    const emailResults = [];
    for (const assignment of insertedAssignments) {
      const student = await Students.findById(assignment.studentId);
      const testCenter = await TestCenter.findById(assignment.testCenterId);

      // Check if student has an email and it's in custom_emails
      if (student.email && custom_emails.includes(student.email)) {
        // Generate hall ticket PDF
        const outputPath = path.join(__dirname, `hall-ticket-${assignment.studentId}.pdf`);
        try {
          await generateHallTicket(
            {
              first_name: student.first_name || '',
              last_name: student.last_name || '',
              email: student.email || 'N/A',
              regno: assignment.regno,
              examName: college.CollegeConductingExamName || 'N/A',
              testCenter: {
                TestCenterName: testCenter.TestCenterName || 'N/A',
                Location: testCenter.Location || 'N/A',
              },
              examDate: assignment.examDate,
              slot: assignment.slot,
            },
            outputPath
          );

          // Generate email content with Mailgen
          const emailBody = {
            body: {
              name: `${student.first_name || ''} ${student.last_name || ''}`.trim() || 'Student',
              intro:
                'Your exam test center has been assigned, and your hall ticket is attached. Please find the details below:',
              table: {
                data: [
                  {
                    'Student Name': `${student.first_name || ''} ${student.last_name || ''}`.trim() || 'N/A',
                    'Registration No': assignment.regno,
                    'Exam Name': college.CollegeConductingExamName || 'N/A',
                    'Test Center': testCenter.TestCenterName,
                    Location: testCenter.Location,
                    'Exam Date': new Date(assignment.examDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    }),
                    Slot: assignment.slot,
                  },
                ],
                columns: {
                  customWidth: {
                    'Student Name': '20%',
                    'Registration No': '15%',
                    'Exam Name': '15%',
                    'Test Center': '15%',
                    Location: '20%',
                    'Exam Date': '10%',
                    Slot: '5%',
                  },
                },
              },
              action: {
                instructions: 'Please download and bring the attached hall ticket to the examination center.',
                button: {
                  color: '#1a237e',
                  text: 'View Hall Ticket',
                  link: `${host}/student-details/${assignment.studentId}`,
                },
              },
              outro:
                'Please arrive 30 minutes early with a valid photo ID and the hall ticket. Contact us if you have any questions.',
              signature: 'Best regards',
            },
          };

          const emailTemplate = mailGenerator.generate(emailBody);
          const emailText = mailGenerator.generatePlaintext(emailBody);

          // Configure email options with PDF attachment
          const mailOptions = {
            from: `"TPVCE Test Booking Application" <${process.env.EMAIL_USER}>`,
            to: student.email,
            subject: 'Your Exam Hall Ticket and Test Center Assignment',
            text: emailText,
            html: emailTemplate,
            attachments: [
              {
                filename: 'hall-ticket.pdf',
                path: outputPath,
                contentType: 'application/pdf',
              },
            ],
          };

          // Send email
          await transporter.sendMail(mailOptions);
          assignment.emailStatus = 'sent';
          emailResults.push({
            studentId: student._id,
            emailStatus: 'sent',
          });

          // Clean up PDF file
          try {
            fs.unlinkSync(outputPath);
          } catch (cleanupErr) {
            console.warn(`Failed to delete PDF ${outputPath}:`, cleanupErr.message);
          }
        } catch (error) {
          console.error(`Failed to process hall ticket for ${student.email}:`, error);
          assignment.emailStatus = 'failed';
          emailResults.push({
            studentId: student._id,
            emailStatus: 'failed',
            error: error.message,
          });
        }
      } else {
        // Keep emailStatus as pending if email is missing or not in custom_emails
        assignment.emailStatus = 'pending';
        emailResults.push({
          studentId: student._id,
          emailStatus: 'pending',
          reason: !student.email ? 'No email address provided' : 'Email not in custom list',
        });
      }
      await assignment.save();
    }

    res.status(200).json({
      message: 'Test centers assigned and emails processed',
      assignments: insertedAssignments.map((a) => ({
        studentId: a.studentId,
        testCenterId: a.testCenterId,
        testCenterName: bookedSlots.find(
          (s) => s.testCenterId.toString() === a.testCenterId.toString()
        ).testCenterName,
        testCenterLocation: bookedSlots.find(
          (s) => s.testCenterId.toString() === a.testCenterId.toString()
        ).testCenterLocation,
        examDate: a.examDate,
        slot: a.slot,
        emailStatus: a.emailStatus,
        regno: a.regno,
      })),
      emailSummary: {
        total: emailResults.length,
        sent: emailResults.filter((r) => r.emailStatus === 'sent').length,
        failed: emailResults.filter((r) => r.emailStatus === 'failed').length,
        pending: emailResults.filter((r) => r.emailStatus === 'pending').length,
      },
    });
  } catch (err) {
    console.error('Test center assignment error:', err);
    res.status(500).json({ error: 'Failed to assign test centers' });
  }
});

app.get('/api/student-assignments', authenticateToken, async (req, res) => {
  if (req.user.role !== 'college') {
    return res.status(403).json({ error: 'Forbidden: Only colleges can view assignments' });
  }

  try {
    const authority = await CollegeExamConductingAuthority.findById(req.user.id);
    if (!authority) {
      return res.status(404).json({ error: 'College authority not found' });
    }

    const assignments = await StudentAssignment.find({ collegeId: authority.collegeId })
      .populate({
        path: 'studentId',
        select: 'first_name last_name email',
        options: { strictPopulate: false },
      })
      .populate({
        path: 'testCenterId',
        select: 'TestCenterName Location',
        options: { strictPopulate: false },
      });

    // Filter out invalid assignments and log issues
    const validAssignments = assignments.filter((assignment) => {
      if (!assignment.studentId) {
        console.warn(`Assignment ${assignment._id} has invalid studentId: ${assignment.studentId}`);
        return false;
      }
      if (!assignment.testCenterId) {
        console.warn(
          `Assignment ${assignment._id} has invalid testCenterId: ${assignment.testCenterId}`
        );
        return false;
      }
      return true;
    });

    if (validAssignments.length === 0) {
      console.log('No valid assignments found for collegeId:', authority.collegeId);
    }

    res.status(200).json(validAssignments);
  } catch (err) {
    console.error('Fetch assignments error:', err);
    res.status(500).json({ error: 'Failed to fetch assignments' });
  }
});

// New endpoint to fetch student name
app.get('/api/student/name/:id', async (req, res) => {
  try {
    const student = await Students.findById(req.params.id).select('first_name last_name');
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    const fullName = (student.first_name || '') + (student.last_name ? ` ${student.last_name}` : '') || 'Student';
    res.status(200).json({ name: fullName.trim() });
  } catch (err) {
    console.error('Fetch student name error:', err);
    res.status(500).json({ error: 'Failed to fetch student name' });
  }
});

// Existing /api/student/verify/:id endpoint
app.post('/api/student/verify/:id', async (req, res) => {
  const { dob } = req.body;
  const studentId = req.params.id;

  try {
    if (!dob) {
      return res.status(400).json({ error: 'Date of birth is required' });
    }

    const student = await Students.findById(studentId);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const inputDob = new Date(dob);
    const storedDob = student.dob ? new Date(student.dob) : null;
    const isDobMatch =
      storedDob &&
      inputDob.getFullYear() === storedDob.getFullYear() &&
      inputDob.getMonth() === storedDob.getMonth() &&
      inputDob.getDate() === storedDob.getDate();

    if (!isDobMatch) {
      return res.status(401).json({ error: 'Invalid date of birth' });
    }

    const assignment = await StudentAssignment.findOne({ studentId })
      .populate('testCenterId', 'TestCenterName Location')
      .populate('collegeId', 'CollegeConductingExamName');

    if (!assignment) {
      return res.status(404).json({ error: 'No assignment found for this student' });
    }

    const studentDetails = {
      first_name: student.first_name,
      last_name: student.last_name,
      email: student.email,
      regno: assignment.regno,
      examName: assignment.collegeId?.CollegeConductingExamName || 'N/A',
      testCenter: {
        TestCenterName: assignment.testCenterId?.TestCenterName || 'N/A',
        Location: assignment.testCenterId?.Location || 'N/A',
      },
      examDate: assignment.examDate,
      slot: assignment.slot,
    };

    res.status(200).json(studentDetails);
  } catch (err) {
    console.error('Student verification error:', err);
    res.status(500).json({ error: 'Failed to verify student details' });
  }
});

// Updated endpoint to generate and download hall ticket PDF
app.get('/api/student/hall-ticket/:id/pdf', async (req, res) => {
  try {
    const studentId = req.params.id;
    const student = await Students.findById(studentId);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    const assignment = await StudentAssignment.findOne({ studentId })
      .populate('testCenterId', 'TestCenterName Location')
      .populate('collegeId', 'CollegeConductingExamName');
    if (!assignment) {
      return res.status(404).json({ error: 'No assignment found for this student' });
    }

    const outputPath = path.join(__dirname, `hall-ticket-${studentId}.pdf`);
    await generateHallTicket(
      {
        first_name: student.first_name || '',
        last_name: student.last_name || '',
        email: student.email || 'N/A',
        regno: assignment.regno,
        examName: assignment.collegeId?.CollegeConductingExamName || 'N/A',
        testCenter: {
          TestCenterName: assignment.testCenterId?.TestCenterName || 'N/A',
          Location: assignment.testCenterId?.Location || 'N/A',
        },
        examDate: assignment.examDate,
        slot: assignment.slot,
      },
      outputPath
    );

    res.download(outputPath, 'hall-ticket.pdf', (err) => {
      if (err) {
        console.error('Download error:', err);
        res.status(500).json({ error: 'Failed to download hall ticket' });
      }
      fs.unlink(outputPath, (unlinkErr) => {
        if (unlinkErr) console.warn(`Failed to delete ${outputPath}:`, unlinkErr.message);
      });
    });
  } catch (err) {
    console.error('PDF generation error:', err);
    res.status(500).json({ error: 'Failed to generate hall ticket' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

