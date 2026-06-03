import { z } from "zod";

const categories = [
  "RENT",
  "FOOD",
  "UTILITIES",
  "INTERNET",
  "TRANSPORT",
  "SHOPPING",
  "OTHER",
] as const;

export const createExpenseSchema = z.object({
  body: z.object({
    roomId: z.string(),
    title: z.string().min(1, "Title is required"),
    amount: z.number().positive("Amount must be positive"),
    category: z.enum(categories),
    splits: z.array(
      z.object({
        userId: z.string(),
        amount: z.number().nonnegative("Split amount cannot be negative"),
      })
    ),
    isSettlement: z.boolean().optional(),
  }),
});

export const updateExpenseSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Title is required"),
    amount: z.number().positive("Amount must be positive"),
    category: z.enum(categories),
    splits: z.array(
      z.object({
        userId: z.string(),
        amount: z.number().nonnegative("Split amount cannot be negative"),
      })
    ),
    isSettlement: z.boolean().optional(),
  }),
});