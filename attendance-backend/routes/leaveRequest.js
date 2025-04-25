const express = require('express');
const router = express.Router();
const LeaveRequest = require('../models/LeaveRequest');
const jwt = require('jsonwebtoken');
const Joi = require('joi');

// Middleware for authentication
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

// Define Joi validation schema for leave request
const leaveRequestSchema = Joi.object({
  startDate: Joi.date().required(),
  endDate: Joi.date().greater(Joi.ref('startDate')).required(),
  reason: Joi.string().min(5).required(),
});

// Create a leave request
router.post('/', auth, async (req, res) => {
  const { error } = leaveRequestSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const { startDate, endDate, reason } = req.body;
  const leaveRequest = new LeaveRequest({
    user: req.user.id,
    startDate,
    endDate,
    reason
  });

  await leaveRequest.save();
  res.json(leaveRequest);
});

module.exports = router;
