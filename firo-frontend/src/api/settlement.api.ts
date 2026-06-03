import { api } from "./axios";

export const getSettlements = async (
  roomId: string
) => {
  const { data } = await api.get(
    `/settlements/room/${roomId}`
  );

  return data;
};