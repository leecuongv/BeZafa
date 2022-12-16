const Message = require("../models/Message");
const User = require("../models/User");
const jwt_decode = require('jwt-decode')
const Chat = require("../models/Chat");

const MessageController = {

    allMessages: async (req, res) => {
        try {
            const token = req.headers.authorization?.split(" ")[1];
            const decodeToken = jwt_decode(token)
            const loginUserId = decodeToken.id
            console.log(loginUserId);
            if (!loginUserId) return res.status(400).json({ message: "Vui lòng đăng nhập!" });
            const loginUser = await User.findById(loginUserId);
            if (!loginUser) return res.status(400).json({ message: "Người dùng không tồn tại!" });

            const messages = await Message.find({ chat: req.params.chatId })
                .populate("sender", "username fullname avatar email")
                .populate("chat");
            //res.json(messages);
            if (!messages)
                return res.status(400).json({ message: "Không tìm thấy tin nhắn!" })
            return res.status(200).json(messages)
        } catch (error) {
            return res.status(400).json({ message: "Lỗi tìm tin nhắn!" })
        }
    },

    sendMessage: async (req, res) => {
        try {
            const token = req.headers.authorization?.split(" ")[1];
            const decodeToken = jwt_decode(token)
            const loginUserId = decodeToken.id
            console.log(loginUserId);
            if (!loginUserId) return res.status(400).json({ message: "Vui lòng đăng nhập!" });
            const loginUser = await User.findById(loginUserId);
            if (!loginUser) return res.status(400).json({ message: "Người dùng không tồn tại!" });
            const { content, chatId } = req.body;

            let chat = await Chat.findById(chatId)
            if (!chat)
                return res.status(400).json({ message: "Không tìm thấy đoạn chat!" })
            var newMessage = {
                sender: loginUser.id,
                content: content,
                chat: chatId,
            };
            let message = await Message.create(newMessage);
            console.log(message)

            message = await message.populate([{ path: 'sender', select: 'username fullname avatar' }, { path: 'chat' }])
            message = await User.populate(message, {
                path: "chat.users",
                select: "username fullname avatar email",
            });

            await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });

            if (!message)
                return res.status(400).json({ message: "Gửi tin nhắn thất bại!" })
            return res.status(200).json(message)
        }
        catch (error) {
            console.log(error)
            return res.status(400).json({ message: "Lỗi gửi tin nhắn!" })
        }
    },
}

module.exports = { MessageController };