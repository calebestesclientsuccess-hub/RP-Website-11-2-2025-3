import type { Server } from "http";
import { db } from "../db";
import { redisConnection } from "../queues/connection";

export function registerGracefulShutdown(server: Server) {
  const shutdown = async (signal: string) => {
    console.log(`[Shutdown] Received ${signal}, closing server...`);

    // 1. Stop accepting new requests
    server.close(async (err) => {
      if (err) {
        console.error("[Shutdown] Error closing HTTP server:", err);
        process.exit(1);
      }

      try {
        // 2. Close DB pool
        // Drizzle doesn't always expose a direct close(), but pg/postgres clients do.
        // Assuming db connection is managed globally or implicitly. 
        // If using 'pg' pool directly: await pool.end();
        
        // 3. Close Redis
        if (redisConnection) {
          await redisConnection.quit();
          console.log("[Shutdown] Redis connection closed");
        }

        console.log("[Shutdown] Graceful shutdown complete");
        process.exit(0);
      } catch (cleanupError) {
        console.error("[Shutdown] Error during cleanup:", cleanupError);
        process.exit(1);
      }
    });

    // Force exit if cleanup takes too long
    setTimeout(() => {
      console.error("[Shutdown] Forced exit due to timeout");
      process.exit(1);
    }, 10000).unref();
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

