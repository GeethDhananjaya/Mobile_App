const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto'); // Used to generate secure random reset tokens
const nodemailer = require('nodemailer'); // Used to send emails
const { OAuth2Client } = require('google-auth-library'); // Verifies Google logins
const User = require('../models/User');
const Guide = require('../models/Guide');

const router = express.Router();
const googleClient = process.env.GOOGLE_CLIENT_ID ? new OAuth2Client(process.env.GOOGLE_CLIENT_ID) : null;

// ==========================================
// 1 & 2: STANDARD REGISTER / LOGIN (Kept exactly as before)
// ==========================================
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, bio } = req.body;
    const normalizedEmail = email.trim().toLowerCase();
    let user = await User.findOne({ email: normalizedEmail });
    if (user) return res.status(400).json({ message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({ 
      name, 
      email: normalizedEmail, 
      password: hashedPassword, 
      role: role || 'traveller',
      bio: bio || '',
      isApproved: (role === 'guide') ? false : true // Guides must be approved!
    });
    await user.save();
    
    const msg = (role === 'guide') 
      ? 'Registered as guide! Your profile is pending for Admin approval.' 
      : 'User registered successfully!';
    res.status(201).json({ message: msg });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    console.log(`🔍 Attempting login for email: [${req.body.email?.trim()?.toLowerCase()}]`);
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.trim().toLowerCase() });

    if (!user) {
      return res.status(400).json({ message: 'User with this email not found' });
    }
    
    // Check if Guide is approved
    if (user.role === 'guide' && !user.isApproved) {
      return res.status(403).json({ message: 'Your guide profile is pending admin approval' });
    }

    if (!user.password) {
      return res.status(400).json({ message: 'This account uses Social Login. Please sign in with Google/Apple.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect password. Please try again.' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(200).json({ message: 'Login successful!', token, user });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ==========================================
// 3. FORGOT PASSWORD (Sends the Email)
// ==========================================
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.trim().toLowerCase() });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate a random token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Save token and expiry date (15 mins from now) to the database
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
    await user.save();

    // Set up Nodemailer to send the email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER?.trim(),
        pass: process.env.EMAIL_PASS?.replace(/\s+/g, '')
      }
    });

    const mailOptions = {
      from: `"Hidden Gems" <${process.env.EMAIL_USER?.trim()}>`,
      to: user.email,
      subject: 'Hidden Places - Password Reset Request',
      text: `You requested a password reset.\n\nYour reset token is: ${resetToken}\n\nCopy this token and paste it into the "Reset Password" screen in your app.\n\nThis token will expire in 15 minutes. If you did not request this, please ignore this email.`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 500px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #222; text-align: center;">Password Reset</h2>
          <p>We received a request to reset your password.</p>
          <p>Your password reset token is:</p>
          <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; font-size: 24px; font-weight: bold; text-align: center; margin: 20px 0; letter-spacing: 2px; color: #000;">
            ${resetToken}
          </div>
          <p>Simply copy this token and paste it into the "Reset Password" screen in the app.</p>
          <p style="color: #777; font-size: 12px; margin-top: 30px; text-align: center;">
            This token will expire in 15 minutes.<br/>If you did not request a password reset, please ignore this email.
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Password reset email sent!' });

  } catch (error) {
    console.error('Email Sending Error:', error);
    res.status(500).json({ message: 'Error sending email. Please check server logs.' });
  }
});

// ==========================================
// 4. RESET PASSWORD (Saves the new password)
// ==========================================
router.post('/reset-password/:token', async (req, res) => {
  try {
    // Find the user by the token AND make sure it hasn't expired yet
    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.password, salt);

    // Clear out the token so it can't be used again
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();
    res.status(200).json({ message: 'Password reset successful! You can now log in.' });

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ==========================================
// 5. GOOGLE LOGIN
// ==========================================
router.post('/google', async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!googleClient) {
      return res.status(501).json({ message: 'Google Authentication not configured on server' });
    }

    // Verify the token with Google
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { sub: googleId, email, name } = payload;

    // Check if user exists
    let user = await User.findOne({ email: email.trim().toLowerCase() });

    // If no user exists, create one without a password
    if (!user) {
      user = new User({ name, email: email.trim().toLowerCase(), googleId });
      await user.save();
    }

    // Log them in by giving them a JWT
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(200).json({ message: 'Google Login successful!', token, user });

  } catch (error) {
    res.status(500).json({ message: 'Google authentication failed' });
  }
});

