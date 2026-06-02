import { Request, Response } from "express";

import { AuthService } from "./auth.service";
import { ApiResponse } from "../../utils/apiResponse";

export class AuthController {
  static async register(
    req: Request,
    res: Response
  ): Promise<void> {
    const { name, email, password } = req.body;

    const user = await AuthService.register(
      name,
      email,
      password
    );

    res.status(201).json(
      new ApiResponse(
        true,
        "User registered successfully",
        {
          id: user._id,
          name: user.name,
          email: user.email,
        }
      )
    );
  }

  static async login(
    req: Request,
    res: Response
  ): Promise<void> {
    const { email, password } = req.body;

    const result = await AuthService.login(
      email,
      password
    );

    res.status(200).json(
      new ApiResponse(
        true,
        "Login successful",
        {
          token: result.token,
          user: {
            id: result.user._id,
            name: result.user.name,
            email: result.user.email,
          },
        }
      )
    );
  }
}