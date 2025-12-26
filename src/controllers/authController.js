const authService = require('../services/authService');

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password required' });
        }
        const result = await authService.login(email, password);
        res.json(result);
    } catch (err) {
        res.status(401).json({ message: err.message });
    }
};

const requestResetPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const result = await authService.requestResetPassword(email);
        res.json(result);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const verifyOTP = async (req, res) => {
    // Mock OTP verification
    res.json({ message: 'OTP Verified' });
};

const activateAccount = async (req, res) => {
    try {
        const { token } = req.params;
        const result = await authService.activateAccount(token);
        res.json(result);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        if (!token || !newPassword) {
            return res.status(400).json({ message: 'Token and new password required' });
        }
        await authService.resetPassword(token, newPassword);
        res.json({ message: 'Password reset successful' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const signup = async (req, res) => {
    try {
        const { first_name, last_name, email, password, confirmPassword } = req.body;

        if (!first_name || !last_name || !email || !password || !confirmPassword) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }

        await authService.signup({ first_name, last_name, email, password, role: 'employee' });
        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const logout = async (req, res) => {
    try {
        // req.user should be populated by authMiddleware for authenticated routes
        if (req.user && req.user.id) {
            const userModel = require('../models/userModel'); // Lazy import to avoid circular dependency issues if any
            await userModel.logLogout(req.user.id);
        }
        res.json({ message: 'Logged out successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error logging out' });
    }
};

const changePassword = async (req, res) => {
    try {
        const { email, currentPassword, newPassword } = req.body;
        if (!email || !currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Email, current password, and new password are required' });
        }
        await authService.changePassword(email, currentPassword, newPassword);
        res.json({ message: 'Password changed successfully' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

module.exports = {
    login,
    signup,
    requestResetPassword,
    verifyOTP,
    verifyOTP,
    activateAccount,
    resetPassword,
    changePassword,
    logout
};
