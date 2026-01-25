import mongoose, { Schema, model, models } from 'mongoose';

// Sub-schemas for structured data
const MessageSchema = new Schema({
  id: String,
  role: String,
  text: String,
  timestamp: Number,
  image: String,
  isError: Boolean,
  isSystem: Boolean,
  isBookmarked: Boolean,
  categoryId: String,
  note: String,
  mode: String,
  sessionId: String
}, { _id: false });

const CategorySchema = new Schema({
  id: String,
  name: String,
  mode: String,
  createdAt: Number,
  parentId: String
}, { _id: false });

const SessionSchema = new Schema({
  id: String,
  title: String,
  updatedAt: Number
}, { _id: false });

// Main User Schema
const UserSchema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Hashed password
  email: { type: String, required: true, unique: true },
  emailVerified: { type: Boolean, default: false },
  phoneNumber: { type: String },
  avatar: String,
  createdAt: { type: Number, default: Date.now },
  
  // Embedded Data (Document Model)
  // In a massive scale app, messages might be in a separate collection,
  // but for a personal assistant, embedding is efficient for full-sync.
  data: {
    messages: { type: [MessageSchema], default: [] },
    categories: { type: [CategorySchema], default: [] },
    sessions: { type: [SessionSchema], default: [] },
    currentSessionId: String,
    currentMode: String
  },

  // Membership fields
  membership: {
    type: {
      type: String,
      enum: ['free', 'monthly', 'yearly'],
      default: 'free'
    },
    status: {
      type: String,
      enum: ['active', 'expired'],
      default: 'active'
    },
    startDate: Date,
    endDate: Date
  },

  // Usage tracking
  usage: {
    aiCallCount: {
      type: Number,
      default: 0
    },
    freeTrialRemaining: {
      type: Number,
      default: 3
    },
    membershipUsageRemaining: {
      type: Number,
      default: 0
    }
  }
});

// Add email index for faster lookups
UserSchema.index({ email: 1 });

const User = models.User || model('User', UserSchema);

export default User;