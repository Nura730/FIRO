export interface Room {
  _id: string;
  name: string;
  inviteCode: string;
  members: {
    userId: string;
    role: "OWNER" | "MEMBER";
  }[];
}