const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const FormData = require("form-data");

require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());
const History = require("./models/History");

// Route to save history
app.post("/api/history", async (req, res) => {
  try {
    const { type, content } = req.body;
    const newRecord = new History({ type, content });
    await newRecord.save();
    res.status(201).json(newRecord);
  } catch (error) {
    res.status(500).json({ error: "Failed to save history" });
  }
});

// Route to get all history records
app.get("/api/history", async (req, res) => {
  try {
    const history = await History.find().sort({ createdAt: -1 });
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("✅ MongoDB connected successfully");
}).catch((err) => {
    console.error("❌ MongoDB connection error:", err);
});

// Basic test route
app.get("/", (req, res) => {
    res.send("Kee's EaseTalk backend is running!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
const multer = require("multer");
const axios = require("axios");
const fs = require("fs");

const upload = multer({ dest: "uploads/" });

app.post("/api/speech-to-text", upload.single("audio"), async (req, res) => {
    try {
        const audioPath = req.file.path;

        const formData = new FormData();
        formData.append("file", fs.createReadStream(audioPath));
        formData.append("model", "whisper-1");

        const response = await axios.post("https://api.openai.com/v1/audio/transcriptions", formData, {
            headers: {
                ...formData.getHeaders(),
                Authorization: `Bearer ${process.env.OPENAI_API_KEY}`

            }
        });

        fs.unlinkSync(audioPath); // Clean up uploaded file

        res.json({ transcript: response.data.text });
    } catch (error) {
        res.status(500).json({ error: "Speech-to-Text failed", details: error.message });
    }
});
