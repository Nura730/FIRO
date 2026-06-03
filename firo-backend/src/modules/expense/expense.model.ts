import mongoose, {
  Document,
  Schema,
  Types,
} from "mongoose";

export interface IExpenseSplit {
  userId: Types.ObjectId;
  amount: number;
}

export interface IExpense extends Document {
  roomId: Types.ObjectId;
  title: string;
  amount: number;
  category: string;
  paidBy: Types.ObjectId;
  createdBy: Types.ObjectId;
  splits: IExpenseSplit[];
  isSettlement: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const splitSchema = new Schema<IExpenseSplit>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    _id: false,
  }
);

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
    },

    amount: {
      type: Number,
      required: true,
    },

    category: {
      type: String,
      enum: [
        "RENT",
        "FOOD",
        "UTILITIES",
        "INTERNET",
        "TRANSPORT",
        "SHOPPING",
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

    splits: [splitSchema],

    isSettlement: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

expenseSchema.index({ roomId: 1, createdAt: -1 });
expenseSchema.index({ paidBy: 1 });

export const Expense =
  mongoose.model<IExpense>(
    "Expense",
    expenseSchema
  );