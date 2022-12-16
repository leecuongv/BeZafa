const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");

const {
  UserRoutes,
  AuthRoutes,
  SocialRoutes,
  BillRoutes,
  StatisticRoutes,
  UploadRoutes,
  ChatRoutes,
  MessageRoutes,
} = require("./routers");

const { notFound, errorHandler } = require("./routers/errorMiddleware");
const helmet = require("helmet");
//const passport = require('passport');
const rateLimit = require("express-rate-limit");
//const session = require('express-session');
const morgan = require("morgan");
const fileupload = require("express-fileupload");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const URI = process.env.MONGODB_URI;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true, limit: "5mb" })); //Giới hạn kích thước request gửi lên server phải nhỏ hơn 3mb
app.use(fileupload());

app.use(cors({ credentials: true, origin: true }));
app.use(cookieParser());
app.disable("x-powered-by"); //fix lỗi leak info from x-powered-by

app.use(helmet.frameguard()); //fix lỗi clickjacking
app.use(helmet.noSniff()); //fix lỗi X-Content-Type-Options Header Missing
app.use(helmet.xssFilter());
app.use(
  helmet.hsts({
    maxAge: 31000000,
    preload: true,
  })
);

app.use(
  helmet.contentSecurityPolicy({
    useDefaults: false,
    directives: {
      defaultSrc: ["'self'"], // default value for all directives that are absent
      scriptSrc: ["'self' https://maxcdn.bootstrapcdn.com"], // helps prevent XSS attacks
      frameAncestors: ["'self'"], // helps prevent Clickjacking attacks
      styleSrc: ["'self' https://maxcdn.bootstrapcdn.com"],
      fontSrc: ["'self' https://maxcdn.bootstrapcdn.com"],
      formAction: [
        "'self' http://localhost:5000 https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
      ],
      objectSrc: ["'none'"],
    },
  })
);


app.use(
  helmet.referrerPolicy({
    policy: ["no-referrer"],
  })
);

app.use(function (req, res, next) {
  res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
  res.header("Expires", "-1");
  res.header("Pragma", "no-cache");
  next();
});

mongoose
  .connect(URI)
  .then(async () => {
    console.log("Connected to Mongoose");
  })
  .catch((err) => {
    console.log("err connected", err);
  });

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} `);
});
app.get("/", (req, res) => {
  res.send("SUCCESS");
});

// app.use(passport.initialize());
// app.use(passport.session());
app.use(morgan("short"));
app.use("/api/auth", AuthRoutes);
app.use("/api/user", UserRoutes);
app.use("/api/social", SocialRoutes);
app.use("/api/payment", BillRoutes);
app.use("/api/upload", UploadRoutes);
app.use("/api/chat", ChatRoutes);
app.use("/api/message", MessageRoutes);

app.use(notFound);
app.use(errorHandler);

const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:3000",
     credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("Connected to socket.io");
  
  socket.on("setup", (userData) => {
    socket.join(userData._id);
    //console.log(userData);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User Joined Room: " + room);
  });
  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("new message", (newMessageReceived) => {
    console.error("newMessageReceived: "+ JSON.stringify(newMessageReceived))
    var chat = newMessageReceived.chat;


    if (!chat.users) return console.log("chat.users");

    chat.users.forEach((user) => {
      if (user._id == newMessageReceived.sender._id) return;

      socket.in(user._id).emit("message received", newMessageReceived);
    });
  });

  socket.off("setup", () => {
    console.log("USER DISCONNECTED");
    socket.leave(userData._id);
  });
});
