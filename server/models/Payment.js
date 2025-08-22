
const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  technicianId: { type: mongoose.Schema.Types.ObjectId, ref: 'Technician', required: true },
  recipientName: { type: String, required: true },
  mode: { type: String, enum: ['Online','Cash','Both'], required: true },
  amountOnline: { type: Number, default: 0 },
  amountCash: { type: Number, default: 0 },
  recipientSignature: { type: String, required: true },
  note: { type: String },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.models.Payment || mongoose.model('Payment', PaymentSchema);
