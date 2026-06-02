import mongoose, {
  Document,
  Schema,
  Types,
} from "mongoose";

export interface IExpense extends Document {
  roomId: Types.ObjectId;
  title: string;
  amount: number;
  category: string;
  paidBy: Types.ObjectId;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const expenseSchema = new Schema<IExpense>(
  {
    roomId: {
      type: Schema.Types.ObjectId,
      ref: "Room",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 1,
    },

    category: {
      type: String,
      enum: [
        "RENT",
        "FOOD",
        "EB",
        "WATER",
        "INTERNET",
        "OTHER",
      ],
      default: "OTHER",
    },

    paidBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Expense =
  mongoose.model<IExpense>(
    "Expense",
    expenseSchema
  );