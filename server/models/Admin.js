
const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  passwordHash: { type: String, required: true }
});

module.exports = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);
