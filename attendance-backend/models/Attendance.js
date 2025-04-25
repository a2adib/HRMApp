// models/Attendance.js
const mongoose = require('mongoose');
const AttendanceSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  status: { type: String, enum: ['present','absent','leave'], default: 'present' }
});
module.exports = mongoose.model('Attendance', AttendanceSchema);
