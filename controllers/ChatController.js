const Chat = require("../models/Chat");
const jwt_decode = require('jwt-decode')
const User = require("../models/User");

const ChatController = {
  create: async (req, res) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      const decodeToken = jwt_decode(token)
      const loginUserId = decodeToken.id
      //console.log(loginUserId);
      if (!loginUserId) return res.status(400).json({ message: "Vui lòng đăng nhập!" });
      const loginUser = await User.findById(loginUserId);
      if (!loginUser) return res.status(400).json({ message: "Người dùng không tồn tại!" });



      const userId = req.body.userId;
      //console.log(userId, ":", req.user);
      const user = await User.findById(userId);
      if (!user) return res.status(400).json({ message: "Không có người dùng!" });
      var isChat = await Chat.find({
        isGroupChat: false,
        $and: [
          { users: { $elemMatch: { $eq: req.user._id } } },
          { users: { $elemMatch: { $eq: userId } } },
        ],
      })
        .populate("users", "-password")
        .populate("latestMessage");

      isChat = await User.populate(isChat, {
        path: "latestMessage.sender",
        select: "username fullname avatar email",
      });

      if (isChat.length > 0) {
        res.send(isChat[0]);
      } else {
        var chatData = {
          name: "sender",
          isGroupChat: false,
          users: [loginUser._id, userId],
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
    } catch (error) {
      console.log("Lỗi tìm người dùng!"+error.message);
      return res.status(500).json({ message: "Lỗi tìm người dùng!" });
    }
  },

  fetchChats: async (req, res) => {
    try {

      //console.log("fetch chat \n" + req.user);
      const token = req.headers.authorization?.split(" ")[1];
      const decodeToken = jwt_decode(token)
      const loginUserId = decodeToken.id
      //console.log(loginUserId);
      if (!loginUserId) return res.status(400).json({ message: "Vui lòng đăng nhập!" });
      const loginUser = await User.findById(loginUserId);
      if (!loginUser) return res.status(400).json({ message: "Người dùng không tồn tại!" });

      Chat.find({ users: { $elemMatch: { $eq: loginUser.id } } })
        .populate("users", "-password")
        .populate("groupAdmin", "-password")
        .populate("latestMessage")
        .sort({ updatedAt: -1 })
        .then(async (results) => {
          results = await User.populate(results, {
            path: "latestMessage.sender",
            select: "username fullname avatar email",
          });
          res.status(200).send(results);
        });
    } catch (error) {
      console.log("Lỗi truy cập vào chat!"+error);
      return res.status(500).json({ message: "Lỗi truy cập vào chat!" });
    }
  },

  createGroupChat: async (req, res) => {
    try {
      console.log("createGroupChat"+req.user);
      const token = req.headers.authorization?.split(" ")[1];
      const decodeToken = jwt_decode(token)
      const loginUserId = decodeToken.id
      //console.log(loginUserId);
      if (!loginUserId) return res.status(400).json({ message: "Vui lòng đăng nhập!" });
      const loginUser = await User.findById(loginUserId);
      if (!loginUser) return res.status(400).json({ message: "Người dùng không tồn tại!" });

      const { users, name } = req.body;

      if (users.length < 2) {
        return res.status(400).send("Chỉ có thể tạo group chat với số lượng thành viên trên 2");
      }
      users.push(loginUser.id);

      //console.log(users);

      const groupChat = await Chat.create({
        name: name,
        users: users,
        isGroupChat: true,
        groupAdmin: [loginUser.id],
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
      console.log("renameGroup"+req.user);
      const token = req.headers.authorization?.split(" ")[1];
      const decodeToken = jwt_decode(token)
      const loginUserId = decodeToken.id
      //console.log(loginUserId);
      if (!loginUserId) return res.status(400).json({ message: "Vui lòng đăng nhập!" });
      const loginUser = await User.findById(loginUserId);
      if (!loginUser) return res.status(400).json({ message: "Người dùng không tồn tại!" });

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
          message: "Không tìm thấy group chat!",
        });
      }
      if (!updatedChat.groupAdmin.find((item) => item.toString() === loginUser.id.toString())) {
        return res.status(400).json({
          message: "Chỉ quản trị viên mới có quyền đổi tên group chat!",
        });
      }

      return res.status(200).json({
        updatedChat,
      });
    } catch (error) {
      console.log("Lỗi truy cập vào chat!" +error);
      return res.status(500).json({ message: "Lỗi truy cập vào chat!" });
    }
  },

  removeUserFromGroup: async (req, res) => {
    try {
      console.log(req.user);
      const token = req.headers.authorization?.split(" ")[1];
      const decodeToken = jwt_decode(token)
      const loginUserId = decodeToken.id
      console.log(loginUserId);
      if (!loginUserId) return res.status(400).json({ message: "Vui lòng đăng nhập!" });
      const loginUser = await User.findById(loginUserId);
      if (!loginUser) return res.status(400).json({ message: "Người dùng không tồn tại!" });

      const { chatId, userId } = req.body;
      const user = await User.findById(userId);

      if (!user) return res.status(400).json({ message: "Không có người dùng!" });
      let chat = await Chat.findById(chatId);

      if (!chat) return res.status(400).json({ message: "Không tìm thấy đoạn chat!" });
      if (!chat.groupAdmin.find((item) => item.toString() === loginUser.id.toString())) {
        return res.status(400).json({
          message: "Chỉ quản trị viên mới có quyền xóa người tham gia khỏi group chat!",
        });
      }
      if (chat.users.find((item) => item.toString() === user.id.toString())) {
        chat.users = chat.users.filter((item) => item.toString() !== user.id.toString());
      } else {
        return res.status(400).json({ message: "Thành viên không thuộc đoạn chat!" });
      }
      if (removed.users < 3) removed.isGroupChat = false;
      const removed = await chat.save();

      if (!removed) {
        res.status(404).json({ message: "Không tìm thấy đoạn chat" });
      }
      return res.status(200).json({ removed });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Lỗi truy cập vào chat!" });
    }
  },

  addUserToGroup: async (req, res) => {
    try {
      console.log(req.user);
      const token = req.headers.authorization?.split(" ")[1];
      const decodeToken = jwt_decode(token)
      const loginUserId = decodeToken.id
      console.log(loginUserId);
      if (!loginUserId) return res.status(400).json({ message: "Vui lòng đăng nhập!" });
      const loginUser = await User.findById(loginUserId);
      if (!loginUser) return res.status(400).json({ message: "Người dùng không tồn tại!" });

      const { chatId, userId } = req.body;
      const user = await User.findById(userId);

      if (!user) return res.status(400).json({ message: "Không có người dùng!" });
      let chat = await Chat.findById(chatId);
      if (!chat) return res.status(400).json({ message: "Không tìm thấy đoạn chat!" });
      if (!chat.groupAdmin.find((item) => item.toString() === loginUser.id.toString())) {
        return res.status(400).json({
          message: "Chỉ quản trị viên mới có quyền xóa người tham gia khỏi group chat!",
        });
      }
      if (!chat.users.find((item) => item.toString() === user.id.toString())) {
        chat.users.push(user.id);
      } else {
        return res.status(400).json({ message: "Thành viên đã thuộc đoạn chat!" });
      }

      const added = await chat.save();
      if (!added) {
        return res.status(400).json({ message: "Thêm thành viên thất bại!" });
      }
      return res.status(200).json(added);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Lỗi thêm thành viên vào đoạn chat!" });
    }
  },

  addUserToGroupAdmin: async (req, res) => {
    try {
      console.log(req.user);
      const token = req.headers.authorization?.split(" ")[1];
      const decodeToken = jwt_decode(token)
      const loginUserId = decodeToken.id
      console.log(loginUserId);
      if (!loginUserId) return res.status(400).json({ message: "Vui lòng đăng nhập!" });
      const loginUser = await User.findById(loginUserId);
      if (!loginUser) return res.status(400).json({ message: "Người dùng không tồn tại!" });

      const { chatId, userId } = req.body;
      const user = await User.findById(userId);
      if (!user) return res.status(400).json({ message: "Không có người dùng!" });
      let chat = await Chat.findById(chatId);

      if (!chat) return res.status(400).json({ message: "Không tìm thấy đoạn chat!" });
      if (!chat.groupAdmin.find((item) => item.toString() === loginUser.id.toString())) {
        return res.status(400).json({
          message: "Chỉ quản trị viên mới có quyền xóa người tham gia khỏi group chat!",
        });
      }
      if (!chat.groupAdmin.find((item) => item.toString() === user.id.toString())) {
        chat.groupAdmin.push(user.id);
      } else {
        return res.status(400).json({ message: "Thành viên đã thuộc đoạn chat!" });
      }
      const added = await chat.save();
      if (!added) {
        return res.status(400).json({ message: "Thêm thành viên thất bại!" });
      }
      return res.status(200).json(added);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Lỗi thêm thành viên vào đoạn chat!" });
    }
  },

  removeUserFromGroupAdmin: async (req, res) => {
    try {
      console.log(req.user);
      const token = req.headers.authorization?.split(" ")[1];
      const decodeToken = jwt_decode(token)
      const loginUserId = decodeToken.id
      console.log(loginUserId);
      if (!loginUserId) return res.status(400).json({ message: "Vui lòng đăng nhập!" });
      const loginUser = await User.findById(loginUserId);
      if (!loginUser) return res.status(400).json({ message: "Người dùng không tồn tại!" });

      const { chatId, userId } = req.body;
      const user = await User.findById(userId);

      if (!user) return res.status(400).json({ message: "Không có người dùng!" });
      let chat = await Chat.findById(chatId);

      if (!chat) return res.status(400).json({ message: "Không tìm thấy đoạn chat!" });
      if (!chat.groupAdmin.find((item) => item.toString() === loginUser.id.toString())) {
        return res.status(400).json({
          message: "Chỉ quản trị viên mới có quyền xóa người tham gia khỏi group chat!",
        });
      }
      if (chat.groupAdmin.length < 2)
        return res.status(400).json({
          message: "Cần ít nhất một quản trị viên cho đoạn chat!",
        });

      if (!chat.groupAdmin.find((item) => item.toString() === user.id.toString())) {
        chat.groupAdmin = chat.groupAdmin.filter((item) => item.toString() !== user.id.toString());
      } else {
        return res.status(400).json({ message: "Thành viên không thuộc đoạn chat!" });
      }
      const removed = await chat.save();
      if (!removed) {
        res.status(404).json({ message: "Không tìm thấy đoạn chat" });
      }
      return res.status(200).json({ removed });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Lỗi truy cập vào chat!" });
    }
  },

  leaveGroupChat: async (req, res) => {
    try {
      console.log(req.user);
      const token = req.headers.authorization?.split(" ")[1];
      const decodeToken = jwt_decode(token)
      const loginUserId = decodeToken.id
      console.log(loginUserId);
      if (!loginUserId) return res.status(400).json({ message: "Vui lòng đăng nhập!" });
      const loginUser = await User.findById(loginUserId);
      if (!loginUser) return res.status(400).json({ message: "Người dùng không tồn tại!" });

      const chatId = req.query.id;
      let chat = await Chat.findById(chatId);

      if (!chat) return res.status(400).json({ message: "Không tìm thấy đoạn chat!" });

      if (chat.users.find((item) => item.toString() === loginUser.id.toString())) {
        chat.users = chat.users.filter((item) => item.toString() !== loginUser.id.toString());
      } else {
        return res.status(400).json({ message: "Thành viên không thuộc đoạn chat!" });
      }

      if (chat.groupAdmin.find((item) => item.toString() === loginUser.id.toString())) {
        chat.groupAdmin = chat.groupAdmin.filter(
          (item) => item.toString() !== loginUser.id.toString()
        );
      }

      if (removed.users < 3) removed.isGroupChat = false;
      const removed = await chat.save();

      if (!removed) {
        res.status(404).json({ message: "Không tìm thấy đoạn chat" });
      }
      return res.status(200).json({ removed });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Lỗi truy cập vào chat!" });
    }
  },
};
module.exports = { ChatController };
