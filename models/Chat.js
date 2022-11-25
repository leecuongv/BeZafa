const mongoose = require("mongoose");
const { COLLECTION } = require("../utils/enum");

const chatSchema = mongoose.Schema(
  {
    name: {
      type: String,
      trim: true
    },
    isGroupChat: {
      type: Boolean,
      default: false
    },
    users: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: COLLECTION.USER
    }],
    latestMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: COLLECTION.MESSAGE
    },
    groupAdmin: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: COLLECTION.USER
    }],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true }
  }
);

const Chat = mongoose.model(COLLECTION.CHAT, chatSchema);

module.exports = Chat;