export interface RoomMember {
  userId: string;
  role: "OWNER" | "MEMBER";
  joinedAt: string;
}

export interface Room {
  _id: string;
  name: string;
  inviteCode: string;
  ownerId: string;
  members: RoomMember[];
  createdAt: string;
  updatedAt: string;
}

export interface RoomsResponse {
  success: boolean;
  message: string;
  data: Room[];
}