const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Attendance = require('../models/Attendance');

// middleware to protect routes
function auth(req, res, next) {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// mark attendance
router.post('/', auth, async (req, res) => {
  const { date, status } = req.body;
  const record = new Attendance({ user: req.user.id, date, status });
  await record.save();
  res.json(record);
});

// get all attendance for the logged user
router.get('/', auth, async (req, res) => {
  const records = await Attendance.find({ user: req.user.id });
  res.json(records);
});

module.exports = router;
