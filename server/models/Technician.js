
const mongoose = require('mongoose');

const TechnicianSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  lastNotificationCheck: { type: Date, default: new Date(0) }
});

module.exports = mongoose.models.Technician || mongoose.model('Technician', TechnicianSchema);
