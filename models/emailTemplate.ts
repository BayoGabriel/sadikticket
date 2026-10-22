import mongoose, { Schema, InferSchemaType, model, models } from "mongoose";

// Editable branded email templates. Variables use [Event], [Name] style tokens
// and are substituted at send time.
const EmailTemplateSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    description: { type: String, default: "" },
    subject: { type: String, required: true },
    // Plain-text-ish body; supports \n and [Variable] tokens.
    body: { type: String, required: true },
    enabled: { type: Boolean, default: true },
    timingDays: { type: Number, default: 2 }, // only used by the reminder template
  },
  { timestamps: true }
);

export type EmailTemplate = InferSchemaType<typeof EmailTemplateSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const EmailTemplateModel =
  models.EmailTemplate || model("EmailTemplate", EmailTemplateSchema);
