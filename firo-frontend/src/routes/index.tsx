import { Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "../features/auth/pages/LoginPage";
import RegisterPage from "../features/auth/pages/RegisterPage";
import RoomSelectionPage from "../features/rooms/pages/RoomSelectionPage";
import CreateRoomPage from "../features/rooms/pages/CreateRoomPage";
import JoinRoomPage from "../features/rooms/pages/JoinRoomPage";
import DashboardPage from "../features/dashboard/pages/DashboardPage";
import ExpensesPage from "../features/expenses/pages/ExpensesPage";
import SettlementsPage from "../features/settlements/pages/SettlementsPage";
import AppLayout from "../components/layout/AppLayout";

import { useAuth } from "../providers/AuthProvider";
import { useRoom } from "../providers/RoomProvider";

export default function AppRoutes() {
  const { token } = useAuth();
  const { room } = useRoom();

  // Not logged in → auth routes
  if (!token) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // Logged in with token → wrap layout & guard room details inside layout
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/expenses" element={<ExpensesPage />} />
        <Route path="/settlements" element={<SettlementsPage />} />
        <Route path="/rooms" element={<RoomSelectionPage />} />
      </Route>

      <Route path="/rooms/create" element={<CreateRoomPage />} />
      <Route path="/rooms/join" element={<JoinRoomPage />} />

      <Route
        path="*"
        element={<Navigate to={room ? "/dashboard" : "/rooms"} replace />}
      />
    </Routes>
  );
}