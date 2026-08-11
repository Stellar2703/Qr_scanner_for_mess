const https = require('https');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_qr_attendance_key_2026';

function verifyGoogleIdToken(idToken) {
  return new Promise((resolve, reject) => {
    const url = `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`;
    https.get(url, (res) => {
      let rawData = '';
      res.on('data', (chunk) => { rawData += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(rawData);
          if (res.statusCode === 200 && parsed.email) {
            resolve(parsed);
          } else {
            reject(new Error(parsed.error_description || parsed.error || 'Invalid Google token'));
          }
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

// Student Google OAuth Login
async function googleLogin(req, res) {
  try {
    const { credential, email: manualEmail } = req.body;
    let targetEmail = null;

    if (credential) {
      try {
        const payload = await verifyGoogleIdToken(credential);
        targetEmail = payload.email;
      } catch (tokenErr) {
        console.error('Google ID token verification failed:', tokenErr.message);
        return res.status(401).json({
          success: false,
          message: 'Google OAuth verification failed: ' + tokenErr.message
        });
      }
    } else if (manualEmail) {
      targetEmail = manualEmail;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Google OAuth credential token or student email is required.'
      });
    }

    if (!targetEmail) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Google account email.'
      });
    }

    // Lookup user in DB by email
    const user = await db.getUserByEmail(targetEmail);

    if (!user) {
      return res.status(403).json({
        success: false,
        message: `Access denied. The email address (${targetEmail}) is not registered in the system.`
      });
    }

    const { expectedRole } = req.body;
    if (expectedRole && user.role !== expectedRole) {
      return res.status(403).json({
        success: false,
        message: `Access denied. ${targetEmail} is registered as ${user.role}, not ${expectedRole}.`
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        roll_no: user.roll_no,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        permanent_qr_token: user.permanent_qr_token
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: `${user.role === 'admin' ? 'Admin' : 'Student'} Google OAuth login successful`,
      token,
      user: userWithoutPassword
    });
  } catch (err) {
    console.error('Google OAuth Login error:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error during Google OAuth login.'
    });
  }
}

// Password Login (Used for Admin)
async function login(req, res) {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ success: false, message: 'Email/Username and password are required.' });
    }

    let user = await db.getUserByEmail(identifier);
    if (!user) {
      user = await db.getUserByRollNo(identifier);
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. User not found.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. Incorrect password.' });
    }

    const token = jwt.sign(
      {
        id: user.id,
        roll_no: user.roll_no,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        permanent_qr_token: user.permanent_qr_token
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: userWithoutPassword
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Internal server error during login.' });
  }
}

async function getCurrentUser(req, res) {
  try {
    const user = await db.getUserByRollNo(req.user.roll_no);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    const { password, ...userWithoutPassword } = user;
    res.json({
      success: true,
      user: userWithoutPassword
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error retrieving user session.' });
  }
}

module.exports = {
  login,
  googleLogin,
  getCurrentUser
};
