const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { prisma } = require('../config/db');

const register = async (req, res) => {
  const { name, email, password, role, branch } = req.body;

  try {
    // 1. Validate Input
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (role === 'ADMIN') {
      return res.status(403).json({ message: 'ADMIN cannot self-register' });
    }

    // 2. Check email existence
    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Create User
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        branch: (role === 'BRANCH_MANAGER' || role === 'BRANCH_STAFF') ? branch : null
      }
    });

    const { password: _, ...userInfo } = user;
    res.status(201).json({ message: 'User registered successfully', user: userInfo });

  } catch (error) {
    console.error('Registration Error:', error.message);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Find user
    const user = await prisma.user.findUnique({ 
      where: { email }
    });

    if (!user || !user.password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // 2. Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // 3. Generate JWT
    const token = jwt.sign(
      { id: user.id, role: user.role, branch: user.branch },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // 4. Return response
    const { password: _, ...userInfo } = user;
    res.status(200).json({
      message: 'Login successful',
      token,
      user: userInfo
    });

  } catch (error) {
    console.error('Login Error:', error.message);
    res.status(500).json({ message: 'Server error during login' });
  }
};

const googleLogin = async (req, res) => {
  const { googleId, email, name } = req.body;

  try {
    let user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // Create new user for Google Sign-In
      user = await prisma.user.create({
        data: {
          email,
          name,
          googleId,
          role: 'CLIENT'
        }
      });
    } else if (!user.googleId) {
      // Link Google ID to existing email account
      user = await prisma.user.update({
        where: { id: user.id },
        data: { googleId }
      });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, branch: user.branch },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    const { password: _, ...userInfo } = user;
    res.status(200).json({
      token,
      user: userInfo
    });
  } catch (error) {
    console.error('Google Login Error:', error);
    res.status(500).json({ message: 'Google login failed' });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 3600000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry: expiry
      }
    });

    // In a real app, send an email. For now, we return the token (simulating email delivery)
    console.log(`Password reset link: http://localhost:5173/reset-password/${resetToken}`);

    res.json({ message: 'Reset link sent to email (check server logs in development)' });
  } catch (error) {
    console.error('Forgot Password Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gt: new Date() }
      }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null
      }
    });

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset Password Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { register, login, googleLogin, forgotPassword, resetPassword };
