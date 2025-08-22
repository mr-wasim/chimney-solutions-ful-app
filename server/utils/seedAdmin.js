
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');

async function seedAdmin() {
  const username = process.env.ADMIN_USERNAME || 'admin';
  const plain = process.env.ADMIN_PASSWORD || 'Chimneysolution@123#';
  let admin = await Admin.findOne({ username });
  if (!admin) {
    const hash = await bcrypt.hash(plain, 10);
    admin = await Admin.create({ username, passwordHash: hash });
    console.log('Admin user created:', username);
  }
}

module.exports = seedAdmin;
