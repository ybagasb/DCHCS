import mongoose from 'mongoose'
import { alertingConnection } from '@/lib/alertingDb'

const PicScheduleSchema = new mongoose.Schema({
  date: {
    type: String, 
    required: true,
  },
  pics: [{
    name: String,
    username: String,
    picId: String
  }],
  dayOfWeek: String,
  isWeekday: Boolean
}, {
  collection: 'pic_schedules'
})

// Use the separate connection
const PicSchedule = alertingConnection.models.PicSchedule || alertingConnection.model('PicSchedule', PicScheduleSchema)

export default PicSchedule
