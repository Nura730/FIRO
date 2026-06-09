export interface Balance {
  userId: string;
  name: string;
  email: string;
  balance: number;
}

export interface RecentExpense {
  _id: string;
  title: string;
  amount: number;
  category: string;
  createdAt: string;
}

export interface DashboardData {
  roomId: string;
  roomName: string;
  memberCount: number;
  expenseCount: number;
  totalExpenses: number;
  totalSettlements: number;
  balances: Balance[];
  monthlyStatistics: {
    month: string;
    amount: number;
  }[];
  recentExpenses: RecentExpense[];
}