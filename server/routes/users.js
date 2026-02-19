const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Get all users (admin only)
router.get('/', [auth, admin], async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Create a new user (admin only)
router.post('/', [auth, admin], async (req, res) => {
    try {
        const { name, email, password, role, phone } = req.body;
        if (!name || !email || !password || !role || !phone) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }
        user = new User({ name, email, password: await bcrypt.hash(password, 8), role, phone });
        await user.save();
        res.status(201).json({ id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Update current user's profile (self-update, not admin-only)
router.put('/me', auth, upload.single('profilePic'), async (req, res) => {
    try {
        const { name, email, phone } = req.body;
        
        // Validate required fields
        if (!name || !email || !phone) {
            return res.status(400).json({ message: 'Name, email, and phone are required' });
        }

        // Check if email is already taken by another user
        const existingUserWithEmail = await User.findOne({ email, _id: { $ne: req.user.id } });
        if (existingUserWithEmail) {
            return res.status(400).json({ message: 'That email is already in use by another user' });
        }

        // Check if phone is already taken by another user
        const existingUserWithPhone = await User.findOne({ phone, _id: { $ne: req.user.id } });
        if (existingUserWithPhone) {
            return res.status(400).json({ message: 'That phone number is already in use by another user' });
        }

        const update = { name, email, phone };
        if (req.file) {
            update.profilePic = req.file.buffer;
            update.profilePicType = req.file.mimetype;
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { $set: update },
            { new: true, runValidators: false } // Disable validators since we manually checked uniqueness
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            ...updatedUser.toObject(),
            profilePicUrl: updatedUser.profilePic && updatedUser.profilePicType
                ? `data:${updatedUser.profilePicType};base64,${updatedUser.profilePic.toString('base64')}`
                : null
        });
    } catch (err) {
        console.error('Profile update error:', err.message);
        if (err.name === 'ValidationError') {
            const errors = Object.values(err.errors).map(error => error.message);
            return res.status(400).json({ message: errors.join(', ') });
        }
        if (err.code === 11000) {
            // Duplicate key error (unique constraint)
            const field = Object.keys(err.keyPattern)[0];
            return res.status(400).json({ message: `That ${field} is already in use by another user.` });
        }
        console.error(err.message);
        res.status(500).json({ message: 'Server Error - Failed to update profile' });
    }
});

// Update GET /users/me to return profilePicUrl
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json({
            ...user.toObject(),
            profilePicUrl: user.profilePic && user.profilePicType
                ? `data:${user.profilePicType};base64,${user.profilePic.toString('base64')}`
                : null
        });
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch profile.' });
    }
});

// Update a user (admin only)
router.put('/:id', [auth, admin], async (req, res) => {
    try {
        const { name, email, password, role, phone } = req.body;
        const update = { name, email, role, phone };
        if (password) {
            update.password = await bcrypt.hash(password, 8);
        }
        const user = await User.findByIdAndUpdate(req.params.id, { $set: update }, { new: true }).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Delete a user (admin only)
router.delete('/:id', [auth, admin], async (req, res) => {
    try {
        const user = await User.safeDeleteById(req.params.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.json({ msg: 'User removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router; 