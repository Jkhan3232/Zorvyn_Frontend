import { Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";

export function RoleRoute({ allowedRoles = [], message }) {
  const { role } = useAuth();

  if (!allowedRoles.includes(role)) {
    return (
      <section className="state-card state-error">
        <h3>Access denied</h3>
        <p>{message || "You do not have permission to access this section."}</p>
      </section>
    );
  }

  return <Outlet />;
}
