const Message = require("../models/Message");
const User = require("../models/User");
const Chat = require("../models/Chat");

const MessageController = {

    allMessages: async (req, res) => {
        try {
            const loginUsername = req.user.sub
            if (!loginUsername)
                return res.status(400).json({ message: "Vui lòng đăng nhập!" })
            const loginUser = await User.findOne({ username: loginUsername })
            if (!loginUser)
                return res.status(400).json({ message: "Không có người dùng!" })

            const messages = await Message.find({ chat: req.params.chatId })
                .populate("sender", "name pic email")
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
            let loginUsername = req.user?.sub
            console.log(loginUsername)
            if (!loginUsername)
                return res.status(400).json({ message: "Vui lòng đăng nhập!" })
            let loginUser = await User.findOne({ username: loginUsername })
            console.log(loginUser)
            if (!loginUsername)
                return res.status(400).json({ message: "Không có người dùng!" })
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

            message = await message.populate([{ path: 'sender', select: 'name pic' }, { path: 'chat' }])
            message = await User.populate(message, {
                path: "chat.users",
                select: "name pic email",
            });

            const newChat = await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });

            if (!newChat)
                return res.status(400).json({ message: "Gửi tin nhắn thất bại!" })
            return res.status(200).json(newChat)
        }
        catch (error) {
            console.log(error)
            return res.status(400).json({ message: "Lỗi gửi tin nhắn!" })
        }
    },
}

module.exports = { MessageController };