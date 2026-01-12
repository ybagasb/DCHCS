import { Schema, model, models } from 'mongoose'

const LinkSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
    icon: { type: String, default: '' },
  },
  { timestamps: true }
)

export const Link = models.Link || model('Link', LinkSchema)
