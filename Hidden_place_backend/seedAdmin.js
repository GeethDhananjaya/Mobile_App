const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User'); // Make sure paths match your structure!
const dotenv = require('dotenv');

dotenv.config();

const seed = async () => {
  try {
    // 1. Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for Seeding...");

    // 2. Check if the Master Admin already exists
    const existing = await User.findOne({ email: 'admin@hiddengems.com' });
    if (existing) {
      console.log("⚠️  Admin already exists! You can skip this script.");
      process.exit(0);
    }

    // 3. Create the New Master Admin
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    const admin = new User({
      name: "Platform Master Admin",
      email: "admin@hiddengems.com",
      password: hashedPassword,
      role: "admin",
      isApproved: true,
      bio: "Master administrator for Hidden Gems SL platform."
    });

    // 4. Save and Finish
    await admin.save();
    console.log("✅ SUCCESS! Master Admin Created:");
    console.log("   📧 Email: admin@hiddengems.com");
    console.log("   🔑 Password: admin123");
    console.log("-----------------------------------------");
    process.exit(0);

  } catch (error) {
    console.error("❌ Seeding Failed:", error.message);
    process.exit(1);
  }
};

seed();
