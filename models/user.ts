import mongoose, { Schema, InferSchemaType, model, models } from 'mongoose';

export type UserRole =
  | 'OWNER'
  | 'MANAGER'
  | 'EVENTS_STAFF'
  | 'DOOR_STAFF'
  | 'CONTENT_EDITOR'
  // legacy values kept so existing documents still load; normalised in lib/auth
  | 'SUPER_ADMIN'
  | 'EVENT_ADMIN'
  | 'CHECK_IN_STAFF';

export const USER_ROLES: UserRole[] = [
  'OWNER',
  'MANAGER',
  'EVENTS_STAFF',
  'DOOR_STAFF',
  'CONTENT_EDITOR',
];

const UserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true },
    role: {
      type: String,
      enum: [
        'OWNER',
        'MANAGER',
        'EVENTS_STAFF',
        'DOOR_STAFF',
        'CONTENT_EDITOR',
        'SUPER_ADMIN',
        'EVENT_ADMIN',
        'CHECK_IN_STAFF',
      ],
      required: true,
      index: true,
    },
    active: { type: Boolean, default: true, index: true },
    invitedAt: { type: Date },
    lastLoginAt: { type: Date },
    passwordResetToken: { type: String, index: true },
    passwordResetExpires: { type: Date },
  },
  { timestamps: true }
);

export type User = InferSchemaType<typeof UserSchema> & { _id: mongoose.Types.ObjectId };

export const UserModel = models.User || model('User', UserSchema);
