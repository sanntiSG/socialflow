import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  googleId?: string;
  email: string;
  name: string;
  avatar?: string;
  provider: string;
  connectedNetworks: {
    network: string;
    accessToken: string;
    refreshToken?: string;
    userId: string;
    username: string;
    avatar?: string;
    expiresAt?: Date;
    connectedAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const ConnectedNetworkSchema = new Schema({
  network: { type: String, required: true },
  accessToken: { type: String, required: true },
  refreshToken: { type: String },
  userId: { type: String, required: true },
  username: { type: String, required: true },
  avatar: { type: String },
  expiresAt: { type: Date },
  connectedAt: { type: Date, default: Date.now },
});

const UserSchema = new Schema<IUser>({
  googleId: { type: String, unique: true, sparse: true },
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  avatar: { type: String },
  provider: { type: String, default: 'google' },
  connectedNetworks: [ConnectedNetworkSchema],
}, { timestamps: true });

export default mongoose.model<IUser>('User', UserSchema);
