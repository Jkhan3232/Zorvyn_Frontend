import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./components/common/ProtectedRoute.jsx";
import { PublicRoute } from "./components/common/PublicRoute.jsx";
import { RoleRoute } from "./components/common/RoleRoute.jsx";
import { AdminPage } from "./pages/AdminPage.jsx";
import { DashboardPage } from "./pages/DashboardPage.jsx";
import { LoginPage } from "./pages/LoginPage.jsx";
import { NotFoundPage } from "./pages/NotFoundPage.jsx";
import { RegisterPage } from "./pages/RegisterPage.jsx";
import { RecordsPage } from "./pages/RecordsPage.jsx";

function App() {
  return (
    <Routes>
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />

        <Route
          element={
            <RoleRoute
              allowedRoles={["analyst", "admin"]}
              message="Only analyst and admin users can access records."
            />
          }
        >
          <Route path="/records" element={<RecordsPage />} />
        </Route>

        <Route
          element={
            <RoleRoute
              allowedRoles={["admin"]}
              message="Only admin users can access management controls."
            />
          }
        >
          <Route path="/admin" element={<AdminPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
