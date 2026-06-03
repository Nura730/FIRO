import { Router } from "express";

import { AuthController } from "./auth.controller";
import {
  loginSchema,
  registerSchema,
} from "./auth.validation";

import { validate } from "../../middlewares/validate.middleware";
import { asyncHandler } from "../../utils/asyncHandler";
import { rateLimiter } from "../../middlewares/rateLimiter.middleware";

const router = Router();

const registerLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Too many accounts created from this IP, please try again later.",
});

const loginLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: "Too many login attempts. Please try again later.",
});

router.post(
  "/register",
  registerLimiter,
  validate(registerSchema),
  asyncHandler(AuthController.register)
);

router.post(
  "/login",
  loginLimiter,
  validate(loginSchema),
  asyncHandler(AuthController.login)
);

export default router;