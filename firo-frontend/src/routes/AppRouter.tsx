import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";

import HomePage from "../pages/HomePage";
import RoomsPage from "../pages/RoomsPage";
import ActivityPage from "../pages/ActivityPage";
import ProfilePage from "../pages/ProfilePage";
import AddExpensePage from "../pages/AddExpensePage";
import RoomDetailsPage from "../pages/RoomDetailsPage";
import ProtectedRoute from "./ProtectedRoute";
import AppLayout from "../layouts/AppLayout";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}

        <Route
          path="/"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />

        <Route
          path="/login"
          element={<LoginPage />}
        />

        <Route
          path="/register"
          element={<RegisterPage />}
        />

        {/* Protected Routes */}

        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route
            path="/home"
            element={<HomePage />}
          />

          <Route
            path="/rooms"
            element={<RoomsPage />}
          />

          <Route
            path="/activity"
            element={<ActivityPage />}
          />

          <Route
            path="/profile"
            element={<ProfilePage />}
          />

          <Route
            path="/expense/add"
            element={<AddExpensePage />}
          />
        </Route>

        <Route
          path="*"
          element={
            <Navigate
              to="/home"
              replace
            />
          }
        />
        <Route
  path="/rooms/:roomId"
  element={<RoomDetailsPage />}
/>
      </Routes>
    </BrowserRouter>
  );
}