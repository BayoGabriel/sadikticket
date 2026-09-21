import mongoose, { Schema, InferSchemaType, model, models } from 'mongoose';

export type UserRole = 'SUPER_ADMIN' | 'EVENT_ADMIN' | 'CHECK_IN_STAFF';

const UserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, enum: ['SUPER_ADMIN', 'EVENT_ADMIN', 'CHECK_IN_STAFF'], required: true, index: true },
  },
  { timestamps: true }
);

export type User = InferSchemaType<typeof UserSchema> & { _id: mongoose.Types.ObjectId };

export const UserModel = models.User || model('User', UserSchema);
