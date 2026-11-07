const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { generateToken, setTokenCookie, clearTokenCookie } = require('../utils/token');
const { validateRegisterInput, validateLoginInput } = require('../validators/inputValidators');

// @desc    Register a new customer account
// @route   POST /api/v1/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, password, confirmPassword, phone } = req.body;

    const validation = validateRegisterInput({ name, email, password, confirmPassword, phone });
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: validation.errors[0],
        errors: validation.errors,
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: `An account with email '${normalizedEmail}' already exists. Please sign in or use another email.`,
      });
    }

    // Hash password with 10 salt rounds (matching Java BCrypt log rounds = 10)
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Hardcode role to CUSTOMER for public self-registration to prevent privilege escalation
    const newUser = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      phone: phone ? phone.trim() : '',
      role: 'CUSTOMER',
    });

    const token = generateToken(newUser);
    setTokenCookie(res, token);

    res.status(201).json({
      success: true,
      message: 'Registration successful! Your account has been created.',
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        createdAt: newUser.createdAt,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate customer or admin and return session
// @route   POST /api/v1/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const validation = validateLoginInput({ email, password });
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: validation.errors[0],
        errors: validation.errors,
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail }).select('+passwordHash');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email address or password. Please verify your credentials.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email address or password. Please verify your credentials.',
      });
    }

    const token = generateToken(user);
    setTokenCookie(res, token);

    res.status(200).json({
      success: true,
      message: 'Signed in successfully!',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Sign out current user and clear authentication cookie
// @route   POST /api/v1/auth/logout
// @access  Public
const logout = async (req, res) => {
  clearTokenCookie(res);
  res.status(200).json({
    success: true,
    message: 'Signed out successfully.',
  });
};

// @desc    Get currently authenticated user
// @route   GET /api/v1/auth/me
// @access  Private
const getCurrentUser = async (req, res) => {
  res.status(200).json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      phone: req.user.phone,
      role: req.user.role,
      createdAt: req.user.createdAt,
    },
  });
};

module.exports = {
  register,
  login,
  logout,
  getCurrentUser,
};
