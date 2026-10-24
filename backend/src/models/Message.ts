import mongoose, { Schema, Document } from 'mongoose';

export type MessageKind = 'CHAT' | 'ANNOUNCEMENT' | 'ALERT' | 'DATA';

export interface IMessage extends Document {
  _id: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  senderName: string;
  receiverId?: mongoose.Types.ObjectId | null;
  receiverName?: string | null;
  /** Chủ cuộc trò chuyện riêng (luôn là nông dân) - dùng để gom tin nhắn theo từng nông dân */
  farmerId?: mongoose.Types.ObjectId | null;
  content: string;
  title?: string | null;
  type: 'private' | 'public';
  kind?: MessageKind;
  level?: 'low' | 'moderate' | 'high' | 'extreme' | null;
  /** Thông báo chung: null/rỗng = toàn vùng ĐBSCL, có giá trị = chỉ một tỉnh */
  provinceCode?: string | null;
  isRead: boolean;
  isArchived: boolean;
  response_content?: string;
  deliveryStatus?: 'pending' | 'delivered' | 'read';
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    senderName: { type: String, required: true },
    receiverId: { type: Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    receiverName: { type: String, default: null },
    farmerId: { type: Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    content: { type: String, required: true, trim: true, maxlength: 4000 },
    title: { type: String, trim: true, maxlength: 150, default: null },
    type: { type: String, enum: ['private', 'public'], default: 'private' },
    kind: { type: String, enum: ['CHAT', 'ANNOUNCEMENT', 'ALERT', 'DATA'], default: 'CHAT' },
    level: { type: String, enum: ['low', 'moderate', 'high', 'extreme', null], default: null },
    provinceCode: { type: String, default: null },
    isRead: { type: Boolean, default: false },
    isArchived: { type: Boolean, default: false },
    response_content: { type: String, default: null },
    deliveryStatus: { type: String, enum: ['pending', 'delivered', 'read'], default: 'pending' },
  },
  { timestamps: true }
);

MessageSchema.index({ receiverId: 1, type: 1, createdAt: -1 });
MessageSchema.index({ senderId: 1, createdAt: -1 });
MessageSchema.index({ farmerId: 1, createdAt: 1 });

export const Message = mongoose.model<IMessage>('Message', MessageSchema);
