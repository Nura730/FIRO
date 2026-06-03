import { api } from "./axios";

export const createRoom = async (name: string) => {
  const { data } = await api.post("/rooms/create", {
    name,
  });
  return data;
};

export const joinRoom = async (inviteCode: string) => {
  const { data } = await api.post("/rooms/join", {
    inviteCode,
  });
  return data;
};

export const getMyRooms = async () => {
  const { data } = await api.get("/rooms/my-rooms");
  return data;
};

export const leaveRoom = async (roomId: string) => {
  const { data } = await api.delete(`/rooms/${roomId}/leave`);
  return data;
};

export const deleteRoom = async (roomId: string) => {
  const { data } = await api.delete(`/rooms/${roomId}`);
  return data;
};

export const getRoomMembers = async (roomId: string) => {
  const { data } = await api.get(`/rooms/${roomId}`);
  return data;
};

export const removeRoomMember = async (roomId: string, userId: string) => {
  const { data } = await api.delete(`/rooms/${roomId}/members/${userId}`);
  return data;
};

export const transferRoomOwnership = async (roomId: string, newOwnerId: string) => {
  const { data } = await api.post(`/rooms/${roomId}/transfer`, {
    newOwnerId,
  });
  return data;
};