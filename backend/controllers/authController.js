const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const { JWT_SECRET } = require('../middleware/authMiddleware');

async function register(req, res, next) {
  try {
    const { full_name, username, email, password, confirm_password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: 'Username, email, and password are required.' });
    }

    if (confirm_password && password !== confirm_password) {
      return res.status(400).json({ success: false, message: 'Passwords do not match. Please verify your password confirmation.' });
    }

    if (username.trim().length < 3) {
      return res.status(400).json({ success: false, message: 'Username must be at least 3 characters long.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
    }

    const existingEmail = await userModel.findUserByEmail(email);
    if (existingEmail) {
      return res.status(409).json({ success: false, message: 'An account with this email address already exists.' });
    }

    const existingUsername = await userModel.findUserByUsername(username);
    if (existingUsername) {
      return res.status(409).json({ success: false, message: 'This username is already taken. Please choose another.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await userModel.createUser({
      fullName: full_name || null,
      username: username.trim(),
      email: email.trim(),
      password: passwordHash
    });

    const token = jwt.sign(
      { id: newUser.id, username: newUser.username, email: newUser.email },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      data: {
        token,
        user: {
          id: newUser.id,
          full_name: newUser.full_name,
          username: newUser.username,
          email: newUser.email
        }
      }
    });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const { emailOrUsername, email, username, password, remember_me } = req.body;
    const identity = emailOrUsername || email || username;

    if (!identity || !password) {
      return res.status(400).json({ success: false, message: 'Please provide your email/username and password.' });
    }

    let user = await userModel.findUserByEmail(identity);
    if (!user) {
      user = await userModel.findUserByUsername(identity);
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. Account not found.' });
    }

    const passwordField = user.password || user.password_hash;
    const isMatch = await bcrypt.compare(password, passwordField);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid password. Please try again.' });
    }

    const expiresIn = remember_me ? '30d' : '7d';
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      JWT_SECRET,
      { expiresIn }
    );

    res.status(200).json({
      success: true,
      message: 'Signed in successfully!',
      data: {
        token,
        user: {
          id: user.id,
          full_name: user.full_name,
          username: user.username,
          email: user.email
        }
      }
    });
  } catch (error) {
    next(error);
  }
}

async function getProfile(req, res, next) {
  try {
    const user = await userModel.findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User profile not found.' });
    }
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
}

async function logout(req, res) {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully.'
  });
}

module.exports = {
  register,
  login,
  getProfile,
  logout
};
