
const mongoose = require('mongoose');

const ForwardedCallSchema = new mongoose.Schema({
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  technicianId: { type: mongoose.Schema.Types.ObjectId, ref: 'Technician', required: true },
  clientName: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  status: { type: String, enum: ['Pending','In Process','Completed','Closed'], default: 'Pending' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.models.ForwardedCall || mongoose.model('ForwardedCall', ForwardedCallSchema);
