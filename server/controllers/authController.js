const User = require('../models/User');
const jwt = require('jsonwebtoken');
const logActivity = require('../utils/activityLogger');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '7d',
    });
};

exports.signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please fill all fields' });
        }

        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        const user = await User.create({ name, email, password });

        const token = generateToken(user._id);

        res.status(201).json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (err) {
        console.error('SIGNUP ERROR:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Please fill all fields' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = generateToken(user._id);

        await logActivity({
            userId: user._id,
            action: 'user_login',
            entityType: 'user',
            entityId: user._id,
            description: `${user.name} logged in`,
        });

        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (err) {
        console.error('LOGIN ERROR:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.getMe = async (req, res) => {
    try {
        res.json({ user: req.user });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.logout = (req, res) => {
    res.json({ message: 'Logged out successfully' });
};