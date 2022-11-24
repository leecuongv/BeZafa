const mongoose = require("mongoose");
const { COLLECTION } = require("../utils/enum");

const messageSchema = mongoose.Schema(
    {
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: COLLECTION.USER
        },
        content: {
            type: String,
            trim: true
        },
        chat: {
            type: mongoose.Schema.Types.ObjectId,
            ref: COLLECTION.CHAT
        },
        readBy: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: COLLECTION.USER
        }],
    },
    {
        timestamps: true,
        toJSON: { virtuals: true }
    }
);

const Message = mongoose.model(COLLECTION.MESSAGE, messageSchema);
module.exports = Message;