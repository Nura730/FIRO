import { Response } from "express";

import { RoomService } from "./room.service";
import { ApiResponse } from "../../utils/apiResponse";
import { AuthRequest } from "../../middlewares/auth.middleware";

export class RoomController {
  static async createRoom(
    req: AuthRequest,
    res: Response
  ): Promise<void> {
    const { name } = req.body;

    const room = await RoomService.createRoom(
      req.user!.userId,
      name
    );

    res.status(201).json(
      new ApiResponse(
        true,
        "Room created successfully",
        room
      )
    );
  }

  static async joinRoom(
    req: AuthRequest,
    res: Response
  ): Promise<void> {
    const { inviteCode } = req.body;

    const room = await RoomService.joinRoom(
      req.user!.userId,
      inviteCode
    );

    res.status(200).json(
      new ApiResponse(
        true,
        "Joined room successfully",
        room
      )
    );
  }



  static async getMyRooms(
  req: AuthRequest,
  res: Response
): Promise<void> {
  const rooms = await RoomService.getMyRooms(
    req.user!.userId
  );

  res.status(200).json(
    new ApiResponse(
      true,
      "Rooms fetched successfully",
      rooms
    )
  );
}

static async leaveRoom(
  req: AuthRequest,
  res: Response
): Promise<void> {
  const { roomId } = req.params as { roomId: string };

  await RoomService.leaveRoom(
    req.user!.userId,
    roomId
  );

  res.status(200).json(
    new ApiResponse(
      true,
      "Left room successfully"
    )
  );
}



static async deleteRoom(
  req: AuthRequest,
  res: Response
): Promise<void> {
  const { roomId } = req.params as { roomId: string };

  await RoomService.deleteRoom(
    req.user!.userId,
    roomId
  );

  res.status(200).json(
    new ApiResponse(
      true,
      "Room deleted successfully"
    )
  );
}


static async getRoomDetails(
  req: AuthRequest,
  res: Response
): Promise<void> {
  const { roomId } = req.params as { roomId: string };
  const room =
    await RoomService.getRoomDetails(
      roomId
    );

  res.status(200).json(
    new ApiResponse(
      true,
      "Room fetched successfully",
      room
    )
  );
}

static async removeMember(
  req: AuthRequest,
  res: Response
): Promise<void> {
  const { roomId, userId } = req.params as { roomId: string; userId: string };
  await RoomService.removeMember(
    req.user!.userId,
    roomId,
    userId
  );

  res.status(200).json(
    new ApiResponse(
      true,
      "Room member removed successfully"
    )
  );
}

static async transferOwnership(
  req: AuthRequest,
  res: Response
): Promise<void> {
  const { roomId } = req.params as { roomId: string };
  const { newOwnerId } = req.body as { newOwnerId: string };

  const room = await RoomService.transferOwnership(
    roomId,
    req.user!.userId,
    newOwnerId
  );

  res.status(200).json(
    new ApiResponse(
      true,
      "Ownership transferred successfully",
      room
    )
  );
}
}