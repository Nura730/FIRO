import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { User, IUser } from "./auth.model";
import { env } from "../../config/env";
import { AppError } from "../../utils/appError";

export class AuthService {
  static async register(
    name: string,
    email: string,
    password: string
  ): Promise<IUser> {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw new AppError(
  "Email already registered",
  409
);
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    return user;
  }

  static async login(
    email: string,
    password: string
  ): Promise<{
    token: string;
    user: IUser;
  }> {
    const user = await User.findOne({ email });

    if (!user) {
      throw new AppError(
  "Invalid email or password",
  401
);
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordValid) {
      throw new AppError("Invalid email or password", 401);
    }

    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
      },
      env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    return {
      token,
      user,
    };
  }
}