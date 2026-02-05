const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// ✅ MongoDB connection
mongoose.connect("mongodb://127.0.0.1:27017/calllog")
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Error:", err));

// ✅ Schema
const callLogSchema = new mongoose.Schema({
    eventType: String,     // CALL / SMS
    phoneNumber: String,
    date: String,
    time: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// ✅ Force collection name = calllogs
const CallLog = mongoose.model('CallLog', callLogSchema, 'calllogs');

// ✅ API Route
app.post('/log', async (req, res) => {
    try {
        console.log("📩 Data received:", req.body);

        const newLog = new CallLog(req.body);
        await newLog.save();

        res.status(200).json({ message: "Log stored successfully" });
    } catch (error) {
        console.error("❌ Save Error:", error);
        res.status(500).json({ error: "Failed to save log" });
    }
});

// ✅ Server start
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 GSM Server running on http://localhost:${PORT}`);
});
