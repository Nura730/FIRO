import { Request, Response, NextFunction } from "express";

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const memoryStore = new Map<string, RateLimitRecord>();

export const rateLimiter = (options: {
  windowMs: number;
  max: number;
  message: string;
}) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (process.env.NODE_ENV === "test") {
      next();
      return;
    }

    const ip = req.ip || req.socket.remoteAddress || "unknown";
    // Group limit by path + IP
    const key = `${req.path}_${ip}`;
    const now = Date.now();

    let record = memoryStore.get(key);

    if (!record || now > record.resetTime) {
      record = {
        count: 1,
        resetTime: now + options.windowMs,
      };
      memoryStore.set(key, record);
      next();
      return;
    }

    record.count++;

    if (record.count > options.max) {
      res.status(429).json({
        success: false,
        message: options.message,
      });
      return;
    }

    next();
  };
};
