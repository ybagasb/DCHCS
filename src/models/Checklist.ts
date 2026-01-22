import { Schema, model, models } from 'mongoose'

const ChecklistSchema = new Schema(
  {
    tgl: { type: Date, required: true },
    piket: { type: String, default: '' },
    pac: {
      temp: { type: String, default: '' },
      humdty: { type: String, default: '' },
      alarm: { type: String, default: '' },
    },
    ups: {
      ups1: { type: String, default: '' },
      ups2: { type: String, default: '' },
    },
    fss: {
      lcdPanel: { type: String, default: '' },
      selenoid: { type: String, default: '' },
    },
    ems: {
      tempRoom1: { type: String, default: '' },
      tempRoom2: { type: String, default: '' },
    },
    rackCabling: {
      rack: { type: String, default: '' },
      cabling: { type: String, default: '' },
    },
    acSplitLights: {
      acSplit: { type: String, default: '' },
      lights: { type: String, default: '' },
    },
    cctvDc: { type: String, default: '' },
    noted: { type: String, default: '' },
  },
  { timestamps: true }
)

export const Checklist = models.Checklist || model('Checklist', ChecklistSchema)
