import mongoose, { Schema, model, models } from 'mongoose';

const VerificationCodeSchema = new Schema({
  email: { type: String, required: true },
  code: { type: String, required: true },
  type: { type: String, required: true, enum: ['register', 'reset_password'] },
  attempts: { type: Number, default: 0 },
  used: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now, expires: 600 } // TTL index: 10 minutes (600 seconds)
});

// Compound unique index: ensure only one active code per email+type
VerificationCodeSchema.index({ email: 1, type: 1 }, { unique: true });

const VerificationCode = models.VerificationCode || model('VerificationCode', VerificationCodeSchema);

export default VerificationCode;
