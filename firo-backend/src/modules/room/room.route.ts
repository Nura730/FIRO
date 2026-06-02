import { Router } from "express";

import { RoomController } from "./room.controller";
import {
  createRoomSchema,
  joinRoomSchema,
} from "./room.validation";

import { validate } from "../../middlewares/validate.middleware";
import { authenticate } from "../../middlewares/auth.middleware";
import { asyncHandler } from "../../utils/asyncHandler";

const router = Router();

router.post(
  "/create",
  authenticate,
  validate(createRoomSchema),
  asyncHandler(RoomController.createRoom)
);

router.post(
  "/join",
  authenticate,
  validate(joinRoomSchema),
  asyncHandler(RoomController.joinRoom)
);


router.get(
  "/my-rooms",
  authenticate,
  asyncHandler(RoomController.getMyRooms)
);

router.delete(
  "/:roomId/leave",
  authenticate,
  asyncHandler(RoomController.leaveRoom)
);

router.delete(
  "/:roomId",
  authenticate,
  asyncHandler(RoomController.deleteRoom)
);


router.get(
  "/:roomId",
  authenticate,
  asyncHandler(
    RoomController.getRoomDetails
  )
);
export default router;