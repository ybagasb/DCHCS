import { Schema, model, models } from 'mongoose'

const ChecklistSchema = new Schema(
  {
    tgl: { type: Date, required: true },
    piket: { type: String, default: '' },
    pac: {
      temp: { type: Number, required: true },
      humdty: { type: Number, required: true },
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
      tempRoom1: { type: Number, required: true },
      tempRoom2: { type: Number, required: true },
    },
    raisedFloor: {
      physicalCondition: { type: String, default: '' },
      cleanliness: { type: String, default: '' },
      airflowCooling: { type: String, default: '' },
      notes: { type: String, default: '' },
      status: { type: String, default: '' },
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

// Prevent Mongoose model recompilation error in development
// But force refresh if schema changed (hacky for dev, but effective)
// In a real prod app, you'd rely on build process, but for HMR we need this:
if (process.env.NODE_ENV !== 'production') {
  delete models.Checklist
}

export const Checklist = models.Checklist || model('Checklist', ChecklistSchema)
