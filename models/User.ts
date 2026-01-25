import mongoose, { Schema, model, models, Model, Document } from 'mongoose';

// TypeScript interfaces
interface IMessage {
  id?: string;
  role?: string;
  text?: string;
  timestamp?: number;
  image?: string;
  isError?: boolean;
  isSystem?: boolean;
  isBookmarked?: boolean;
  categoryId?: string;
  note?: string;
  mode?: string;
  sessionId?: string;
}

interface ICategory {
  id?: string;
  name?: string;
  mode?: string;
  createdAt?: number;
  parentId?: string;
}

interface ISession {
  id?: string;
  title?: string;
  updatedAt?: number;
}

interface IUserData {
  messages?: IMessage[];
  categories?: ICategory[];
  sessions?: ISession[];
  currentSessionId?: string;
  currentMode?: string;
}

interface IMembership {
  type?: 'free' | 'monthly' | 'yearly';
  status?: 'active' | 'expired';
  startDate?: Date;
  endDate?: Date;
}

interface IUsage {
  aiCallCount?: number;
  freeTrialRemaining?: number;
  membershipUsageRemaining?: number;
}

export interface IUser extends Document {
  username: string;
  password: string;
  email: string;
  emailVerified: boolean;
  phoneNumber?: string;
  avatar?: string;
  createdAt: number;
  data?: IUserData;
  membership?: IMembership;
  usage?: IUsage;
}

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

const User = (models.User || model<IUser>('User', UserSchema)) as Model<IUser>;

export default User;