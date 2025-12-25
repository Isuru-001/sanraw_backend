const userModel = require('../models/userModel');
const { hashPassword } = require('../utils/hash');
const crypto = require('crypto');
const { sendActivationEmail } = require('../utils/emailService');

const createUser = async (userData) => {
    const { password } = userData;
    const password_hash = await hashPassword(password);

    // Generate Activation Token
    const activation_token = crypto.randomBytes(32).toString('hex');
    const activation_expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create user with inactive status and token
    const userId = await userModel.createUser({ 
        ...userData, 
        password_hash,
        status: 'inactive',
        activation_token,
        activation_expires
    });

    try {
        // Send Email
        await sendActivationEmail(userData.email, activation_token);
    } catch (error) {
        console.error("Email sending failed:", error);
        // Rollback: Delete the user so they can try again
        await userModel.deleteUser(userId);
        throw new Error('Failed to send activation email. Please check email configuration.');
    }

    return userId;
};

const getAllUsers = async () => {
    return await userModel.getAllUsers();
};

const getUserById = async (id) => {
    return await userModel.findUserById(id);
};

const updateUser = async (id, userData) => {
    await userModel.updateUser(id, userData);
    return { message: 'User updated' };
};

const deleteUser = async (id) => {
    await userModel.deleteUser(id);
    return { message: 'User deleted' };
};

module.exports = {
    createUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    getLoginHistory: userModel.getLoginHistory,
    deleteLoginHistory: userModel.deleteLoginHistory,
    clearLoginHistory: userModel.clearLoginHistory
};
