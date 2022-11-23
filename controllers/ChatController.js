const Chat = require("../models/Chat");
const User = require("../models/User");

const ChatController = {
    create: async (req, res) => {
        try {
            const loginUsername = req.user.sub
            if (!loginUsername)
                return res.status(400).json({ message: "Vui lòng đăng nhập!" })
            const loginUser = await User.findOne({ loginUsername })
            if (!loginUser)
                return res.status(400).json({ message: "Không có người dùng!" })

            const userId = req.body;
            const user = await User.findById(userId)
            if (!user)
                return res.status(400).json({ message: "Không có người dùng!" })
            var isChat = await Chat.find({
                isGroupChat: false,
                $and: [
                    { users: { $elemMatch: { $eq: userId } } },
                    //{ users: { $elemMatch: { $eq: userId } } },
                ],
            })
                .populate("users", "-password")
                .populate("latestMessage");

            isChat = await User.populate(isChat, {
                path: "latestMessage.sender",
                select: "name pic email",
            });

            if (isChat.length > 0) {
                res.send(isChat[0]);
            } else {
                var chatData = {
                    name: "sender",
                    isGroupChat: false,
                    users: [req.user._id, userId],
                };

                try {
                    const createdChat = await Chat.create(chatData);
                    const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
                        "users",
                        "-password"
                    );
                    res.status(200).json(FullChat);
                } catch (error) {
                    res.status(400);
                    throw new Error(error.message);
                }
            }
        }
        catch (error) {
            console.log(error)
            return res.status(500).json({ message: "Lỗi tìm người dùng!" })
        }
    },

    fetchChats: async (req, res) => {
        try {

            Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
                .populate("users", "-password")
                .populate("groupAdmin", "-password")
                .populate("latestMessage")
                .sort({ updatedAt: -1 })
                .then(async (results) => {
                    results = await User.populate(results, {
                        path: "latestMessage.sender",
                        select: "name pic email",
                    });
                    res.status(200).send(results);
                });
        } catch (error) {
            console.log(error)
            return res.status(500).json({ message: "Lỗi truy cập vào chat!" })
        }
    },

    createGroupChat: async (req, res) => {
        try {
            const loginUsername = req.user.sub
            if (!loginUsername)
                return res.status(400).json({ message: "Vui lòng đăng nhập!" })
            const loginUser = await User.findOne({ loginUsername })
            if (!loginUser)
                return res.status(400).json({ message: "Không có người dùng!" })
            console.log(loginUser)

            const { users, name } = req.body

            if (users.length < 2) {
                return res
                    .status(400)
                    .send("More than 2 users are required to form a group chat");
            }

            users.push(loginUser.id);

            console.log(users)

            const groupChat = await Chat.create({
                name: name,
                users: users,
                isGroupChat: true,
                groupAdmin: loginUser.id,
            });

            const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
                .populate("users", "-password")
                .populate("groupAdmin", "-password");

            res.status(200).json(fullGroupChat);
        } catch (error) {
            res.status(400);
            throw new Error(error.message);
        }
    },

    renameGroup: async (req, res) => {
        try {
            const loginUsername = req.user.sub
            if (!loginUsername)
                return res.status(400).json({ message: "Vui lòng đăng nhập!" })
            const loginUser = await User.findOne({ loginUsername })
            if (!loginUser)
                return res.status(400).json({ message: "Không có người dùng!" })

            const { chatId, name } = req.body;

            const updatedChat = await Chat.findByIdAndUpdate(
                chatId,
                {
                    name: name,
                },
                {
                    new: true,
                }
            )
                .populate("users", "-password")
                .populate("groupAdmin", "-password");
            if (!updatedChat) {
                res.status(400).json({
                    message: "Không tìm thấy group chat!"
                })
            }
            if (updatedChat.groupAdmin.id !== loginUser.id)
                return res.status(400).json({
                    message: "Chỉ quản trị viên mới có quyền đổi tên group chat!"
                })
            return res.status(200).json({
                updatedChat
            })
        }
        catch (error) {
            console.log(error)
            return res.status(500).json({ message: "Lỗi truy cập vào chat!" })
        }
    },

    removeFromGroup: async (req, res) => {

        const { chatId, userId } = req.body;
        const removed = await Chat.findByIdAndUpdate(
            chatId,
            {
                $pull: { users: userId },
            },
            {
                new: true,
            }
        )
            .populate("users", "-password")
            .populate("groupAdmin", "-password");

        if (!removed) {
            res.status(404);
            throw new Error("Chat Not Found");
        } else {
            res.json(removed);
        }
    },

    addToGroup: async (req, res) => {
        const { chatId, userId } = req.body;

        // check if the requester is admin

        const added = await Chat.findByIdAndUpdate(
            chatId,
            {
                $push: { users: userId },
            },
            {
                new: true,
            }
        )
            .populate("users", "-password")
            .populate("groupAdmin", "-password");

        if (!added) {
            res.status(404);
            throw new Error("Chat Not Found");
        } else {
            res.json(added);
        }
    },
}
module.exports = { ChatController };