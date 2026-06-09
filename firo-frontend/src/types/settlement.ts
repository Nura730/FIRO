export interface Settlement {
  from: {
    id: string;
    name: string;
    email: string;
  };
  to: {
    id: string;
    name: string;
    email: string;
  };
  amount: number;
}

export interface SettlementRoomData {
  roomId: string;
  totalExpenses: number;
  balances: {
    userId: string;
    name: string;
    email: string;
    balance: number;
  }[];
  settlements: Settlement[];
}