import { api } from "./axios";

export const getDashboard = async (
  roomId: string
) => {
  const { data } = await api.get(
    `/dashboard/room/${roomId}`
  );

  return data;
};