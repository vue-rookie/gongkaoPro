import mongoose, { Schema, Document } from 'mongoose';

export interface IOrder extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  planId: string; // 'monthly' | 'yearly'
  orderId: string; // 本地订单号
  openOrderId?: string; // 虎皮椒返回的订单ID
  amount: number;
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: 'alipay' | 'wechat';
  createdAt: Date;
  paidAt?: Date;
  expiresAt?: Date; // 订单过期时间（未支付订单30分钟过期）
}

const OrderSchema = new Schema<IOrder>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  planId: {
    type: String,
    required: true,
    enum: ['monthly', 'yearly'],
  },
  orderId: {
    type: String,
    required: true,
    unique: true,
  },
  openOrderId: String,
  amount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending',
  },
  paymentMethod: {
    type: String,
    enum: ['alipay', 'wechat'],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  paidAt: Date,
  expiresAt: Date,
});

// 索引优化
OrderSchema.index({ userId: 1, createdAt: -1 });
OrderSchema.index({ orderId: 1 });
OrderSchema.index({ status: 1, expiresAt: 1 });

const Order = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);

export default Order;
