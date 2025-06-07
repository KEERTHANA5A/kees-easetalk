const mongoose = require("mongoose");

const HistorySchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["speech", "sign"],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("History", HistorySchema);
