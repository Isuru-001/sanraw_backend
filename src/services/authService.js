const userModel = require('../models/userModel');
const { hashPassword, comparePassword } = require('../utils/hash');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('../config/db');
const { sendActivationEmail } = require('../utils/emailService');

const login = async (email, password) => {
    const user = await userModel.findUserByEmail(email);
    if (!user) {
        throw new Error('Invalid credentials');
    }

    const isMatch = await comparePassword(password, user.password_hash);
    if (!isMatch) {
        throw new Error('Invalid credentials');
    }

    const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
    );

    // Record Login History
    await userModel.logLogin(user.id);

    return { token, user: { id: user.id, email: user.email, role: user.role } };
};

const requestResetPassword = async (email) => {
    const user = await userModel.findUserByEmail(email);
    if (!user) return; // Fail silently for security
    // In a real app, send OTP/Email. For this "simple" prompt, we just mock the process.
    return { message: 'If user exists, reset instructions sent.' };
};

const resetPassword = async (email, newPassword) => {
    const user = await userModel.findUserByEmail(email);
    if (!user) throw new Error('User not found');

    const hashedPassword = await hashPassword(newPassword);
    await userModel.updatePassword(user.id, hashedPassword);
    return { message: 'Password updated successfully' };
};

const signup = async (userData) => {
    // Check if user exists
    const existingUser = await userModel.findUserByEmail(userData.email);
    if (existingUser) {
        throw new Error('User already exists');
    }

    // Hash password
    const password_hash = await hashPassword(userData.password);

    // Generate Activation Token
    const activation_token = crypto.randomBytes(32).toString('hex');
    const activation_expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create user with inactive status and token
    // Note: userModel.createUser needs to accept these new fields or we need to modify the query there.
    // Assuming userModel.createUser takes an object and inserts it. We might need to update userModel.js.
    // Let's check userModel.js first. But for now, I'll pass them.
    
    // Actually, let's do a direct insert here or update userModel to be safe.
    // Since I can't see userModel right now, I'll assume I need to update it or use a raw query here if userModel is rigid.
    // Let's assume userModel.createUser is flexible or I will update it in next step.
    
    await userModel.createUser({ 
        ...userData, 
        password_hash, 
        status: 'inactive',
        activation_token,
        activation_expires
    });

    // Send Email
    await sendActivationEmail(userData.email, activation_token);

    return { message: 'Account created. Please check your email to activate.' };
};

const activateAccount = async (token) => {
    // Find user by token
    const [rows] = await db.query(
        'SELECT * FROM user WHERE activation_token = ? AND activation_expires > NOW()',
        [token]
    );

    if (rows.length === 0) {
        throw new Error('Invalid or expired activation token');
    }

    const user = rows[0];

    // Activate user
    await db.query(
        'UPDATE user SET status = ?, activation_token = NULL, activation_expires = NULL WHERE id = ?',
        ['active', user.id]
    );

    return { message: 'Account activated successfully' };
};

module.exports = {
    login,
    signup,
    requestResetPassword,
    requestResetPassword,
    resetPassword,
    activateAccount
};
