const express = require('express');
const Registration = require('../models/Registration');
const Event = require('../models/Event');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const router = express.Router();

// DELETE /api/registrations/admin/:id - Admin can delete a registration by its _id
// This route must come BEFORE the /:eventId route to avoid conflicts
router.delete('/admin/:id', auth, admin, async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id);
    if (!registration) {
      console.error('Registration not found for id:', req.params.id);
      return res.status(404).json({ msg: 'Registration not found' });
    }
    // Log event reference
    console.log('Deleting registration:', registration);
    const event = await Event.findById(registration.event);
    if (event) {
      await Event.findByIdAndUpdate(registration.event, { $inc: { currentVolunteers: -1 } });
    } else {
      console.error('Event not found for registration:', registration.event);
    }
    await Registration.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Registration deleted' });
  } catch (err) {
    console.error('Delete registration error:', err);
    res.status(500).send('Server Error');
  }
});

// Register for an event
router.post('/:eventId', auth, async (req, res) => {
    try {
        // Defensive: Check for valid eventId
        if (!req.params.eventId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ msg: 'Invalid event ID' });
        }
        // Find the event
        const event = await Event.findById(req.params.eventId);
        if (!event) {
            return res.status(404).json({ msg: 'Event not found' });
        }
        // Check if event is full
        if (event.currentVolunteers >= event.maxVolunteers) {
            return res.status(400).json({ msg: 'Event is full' });
        }
        // Check if user is already registered
        let registration = await Registration.findOne({ event: req.params.eventId, volunteer: req.user.id });
        if (registration) {
            return res.status(400).json({ msg: 'User already registered for this event' });
        }
        // Register the user
        registration = new Registration({
            event: req.params.eventId,
            volunteer: req.user.id
        });
        await registration.save();
        // Increment event's currentVolunteers
        event.currentVolunteers += 1;
        await event.save();
        res.json(registration);
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ msg: 'Server Error', error: err.message, stack: err.stack });
    }
});

// Debug route to check registrations (remove in production)
router.get('/debug/:eventId', auth, async (req, res) => {
    try {
        const registrations = await Registration.find({ event: req.params.eventId });
        const userRegistration = await Registration.findOne({ 
            event: req.params.eventId, 
            volunteer: req.user.id 
        });
        res.json({
            allRegistrations: registrations,
            userRegistration: userRegistration,
            userId: req.user.id,
            eventId: req.params.eventId
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// @route   DELETE api/registrations/:eventId
// @desc    Unregister from an event
// @access  Private
router.delete('/:eventId', auth, async (req, res) => {
    try {
        console.log('Unregister attempt:', { eventId: req.params.eventId, userId: req.user.id });
        
        // Check if eventId is valid
        if (!req.params.eventId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ msg: 'Invalid event ID' });
        }
        
        // Check if event exists
        const event = await Event.findById(req.params.eventId);
        if (!event) {
            console.log('Event not found:', req.params.eventId);
            return res.status(404).json({ msg: 'Event not found' });
        }
        
        const registration = await Registration.findOne({ event: req.params.eventId, volunteer: req.user.id });
        console.log('Found registration:', registration);
        
        if (!registration) {
            console.log('Registration not found for unregister:', { eventId: req.params.eventId, userId: req.user.id });
            return res.status(404).json({ msg: 'You are not registered for this event' });
        }
        
        // Decrement event's currentVolunteers
        if (event) {
            await Event.findByIdAndUpdate(req.params.eventId, { $inc: { currentVolunteers: -1 } });
        }
        
        await Registration.findByIdAndDelete(registration._id);
        console.log('Successfully unregistered:', { eventId: req.params.eventId, userId: req.user.id });
        res.json({ msg: 'Successfully unregistered from event' });
    } catch (err) {
        console.error('Unregister error:', err.message, err.stack);
        res.status(500).json({ msg: 'Failed to unregister from event', error: err.message });
    }
});

// @route   GET api/registrations
// @desc    Get all registrations for a user
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const registrations = await Registration.find({ volunteer: req.user.id }).populate('event');
        res.json(registrations);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get event registrations (admin only)
router.get('/event/:eventId', auth, admin, async (req, res) => {
  try {
    const registrations = await Registration.find({ event: req.params.eventId })
      .populate('volunteer', 'name email phone')
      .sort({ registeredAt: -1 });
    
    res.json(registrations);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Mark attendance (admin only)
router.put('/:id/attendance', auth, admin, async (req, res) => {
  try {
    const { status } = req.body;
    
    const registration = await Registration.findByIdAndUpdate(
      req.params.id,
      { 
        status,
        attendedAt: status === 'attended' ? new Date() : null
      },
      { new: true }
    );

    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    res.json(registration);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PUT /api/registrations/:id - Admin can edit registration details
router.put('/:id', auth, admin, async (req, res) => {
  try {
    const { status, attendedAt } = req.body;
    const update = {};
    if (status) update.status = status;
    if (attendedAt) update.attendedAt = attendedAt;
    const registration = await Registration.findByIdAndUpdate(
      req.params.id,
      { $set: update },
      { new: true }
    ).populate('event').populate('volunteer', 'name email phone');
    if (!registration) return res.status(404).json({ message: 'Registration not found' });
    res.json(registration);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/registrations/all
// @desc    Get all registrations (for admin)
// @access  Private (Admin)
router.get('/all', [auth, admin], async (req, res) => {
    try {
        const registrations = await Registration.find()
            .populate('event', ['title', 'date'])
            .populate('volunteer', ['name', 'email', 'phone']);
        res.json(registrations);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router; 