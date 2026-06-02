import { Router } from "express";

import { AuthController } from "./auth.controller";
import {
  loginSchema,
  registerSchema,
} from "./auth.validation";

import { validate } from "../../middlewares/validate.middleware";
import { asyncHandler } from "../../utils/asyncHandler";

const router = Router();

router.post(
  "/register",
  validate(registerSchema),
  asyncHandler(AuthController.register)
);

router.post(
  "/login",
  validate(loginSchema),
  asyncHandler(AuthController.login)
);

export default router;