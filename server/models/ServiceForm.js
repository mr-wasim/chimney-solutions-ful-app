
const mongoose = require('mongoose');

const ServiceFormSchema = new mongoose.Schema({
  technicianId: { type: mongoose.Schema.Types.ObjectId, ref: 'Technician', required: true },
  clientName: { type: String, required: true },
  clientAddress: { type: String, required: true },
  phone: { type: String, required: true },
  payment: { type: Number, default: 0 },
  status: { type: String, enum: ['Services Done','Installation Done','Complaint Done','Under Process'], default: 'Under Process' },
  clientSignature: { type: String, required: true }, // dataURL
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.models.ServiceForm || mongoose.model('ServiceForm', ServiceFormSchema);
