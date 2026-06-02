import app from "./app";
import { env } from "./config/env";
import { connectDatabase } from "./config/database";

const PORT = env.PORT;

const startServer = async (): Promise<void> => {
  try {
    await connectDatabase();

    app.listen(PORT, () => {
      console.log(`
=================================
🚀 FIRO Backend Started
🌍 Environment: ${env.NODE_ENV}
📡 Port: ${PORT}
=================================
      `);
    });
  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
};

startServer();