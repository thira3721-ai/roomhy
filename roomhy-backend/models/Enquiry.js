const mongoose = require('mongoose');

const EnquirySchema = new mongoose.Schema({
  ownerLoginId: { type: String, required: true },
  propertyId: { type: String, required: true },
  propertyName: { type: String },
  studentId: { type: String, required: true },
  studentName: { type: String },
  studentEmail: { type: String },
  studentPhone: { type: String },
  location: { type: String },
  status: { type: String, enum: ['pending','accepted','rejected'], default: 'pending' },
  paidAmount: { type: Number, default: 0 },
  chatOpen: { type: Boolean, default: false },
  visitAllowed: { type: Boolean, default: false },
  ts: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Enquiry', EnquirySchema);
