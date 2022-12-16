const jwt_decode = require('jwt-decode')
const User = require('../models/User.js')
const cloudinary = require('cloudinary').v2
const dotenv = require('dotenv')
dotenv.config()
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
});

const bcrypt = require('bcrypt')
const { DEFAULT_VALUES, ROLES } = require('../utils/enum')

const UserController = {

    searchAllUsers: async (req, res) => {
        try {

            const token = req.headers.authorization?.split(" ")[1];
            const decodeToken = jwt_decode(token)
            const loginUserId = decodeToken.id

            if (!loginUserId) return res.status(400).json({ message: "Vui lòng đăng nhập!" });
            const loginUser = await User.findById(loginUserId);
            if (!loginUser) return res.status(400).json({ message: "Người dùng không tồn tại!" });
            

            const keyword = req.query.search
                ? {
                    $or: [
                        { phone: { $regex: req.query.search, $options: "i" } },
                        { username: { $regex: req.query.search, $options: "i" } },
                        { fullname: { $regex: req.query.search, $options: "i" } },
                        { email: { $regex: req.query.search, $options: "i" } },
                    ],
                }
                : {};
            const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
            if (users.length === 0)
                return res.status(400).json({ message: "Không tìm thấy người dùng, vui lòng kiểm tra lại!" })
            return res.status(200).json(users);

        }
        catch (error) {
            console.log(error)
            return res.status(500).json({ message: "Lỗi tìm người dùng!" })
        }

    },

    getInfo: async (req, res) => {
        try {
            const token = req.headers.authorization?.split(" ")[1];
            const decodeToken = jwt_decode(token)
            const loginUserId = decodeToken.id
            console.log(loginUserId);
            if (!loginUserId) return res.status(400).json({ message: "Vui lòng đăng nhập!" });
            const loginUser = await User.findById(loginUserId);
            if (!loginUser) return res.status(400).json({ message: "Người dùng không tồn tại!" });
            
            const { password, type, id, status, ...rest } = loginUser._doc;

            return res.status(200).json({ ...rest })

        } catch (error) {
            console.log(error)
            return res.status(500).json({ message: "Lỗi xác thực" })
        }
    },
    getInfoShort: async (req, res) => {
        try {
            const token = req.headers.authorization?.split(" ")[1];
            const decodeToken = jwt_decode(token)
            const loginUserId = decodeToken.id
            
            const user = await User.findById(loginUserId)
            const { password, ...doc } = user._doc;
            return res.status(200).json({ ...doc })

        } catch (error) {
            console.log(error)
            return res.status(500).json({ message: "Lỗi xác thực" })
        }
    },
    updateAvatar: async (req, res) => {
        try {
            const token = req.headers.authorization?.split(" ")[1];
            const decodeToken = jwt_decode(token)
            const loginUserId = decodeToken.id
            console.log(loginUserId);
            if (!loginUserId) return res.status(400).json({ message: "Vui lòng đăng nhập!" });
            const loginUser = await User.findById(loginUserId);
            if (!loginUser) return res.status(400).json({ message: "Người dùng không tồn tại!" });
            const image = req.files.file //file ảnh
            const username = loginUser.username
            if (image) {
                let data = image.data.toString('base64')
                data = `data:${image.mimetype};base64,${data}`//chuyển sang data uri
                const upload = await cloudinary.uploader
                    .upload(data,
                        {
                            folder: "avatar/",
                            public_id: username
                        })

                const newUser = await User.findOneAndUpdate({ username }, { avatar: upload.secure_url }, { new: true })
                console.log(newUser)
                return res.status(200).json({ avatar: newUser.avatar })
            }
            else {
                return res.status(400).json({ message: "Không có hình ảnh tải lên" })
            }

        } catch (error) {
            console.log(error)
            return res.status(400).json({ message: "Lỗi cập nhật tài khoản" })
        }
    },
    resetAvatar: async (req, res) => {
        try {
            const token = req.headers.authorization?.split(" ")[1];
            const decodeToken = jwt_decode(token)
            const loginUserId = decodeToken.id
            console.log(loginUserId);
            if (!loginUserId) return res.status(400).json({ message: "Vui lòng đăng nhập!" });
            const loginUser = await User.findById(loginUserId);
            if (!loginUser) return res.status(400).json({ message: "Người dùng không tồn tại!" });

            const data = {
                avatar: DEFAULT_VALUES.AVATAR
            }
            try {
                const newUser = await User.findByIdAndUpdate(loginUserId, data, { new: true })
                return res.status(200).json({ avatar: newUser.avatar })
            }
            catch (error) {
                return res.status(400).json({ message: "Lỗi cập nhật tài khoản" })
            }

        } catch (error) {
            console.log(error)
            return res.status(400).json({ message: "Lỗi cập nhật tài khoản" })
        }
    },
    updateUser: async (req, res) => {
        try {
            const token = req.headers.authorization?.split(" ")[1];
            const decodeToken = jwt_decode(token)
            const loginUserId = decodeToken.id
            console.log(loginUserId);
            if (!loginUserId) return res.status(400).json({ message: "Vui lòng đăng nhập!" });
            const loginUser = await User.findById(loginUserId);
            if (!loginUser) return res.status(400).json({ message: "Người dùng không tồn tại!" });
            let { fullname} = req.body
            
            const data = {
                fullname
            }
            try {
                const newUser = await User.findByIdAndUpdate(loginUserId, data, { new: true })
                const { password, ...rest } = newUser._doc
                return res.status(200).json({ ...rest })
            }
            catch (error) {
                return res.status(400).json({ message: "Lỗi cập nhật tài khoản" })
            }

        } catch (error) {
            console.log(error)
            return res.status(400).json({ message: "Lỗi cập nhật tài khoản" })
        }
    },
    updateDeviceToken: async (req, res) => {
        try {
            const token = req.headers.authorization?.split(" ")[1];
            const decodeToken = jwt_decode(token)
            const loginUserId = decodeToken.id
            console.log(loginUserId);
            if (!loginUserId) return res.status(400).json({ message: "Vui lòng đăng nhập!" });
            const loginUser = await User.findById(loginUserId);
            if (!loginUser) return res.status(400).json({ message: "Người dùng không tồn tại!" });
            const deviceToken = req.body.deviceToken
            try {
                await User.findByIdAndUpdate(loginUserId, { deviceToken }, { strict: false })
                return res.status(200).json({ message: "Cập nhật device token thành công" })
            }
            catch (error) {
                return res.status(400).json({ message: "Cập nhật device token không thành công" })
            }

        } catch (error) {
            console.log(error)
            return res.status(400).json({ message: "Lỗi cập nhật tài khoản" })
        }
    },
    updatePassword: async (req, res) => {
        try {
            const token = req.headers.authorization?.split(" ")[1];
            const decodeToken = jwt_decode(token)
            const loginUserId = decodeToken.id
            console.log(loginUserId);
            if (!loginUserId) return res.status(400).json({ message: "Vui lòng đăng nhập!" });
            const loginUser = await User.findById(loginUserId);
            if (!loginUser) return res.status(400).json({ message: "Người dùng không tồn tại!" });
            const { password, newPassword, cfPassword } = req.body
            const username = loginUser.username
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(newPassword, salt);
            const data = {
                password: hash
            }
            const user = await User.findOne({ username })
            const auth = await bcrypt.compare(password, user.password)
            if (auth) {
                const newUser = await User.findOneAndUpdate({ username: username }, data, { new: true })
                if (newUser) {
                    return res.status(200).json({ message: "Cập nhật thành công" })
                }
                return res.status(400).json({ message: "Cập nhật không thành công" })
            }
            return res.status(400).json({ message: "Sai mật khẩu" })


        } catch (error) {
            console.log(error)
            return res.status(400).json({ message: "Lỗi cập nhật tài khoản" })
        }
    },
    updateRoles: async (req, res) => {
        try {
            const token = req.headers.authorization?.split(" ")[1];
            const decodeToken = jwt_decode(token)
            const loginUserId = decodeToken.id
            console.log(loginUserId);
            if (!loginUserId) return res.status(400).json({ message: "Vui lòng đăng nhập!" });
            const loginUser = await User.findById(loginUserId);
            if (!loginUser) return res.status(400).json({ message: "Người dùng không tồn tại!" });
            const username = loginUser.username
            const user = await User.findOneAndUpdate({ username }, { role: ROLES.ADMIN }, { new: true })
            if (user) {
                const { password, type, id, status, ...rest } = user._doc;
                return res.status(200).json({
                    message: "Cập nhật quyền thành công",
                    user: { ...rest }
                })

            }
            else
                return res.status(400).json({ message: "Không có username" })
        }
        catch (error) {
            console.log(error)
            return res.status(500).json({ message: "Lỗi cập nhật quyền tài khoản" })
        }
    },
    deleteAccount: async (req, res) => {
        try {
            const id = req.query.id;
            console.log(id)
            const deleteUser = await User.deleteOne({ _id: id })
            console.log(deleteUser)
            if (deleteUser)
                return res.status(200).json({ message: "Xoá thành công" })
            return res.status(400).json({ message: "Xoá thất bại" })
        }
        catch (error) {
            console.log(error)
            return res.status(500).json({ message: "Lỗi cập nhật quyền tài khoản" })
        }
    },


}
module.exports = { UserController }