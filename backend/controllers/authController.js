const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const userExists = await User.findOne({ email });
        
        if (userExists) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const user = await User.create({ 
            name, 
            email, 
            password
        });

        const token = jwt.sign({ id: user._id, tokenVersion: user.tokenVersion || 0 }, process.env.JWT_SECRET, { expiresIn: '30d' });

        res.status(201).json({ 
            message: 'User registered successfully',
            _id: user._id,
            name: user.name,
            email: user.email,
            token
        });
    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        if (await user.comparePassword(password)) {
            user.lastLogin = Date.now();
            await user.save({ validateBeforeSave: false });

            const token = jwt.sign({ id: user._id, tokenVersion: user.tokenVersion || 0 }, process.env.JWT_SECRET, { expiresIn: '30d' });
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                token,
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: error.message });
    }
};

