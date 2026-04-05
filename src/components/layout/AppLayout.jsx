import { NavLink } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import { formatRole } from "../../lib/format.js";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/records", label: "Records", recordsOnly: true },
  { to: "/admin", label: "Admin", adminOnly: true },
];

function getInitials(name) {
  if (!name) {
    return "U";
  }

  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function AppLayout({ children }) {
  const { user, role, isAdmin, canReadRecords, logout } = useAuth();

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-wrap">
          <img className="brand-mark" src="/Favicon.png" alt="ZF Logo" />
          <div>
            <h1>Finance Control Desk</h1>
            <p>Connected to live backend APIs</p>
          </div>
        </div>

        <nav className="nav-links" aria-label="Main navigation">
          {NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin).map(
            (item) => {
              if (item.recordsOnly && !canReadRecords) {
                return null;
              }

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `nav-link${isActive ? " nav-link-active" : ""}`
                  }
                >
                  {item.label}
                </NavLink>
              );
            },
          )}
        </nav>

        <div className="user-meta">
          <div className="user-avatar">{getInitials(user?.name)}</div>
          <div>
            <strong>{user?.name || "Unknown user"}</strong>
            <p>{user?.email || "No email"}</p>
          </div>
          <span className={`role-pill role-${role}`}>{formatRole(role)}</span>
          <button type="button" className="ghost-btn" onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      <main className="main-content">{children}</main>
    </div>
  );
}
