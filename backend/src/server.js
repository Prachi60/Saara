import "dotenv/config";
import app from "./app.js";
import connectDB from "./config/db.js";
import { validateEnv } from "./config/env.js";
import { createServer } from "http";
import { initSocket } from "./services/socket.service.js";

const PORT = process.env.PORT || 5000;
const httpServer = createServer(app);

// Initialize Socket.io
initSocket(httpServer);

const startServer = async () => {
  try {
    validateEnv();
    await connectDB();
    
    httpServer.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`🚀 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`🔌 Socket.io initialized`);
    });
  } catch (error) {
    console.error("📦 Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();