// ==========================================
// 6. APPLE / ICLOUD LOGIN
// ==========================================
router.post('/apple', async (req, res) => {
  try {
    const { email, name, appleId } = req.body; // Expo Apple Auth will provide this

    let user = await User.findOne({ email: email.trim().toLowerCase() });

    if (!user) {
      user = new User({ name: name || 'Apple User', email: email.trim().toLowerCase(), appleId });
      await user.save();
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(200).json({ message: 'Apple Login successful!', token, user });

  } catch (error) {
    res.status(500).json({ message: 'Apple authentication failed' });
  }
});
// Import your new bouncer at the top of authRoutes.js!
const protect = require('../middleware/authMiddleware');

// ==========================================
// 7. GET USER PROFILE (Protected Route)
// ==========================================
router.get('/profile', protect, async (req, res) => {
  try {
    // req.user comes from our middleware!
    const user = await User.findById(req.user).select('-password'); // Don't send the password back!
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ==========================================
// 8. UPDATE USER PROFILE (Protected)
// ==========================================
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, password, bio, profileImageUrl } = req.body;
    const user = await User.findById(req.user);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (profileImageUrl !== undefined) user.profileImageUrl = profileImageUrl;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();
    res.status(200).json({ message: 'Profile updated successfully!', user });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
});

// ==========================================
// 8.5 UPDATE PROFILE PHOTO (Protected)
// ==========================================
const multer = require('multer');
const path = require('path');
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `profile_${req.user}_${Date.now()}${path.extname(file.originalname)}`)
});
const upload = multer({ storage });

router.post('/profile-photo', protect, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const profileImageUrl = `/uploads/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(req.user, { profileImageUrl }, { new: true }).select('-password');
    res.status(200).json({ message: 'Photo updated!', user });
  } catch (error) {
    res.status(500).json({ message: 'Error uploading photo', error: error.message });
  }
});

// ==========================================
// 9. ADMIN: GET PENDING GUIDES (Protected)
// ==========================================
router.get('/admin/guides-pending', protect, async (req, res) => {
  try {
    const adminUser = await User.findById(req.user);
    if (adminUser.role !== 'admin') return res.status(401).json({ message: 'Admin access only' });

    const pending = await User.find({ role: 'guide', isApproved: { $ne: true } }).select('-password');
    // Map to a format consistent with what ManageGuidesScreen expects if needed, 
    // but ManageGuidesScreen uses g.name, g.email, g.bio which Guide has!
    res.status(200).json(pending);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pending guides' });
  }
});

// ==========================================
// 10. ADMIN: APPROVE GUIDE (Protected)
// ==========================================
router.put('/admin/guides-approve/:id', protect, async (req, res) => {
  try {
    const adminUser = await User.findById(req.user);
    if (adminUser.role !== 'admin') return res.status(401).json({ message: 'Admin access only' });

    // 1. Approve the User account
    const user = await User.findByIdAndUpdate(req.params.id, { isApproved: true }, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // 2. Approve the Guide profile(s) for this user
    await Guide.updateMany({ creator: req.params.id }, { isApproved: true });

    // Send email to guide... (using 'user' variable now instead of 'guide')

    // Send email to guide asynchronously
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER?.trim(),
        pass: process.env.EMAIL_PASS?.replace(/\s+/g, ''),
      }
    });

    const mailOptions = {
      from: `"Hidden Gems SL" <${process.env.EMAIL_USER?.trim()}>`,
      to: user.email,
      subject: 'Welcome to the Team! Your Guide Profile is Approved 🛡',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2>Congratulations ${user.name}!</h2>
          <p>Your local guide profile for <b>Hidden Gems SL</b> has been officially approved by our admin team.</p>
          <p>You can now log in to the app and start sharing your secret discoveries and guiding travellers on their journey.</p>
          <p style="margin-top: 30px;">Happy Exploring,<br/>The Hidden Gems Team</p>
        </div>
      `,
    };

    transporter.sendMail(mailOptions).catch(err => console.error('Email Notification Error:', err));
    
    res.status(200).json({ message: 'Guide approved successfully!', user });
  } catch (error) {
    console.error('Approval Error:', error);
    res.status(500).json({ message: 'Approval process failed' });
  }
});

// ==========================================
// 11. ADMIN: REJECT / DELETE PENDING GUIDE (Protected)
// ==========================================
router.delete('/admin/guides-reject/:id', protect, async (req, res) => {
  try {
    const adminUser = await User.findById(req.user);
    if (adminUser.role !== 'admin') return res.status(401).json({ message: 'Admin access only' });

    // Also delete any pending guide profiles for this user
    await Guide.deleteMany({ creator: req.params.id });
    
    res.status(200).json({ message: 'Guide application rejected and deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Rejection failed' });
  }
});

module.exports = router;