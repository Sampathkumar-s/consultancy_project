const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect("mongodb://127.0.0.1:27017/gpsdb")
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

// Schema
const locationSchema = new mongoose.Schema({
  latitude: Number,
  longitude: Number,
  time: {
    type: Date,
    default: Date.now
  }
});

const Location = mongoose.model("Location", locationSchema);

// API
app.post("/location", async (req, res) => {
  const { latitude, longitude } = req.body;

  const newLocation = new Location({ latitude, longitude });
  await newLocation.save();

  res.status(200).json({ message: "Location saved" });
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
