const User = require('../models/User');

// GET /api/users/profile
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        
        res.json({
            user,
            dashboard: {
                message: "Dashboard features will be available in v2.0"
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// PUT /api/users/profile
exports.updateProfile = async (req, res) => {
    try {
        const { name, email, phone, profilePicture, notificationPreferences } = req.body;
        
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (name) user.name = name;
        if (email) user.email = email;
        if (phone !== undefined) user.phone = phone;
        if (profilePicture !== undefined) user.profilePicture = profilePicture;
        if (notificationPreferences) {
            user.notificationPreferences = {
                ...user.notificationPreferences,
                ...notificationPreferences
            };
        }

        await user.save();
        res.json({ message: 'Profile updated successfully', user: await User.findById(req.user.id).select('-password') });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// PUT /api/users/change-password
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) return res.status(404).json({ message: 'User not found' });

        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) return res.status(400).json({ message: 'Invalid current password' });

        // Strict password validation
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(newPassword)) {
            return res.status(400).json({ 
                message: 'Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character.' 
            });
        }

        user.password = newPassword;
        await user.save();

        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// POST /api/users/logout-all
exports.logoutAll = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.tokenVersion += 1;
        await user.save();

        res.json({ message: 'Logged out from all devices successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// DELETE /api/users/account
exports.deleteAccount = async (req, res) => {
    try {
        const { currentPassword } = req.body;
        if (!currentPassword) return res.status(400).json({ message: 'Current password is required to delete your account.' });

        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) return res.status(400).json({ message: 'Invalid password. Account deletion failed.' });
        
        await User.findByIdAndDelete(req.user.id);
        res.json({ message: 'Account deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
