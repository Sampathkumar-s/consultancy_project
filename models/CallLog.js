const mongoose = require("mongoose");

const callLogSchema = new mongoose.Schema({
  phoneNumber: {
    type: String,
    required: true
  },
  event: {
    type: String,
    default: "CALL_MADE"
  },
  date: String,
  time: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("CallLog", callLogSchema);
