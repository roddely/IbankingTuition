const express = require('express');
const router = express.Router();

const studentController = require('../controllers/studentController');
const studentModle = require('../models/studentModel');
const studentModel = require('../models/studentModel');

// Test route
router.get('/test', (req, res) => {
  res.json({ message: "Student route is working!" });
});

// Get student by studentId
// router.get('/:studentId', (req, res, next) => {
//   console.log('🔍 Route matched! StuvdentId:', req.params.studentId);
//   studentController.getStudentByStudentId(req, res, next);
// });

//students/pay
router.get('/:studentId', studentController.getStudentByStudentId);

router.post('/pay', studentController.payTuition);

module.exports = router;
