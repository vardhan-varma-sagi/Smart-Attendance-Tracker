const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

const registerUser = async (req, res) => {
    const { name, email, password, role } = req.body;

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Upload Face Images to Cloudinary
        let faceImageUrls = [];
        if (req.body.faceImages && req.body.faceImages.length > 0) {
            console.log(`Received ${req.body.faceImages.length} face images for registration.`);
            const cloudinary = require('../config/cloudinary');

            // Process uploads concurrently
            const uploadPromises = req.body.faceImages.map((image, index) => {
                console.log(`Uploading image ${index + 1}... Size: ~${Math.round(image.length / 1024)}KB`);
                return cloudinary.uploader.upload(image, {
                    folder: 'user_faces',
                }).catch(err => {
                    console.error(`Failed to upload image ${index + 1}:`, err.message);
                    throw new Error(`Failed to upload image ${index + 1}: ${err.message}`);
                });
            });

            try {
                const uploadResults = await Promise.all(uploadPromises);
                console.log("All images uploaded successfully to Cloudinary.");
                faceImageUrls = uploadResults.map(result => result.secure_url);
            } catch (uploadErr) {
                console.error("Cloudinary Upload Error:", uploadErr);
                return res.status(500).json({ message: "Image upload failed. " + uploadErr.message });
            }
        } else {
            console.log("No face images provided for registration.");
        }

        const user = await User.create({
            name,
            email,
            password,
            role: role || 'student', // Default to student if not specified
            phone: req.body.phone || '',
            faceImages: faceImageUrls // Save Cloudinary URLs
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error("Registration Error:", error);
        res.status(500).json({ message: error.message || 'Registration failed' });
    }
};

const loginUser = async (req, res) => {
    const { email, password, identifier } = req.body;

    try {
        // Allow login with email, rollNo, or phone
        // If 'email' is passed (legacy), use it. If 'identifier' is passed (new frontend), use it.
        const loginIdentifier = identifier || email;
        console.log("Login Attempt:", loginIdentifier);

        const user = await User.findOne({
            $or: [
                { email: loginIdentifier },
                { rollNo: loginIdentifier },
                { phone: loginIdentifier }
            ]
        });

        if (!user) {
            console.log("User not found for identifier:", loginIdentifier);
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await user.matchPassword(password);
        console.log("User found:", user.email, "| Password match:", isMatch);
        console.log("User Role in DB:", user.role);

        if (isMatch) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');

// @desc    Forgot Password
// @route   POST /api/auth/forgotpassword
// @access  Public
const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found with this email' });
        }

        // Get reset token
        const resetToken = user.getResetPasswordToken();

        await user.save({ validateBeforeSave: false });

        // Create reset url
        // In local dev, logic might differ from prod. Assuming frontend is on port 3000 (React default) or 5173 (Vite).
        // Let's assume standard local setup or use Referer.
        // The user didn't specify frontend URL, I'll guess localhost:5173 for Vite or 3000 for CRA.
        // I'll use req.protocol and host, but targeting frontend port.
        // Ideally ENV var FRONTEND_URL.
        const resetUrl = `http://localhost:5173/resetpassword/${resetToken}`;

        const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

        try {
            await sendEmail({
                email: user.email,
                subject: 'Password Reset Token',
                message,
            });

            res.status(200).json({ success: true, data: 'Email sent' });
        } catch (err) {
            console.log(err);
            console.log("DEV MODE ONLY: Reset Link (since email failed):", resetUrl);

            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;

            await user.save({ validateBeforeSave: false });

            // return res.status(500).json({ message: 'Email could not be sent' });
            // For checking purpose only, normally we wouldn't return this.
            return res.status(500).json({ message: 'Email failed (check console for link)' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Reset Password
// @route   PUT /api/auth/resetpassword/:resetToken
// @access  Public
const resetPassword = async (req, res) => {
    try {
        // Get hashed token
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(req.params.resetToken)
            .digest('hex');

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid token' });
        }

        // Set new password
        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        res.status(200).json({
            success: true,
            data: 'Password updated success',
            token: generateToken(user._id),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password'); // Exclude password
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { registerUser, loginUser, forgotPassword, resetPassword, getMe };

