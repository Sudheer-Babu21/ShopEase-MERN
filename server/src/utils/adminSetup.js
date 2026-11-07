const path = require('path');
module.paths.push(path.join(__dirname, '../../node_modules'));
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../models/User');

const setupAdmin = async () => {
  const args = process.argv.slice(2);
  const name = args[0] || 'System Administrator';
  const email = (args[1] || 'admin@shoppingcart.com').toLowerCase().trim();
  const password = args[2] || 'Admin@123';
  const phone = args[3] || '9876543210';

  console.log(`[AdminSetup] Connecting to MongoDB...`);
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/shopease');

  try {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    let admin = await User.findOne({ email });
    if (admin) {
      admin.name = name;
      admin.passwordHash = passwordHash;
      admin.phone = phone;
      admin.role = 'ADMIN';
      await admin.save();
      console.log(`[AdminSetup] Successfully updated existing administrator: ${email}`);
    } else {
      admin = await User.create({
        name,
        email,
        passwordHash,
        phone,
        role: 'ADMIN',
      });
      console.log(`[AdminSetup] Successfully provisioned new administrator: ${email}`);
    }

    console.log(`[AdminSetup] Credentials configured:`);
    console.log(`  Role    : ADMIN`);
    console.log(`  Email   : ${email}`);
    console.log(`  Password: ${password}`);
  } catch (error) {
    console.error(`[AdminSetup] Failed to configure admin: ${error.message}`);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log(`[AdminSetup] Database connection closed.`);
  }
};

if (require.main === module) {
  setupAdmin();
}

module.exports = setupAdmin;
