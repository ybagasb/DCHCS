const mongoose = require('mongoose');

// Using the URI provided by the user in the prompt
const MONGODB_URI = 'mongodb://admin:Qwerty123.@10.10.55.96:27017';

async function test() {
    try {
        console.log("Connecting to:", MONGODB_URI);
        const conn = await mongoose.createConnection(MONGODB_URI, { dbName: 'alerting' }).asPromise();
        console.log("Connected to alerting DB");
        
        // Define a loose schema to see what's actually there
        const schema = new mongoose.Schema({}, { strict: false, collection: 'pic_schedules' });
        const Model = conn.model('PicSchedule', schema);
        
        const targetDate = '2026-01-23';
        console.log(`Querying pic_schedules for ${targetDate}...`);
        const doc = await Model.findOne({ date: targetDate });
        console.log("Result for 2026-01-23:", JSON.stringify(doc, null, 2));
        
        await conn.close();
    } catch (e) {
        console.error("Error:", e);
    }
}

test();
