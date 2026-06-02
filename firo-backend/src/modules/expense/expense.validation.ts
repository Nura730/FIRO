import { z } from "zod";

export const createExpenseSchema = z.object({
  body: z.object({
    roomId: z.string(),
    title: z.string().min(2).max(100),
    amount: z.number().positive(),
    category: z.enum([
      "RENT",
      "FOOD",
      "EB",
      "WATER",
      "INTERNET",
      "OTHER",
    ]),
  }),
});