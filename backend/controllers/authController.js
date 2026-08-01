const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const userModel = require('../models/userModel');
const { JWT_SECRET } = require('../middleware/authMiddleware');

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';

function getGoogleRedirectUri(req) {
  const host = req.get('host');
  const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
  return process.env.GOOGLE_REDIRECT_URI || `${protocol}://${host}/api/auth/google/callback`;
}

function getFrontendUrl(req) {
  const host = req.get('host');
  if (host.includes('localhost') || host.includes('127.0.0.1')) {
    return 'http://localhost:3000';
  }
  return process.env.FRONTEND_URL || 'https://paste-bin-chi.vercel.app';
}

async function initiateGoogleAuth(req, res) {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    const frontendUrl = getFrontendUrl(req);
    return res.redirect(`${frontendUrl}/login.html?error=${encodeURIComponent('Google OAuth credentials not configured on backend. Please add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to environment variables.')}`);
  }

  const redirectUri = getGoogleRedirectUri(req);
  const oauth2Client = new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, redirectUri);

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email'
    ],
    prompt: 'select_account' // Forces Google Account Picker
  });

  res.redirect(authUrl);
}

async function handleGoogleCallback(req, res, next) {
  const { code, error } = req.query;
  const frontendUrl = getFrontendUrl(req);

  if (error) {
    return res.redirect(`${frontendUrl}/login.html?error=${encodeURIComponent('Google Authentication was cancelled.')}`);
  }

  if (!code) {
    return res.redirect(`${frontendUrl}/login.html?error=${encodeURIComponent('Missing authorization code from Google.')}`);
  }

  try {
    const redirectUri = getGoogleRedirectUri(req);
    const oauth2Client = new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, redirectUri);

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Fetch Google user profile
    const oauth2 = oauth2Client.getAccessToken();
    const userinfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` }
    });
    const googleUser = await userinfoResponse.json();

    if (!googleUser || !googleUser.email) {
      return res.redirect(`${frontendUrl}/login.html?error=${encodeURIComponent('Failed to fetch Google profile email.')}`);
    }

    const { id: googleId, email, name, picture } = googleUser;

    // Check if user exists by google_id or email
    let user = await userModel.findUserByGoogleId(googleId);
    if (!user) {
      user = await userModel.findUserByEmail(email);
    }

    if (user) {
      // Existing user: Update google_id & profile_image if missing
      await userModel.updateGoogleDetails(user.id, { googleId, profileImage: picture });
    } else {
      // First-time Google user: Auto-create account in Railway MySQL
      let baseUsername = email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '');
      let username = baseUsername;
      let counter = 1;
      while (await userModel.findUserByUsername(username)) {
        username = `${baseUsername}_${counter}`;
        counter++;
      }

      user = await userModel.createGoogleUser({
        fullName: name || username,
        username,
        email,
        googleId,
        profileImage: picture
      });
    }

    const jwtToken = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    const userPayload = {
      id: user.id,
      full_name: user.full_name || user.username,
      username: user.username,
      email: user.email,
      profile_image: user.profile_image || picture || null,
      auth_provider: 'google'
    };

    res.redirect(`${frontendUrl}/index.html?auth_token=${encodeURIComponent(jwtToken)}&auth_user=${encodeURIComponent(JSON.stringify(userPayload))}`);
  } catch (err) {
    console.error('Google Callback Error:', err);
    res.redirect(`${frontendUrl}/login.html?error=${encodeURIComponent(err.message || 'Google authentication failed.')}`);
  }
}

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
    if (!passwordField) {
      return res.status(400).json({ success: false, message: 'This account uses Google Sign-In. Please click "Continue with Google".' });
    }

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
          email: user.email,
          profile_image: user.profile_image || null,
          auth_provider: user.auth_provider || 'local'
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
  initiateGoogleAuth,
  handleGoogleCallback,
  register,
  login,
  getProfile,
  logout
};
