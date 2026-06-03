import mongoose, {
  Document,
  Schema,
  Types,
} from "mongoose";

export interface IRoomMember {
  userId: Types.ObjectId;
  role: "OWNER" | "MEMBER";
  joinedAt: Date;
}

export interface IRoom extends Document {
  name: string;
  inviteCode: string;
  ownerId: Types.ObjectId;
  members: IRoomMember[];
  createdAt: Date;
  updatedAt: Date;
}

const roomMemberSchema = new Schema<IRoomMember>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    role: {
      type: String,
      enum: ["OWNER", "MEMBER"],
      required: true,
    },

    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: false,
  }
);

const roomSchema = new Schema<IRoom>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    inviteCode: {
      type: String,
      required: true,
      unique: true,
    },

    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    members: [roomMemberSchema],
  },
  {
    timestamps: true,
  }
);

roomSchema.index({ "members.userId": 1 });

export const Room = mongoose.model<IRoom>(
  "Room",
  roomSchema
);