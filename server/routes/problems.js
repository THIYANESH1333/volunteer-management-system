const express = require('express');
const router = express.Router();
const multer = require('multer');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const ProblemReport = require('../models/ProblemReport');
const User = require('../models/User');

// Use multer memory storage for image upload
const upload = multer({ storage: multer.memoryStorage() });

// POST /api/problems - Volunteer submits a problem report with photo
router.post('/', auth, upload.single('photo'), async (req, res) => {
  try {
    const { title, description, location } = req.body;
    if (!title || !description || !location) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
    const report = new ProblemReport({
      title,
      description,
      location,
      volunteer: req.user.id
    });
    if (req.file) {
      report.photo = req.file.buffer;
      report.photoType = req.file.mimetype;
    }
    await report.save();
    res.status(201).json({ message: 'Problem reported successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// GET /api/problems - Admin views all problem reports, volunteers see their own with ?mine=1
router.get('/', auth, async (req, res) => {
  try {
    let query = {};
    if (req.user.role !== 'admin' || req.query.mine) {
      query.volunteer = req.user.id;
    }
    const reports = await ProblemReport.find(query)
      .populate('volunteer', 'name email phone')
      .sort({ createdAt: -1 });
    // Attach photoUrl for each report
    const reportsWithPhoto = reports.map(r => ({
      _id: r._id,
      title: r.title,
      description: r.description,
      location: r.location,
      createdAt: r.createdAt,
      volunteer: r.volunteer,
      photoUrl: r.photo && r.photoType ? `data:${r.photoType};base64,${r.photo.toString('base64')}` : null
    }));
    res.json(reportsWithPhoto);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// PUT /api/problems/:id - Edit a problem report (volunteer: own, admin: any)
router.put('/:id', auth, upload.single('photo'), async (req, res) => {
  try {
    const problem = await ProblemReport.findById(req.params.id);
    if (!problem) return res.status(404).json({ message: 'Problem not found.' });
    // Only admin or the reporting volunteer can edit
    if (req.user.role !== 'admin' && String(problem.volunteer) !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized.' });
    }
    const { title, description, location } = req.body;
    if (title) problem.title = title;
    if (description) problem.description = description;
    if (location) problem.location = location;
    if (req.file) {
      problem.photo = req.file.buffer;
      problem.photoType = req.file.mimetype;
    }
    await problem.save();
    res.json({ message: 'Problem updated successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// DELETE /api/problems/:id - Delete a problem report (admin only)
router.delete('/:id', auth, admin, async (req, res) => {
  try {
    const problem = await ProblemReport.findById(req.params.id);
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found.' });
    }
    
    await ProblemReport.findByIdAndDelete(req.params.id);
    res.json({ message: 'Problem deleted successfully.' });
  } catch (err) {
    console.error('Delete problem error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router; 