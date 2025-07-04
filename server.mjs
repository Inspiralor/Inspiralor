import express from "express";
import next from "next";
import http from "http";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();
  const httpServer = http.createServer(server);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);
    socket.on("join", (room) => {
      socket.join(room);
      console.log(`User ${socket.id} joined room ${room}`);
    });
    socket.on("leave", (room) => {
      socket.leave(room);
      console.log(`User ${socket.id} left room ${room}`);
    });
    socket.on("chat message", (msg) => {
      // If msg.room is set, emit only to that room
      if (msg.room) {
        io.to(msg.room).emit("chat message", msg);
      } else {
        io.emit("chat message", msg);
      }
    });
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  // Let Next.js handle all other routes
  server.use((req, res) => {
    return handle(req, res);
  });

  const PORT = process.env.PORT || 3000;
  httpServer.listen(PORT, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${PORT}`);
  });
});
