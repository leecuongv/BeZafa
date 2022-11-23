const Chat = require("../models/Chat");
const User = require("../models/User");

const ChatController = {
    accessChat: async (req, res) => {

        const username = req.user.sub
        if (!username)
            return res.status(400).json({ message: "Không có người dùng" })
        const user = await User.findOne({ username })
        if (!user)
            return res.status(400).json({ message: "Không có người dùng" })
        //const { userId } = req.body;

        const userId = user.id

        console.log(userId)

        if (!userId) {
            console.log("UserId param not sent with request");
            return res.sendStatus(400);
        }

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
            res.status(400);
            throw new Error(error.message);
        }
    },

    createGroupChat: async (req, res) => {

        if (!req.body.users || !req.body.name) {
            return res.status(400).send({ message: "Please Fill all the feilds" });
        }

        var users = JSON.parse(req.body.users);

        if (users.length < 2) {
            return res
                .status(400)
                .send("More than 2 users are required to form a group chat");
        }

        users.push(req.user);

        try {
            const groupChat = await Chat.create({
                name: req.body.name,
                users: users,
                isGroupChat: true,
                groupAdmin: req.user,
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
            res.status(404);
            throw new Error("Chat Not Found");
        } else {
            res.json(updatedChat);
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
module.exports = {
    ChatController
};