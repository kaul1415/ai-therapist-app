const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    chatSession: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ChatSession',
      required: true,
    },
    sender: {
      type: String,
      enum: ['user', 'ai'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    // For AI therapist, we might want to store additional metadata like sentiment, intent, etc.
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Message', messageSchema);
