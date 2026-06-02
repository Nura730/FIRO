import { z } from "zod";

export const createRoomSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(3, "Room name must be at least 3 characters")
      .max(100, "Room name cannot exceed 100 characters"),
  }),
});

export const joinRoomSchema = z.object({
  body: z.object({
    inviteCode: z
      .string()
      .min(6, "Invalid invite code")
      .max(20, "Invalid invite code"),
  }),
});