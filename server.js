// Custom Next.js server with Socket.io

import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server } from "socket.io";

const dev    = process.env.NODE_ENV !== "production";
const app    = next({ dev });
const handle = app.getRequestHandler();

// Track online users: userId -> socketId
const onlineUsers = new Map();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(httpServer, {
    cors: {
      origin:  process.env.NEXTAUTH_URL ?? "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  });

  // Make io + onlineUsers accessible globally for API routes
  global.io          = io;
  global.onlineUsers = onlineUsers;

  io.on("connection", (socket) => {
    console.log("[Socket] Connected:", socket.id);

    socket.on("identify", (userId) => {
      if (userId) {
        onlineUsers.set(userId, socket.id);
        socket.userId = userId;
        console.log("[Socket] User identified:", userId);
      }
    });

    socket.on("join-booking", (bookingId) => {
      socket.join(`booking:${bookingId}`);
      console.log("[Socket] Joined booking room:", bookingId);
    });

    socket.on("leave-booking", (bookingId) => {
      socket.leave(`booking:${bookingId}`);
      console.log("[Socket] Left booking room:", bookingId);
    });

    socket.on("typing", ({ bookingId, senderId, isTyping }) => {
      socket.to(`booking:${bookingId}`).emit("typing", { senderId, isTyping });
    });

    socket.on("disconnect", () => {
      if (socket.userId) {
        onlineUsers.delete(socket.userId);
        console.log("[Socket] User disconnected:", socket.userId);
      }
    });
  });

  io.sendNotification = (userId, notification) => {
    const socketId = onlineUsers.get(userId);
    if (socketId) {
      io.to(socketId).emit("notification", notification);
    }
  };

  httpServer.listen(3000, () => {
    console.log("> Ready on http://localhost:3000");
  });
});