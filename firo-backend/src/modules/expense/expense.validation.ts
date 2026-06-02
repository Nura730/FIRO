import { z } from "zod";

export const createExpenseSchema = z.object({
  body: z.object({
    roomId: z.string(),

    title: z.string(),

    amount: z.number().positive(),

    category: z.enum([
      "RENT",
      "FOOD",
      "EB",
      "WATER",
      "INTERNET",
      "OTHER",
    ]),

    splits: z.array(
      z.object({
        userId: z.string(),
        amount: z.number().min(0),
      })
    ),
  }),
});