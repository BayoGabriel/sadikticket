import mongoose, { Schema, InferSchemaType, model, models } from "mongoose";

// Single document (key: "main") — everything the public site used to hard-code
// as placeholders reads from here.
const SiteSettingsSchema = new Schema(
  {
    key: { type: String, default: "main", unique: true },
    whatsappNumber: { type: String, default: "" },
    contactEmail: { type: String, default: "" },
    businessEmail: { type: String, default: "" },
    instagramHandle: { type: String, default: "" },
    enquiryNotifyEmails: { type: [String], default: [] },
    responseTime: { type: String, default: "within a day" },
    cities: { type: [String], default: ["Lagos", "Benin City"] },
    fewLeftThreshold: { type: Number, default: 10, min: 0 },
    stickyMobileBanner: { type: Boolean, default: true },
    announcementEnabled: { type: Boolean, default: false },
    announcementText: { type: String, default: "" },
    refundSummary: {
      type: String,
      default: "[Your refund policy.]",
    },
  },
  { timestamps: true }
);

export type SiteSettings = InferSchemaType<typeof SiteSettingsSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const SiteSettingsModel =
  models.SiteSettings || model("SiteSettings", SiteSettingsSchema);
