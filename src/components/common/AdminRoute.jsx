import { Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";

export function AdminRoute() {
  const { isAdmin } = useAuth();

  if (!isAdmin) {
    return (
      <section className="state-card state-error">
        <h3>Access denied</h3>
        <p>You need admin role to view this page.</p>
      </section>
    );
  }

  return <Outlet />;
}
