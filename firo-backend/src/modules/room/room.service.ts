import { Types } from "mongoose";

import { Room, IRoom } from "./room.model";
import { AppError } from "../../utils/appError";
import { generateInviteCode } from "./room.utils";




export class RoomService {
  static async createRoom(
    userId: string,
    name: string
  ): Promise<IRoom> {
    let inviteCode = generateInviteCode();

    while (
      await Room.findOne({
        inviteCode,
      })
    ) {
      inviteCode = generateInviteCode();
    }

    const room = await Room.create({
      name,
      inviteCode,
      ownerId: new Types.ObjectId(userId),

      members: [
        {
          userId: new Types.ObjectId(userId),
          role: "OWNER",
        },
      ],
    });

    return room;
  }

  static async joinRoom(
    userId: string,
    inviteCode: string
  ): Promise<IRoom> {
    const room = await Room.findOne({
      inviteCode,
    });

    if (!room) {
      throw new AppError(
        "Invalid invite code",
        404
      );
    }

    const alreadyJoined =
      room.members.some(
        (member) =>
          member.userId.toString() === userId
      );

    if (alreadyJoined) {
      throw new AppError(
        "Already a room member",
        409
      );
    }

    room.members.push({
      userId: new Types.ObjectId(userId),
      role: "MEMBER",
      joinedAt: new Date(),
    });

    await room.save();

    return room;
  }


  static async getMyRooms(userId: string) {
  const rooms = await Room.find({
    "members.userId": userId,
  });

  return rooms;
}



static async leaveRoom(
  userId: string,
  roomId: string
): Promise<void> {
  const room = await Room.findById(roomId);

  if (!room) {
    throw new AppError(
      "Room not found",
      404
    );
  }

  const member = room.members.find(
    (m) => m.userId.toString() === userId
  );

  if (!member) {
    throw new AppError(
      "You are not a member of this room",
      403
    );
  }

  if (room.ownerId.toString() === userId) {
    throw new AppError(
      "Owner cannot leave the room. Transfer ownership or delete the room.",
      400
    );
  }

  room.members = room.members.filter(
    (m) => m.userId.toString() !== userId
  );

  await room.save();
}

static async getRoomDetails(
  roomId: string
) {
  const room = await Room.findById(roomId)
    .populate(
      "members.userId",
      "name email"
    );

  if (!room) {
    throw new AppError(
      "Room not found",
      404
    );
  }

  return room;
}

static async deleteRoom(
  userId: string,
  roomId: string
): Promise<void> {
  const room = await Room.findById(roomId);

  if (!room) {
    throw new AppError(
      "Room not found",
      404
    );
  }

  if (room.ownerId.toString() !== userId) {
    throw new AppError(
      "Only room owner can delete the room",
      403
    );
  }

  await Room.findByIdAndDelete(roomId);
}


static async transferOwnership(
  roomId: string,
  ownerId: string,
  newOwnerId: string
) {
  const room =
    await Room.findById(roomId);

  if (!room) {
    throw new AppError(
      "Room not found",
      404
    );
  }

  if (
    room.ownerId.toString() !==
    ownerId
  ) {
    throw new AppError(
      "Only owner can transfer ownership",
      403
    );
  }

  room.ownerId =
    new Types.ObjectId(
      newOwnerId
    );

  room.members.forEach(
    (member) => {
      if (
        member.userId.toString() ===
        newOwnerId
      ) {
        member.role = "OWNER";
      }

      if (
        member.userId.toString() ===
        ownerId
      ) {
        member.role = "MEMBER";
      }
    }
  );

  await room.save();

  return room;
}
}