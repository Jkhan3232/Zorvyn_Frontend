import { formatDate, formatRole } from "../../lib/format.js";

const ROLES = ["viewer", "analyst", "admin"];

function getUserId(user) {
  return user?._id || user?.id;
}

export function UsersTable({
  users,
  pendingAction,
  onRoleChange,
  onStatusToggle,
}) {
  return (
    <section className="panel">
      <div className="panel-head">
        <h3>User Management</h3>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => {
              const userId = getUserId(user);
              const rolePending = pendingAction === `role-${userId}`;
              const statusPending = pendingAction === `status-${userId}`;

              return (
                <tr key={userId}>
                  <td>{user.name || "-"}</td>
                  <td>{user.email || "-"}</td>
                  <td>
                    <div className="actions-row">
                      <span
                        className={`role-pill role-${user.role || "viewer"}`}
                      >
                        {formatRole(user.role)}
                      </span>
                      <select
                        value={user.role || "viewer"}
                        onChange={(event) =>
                          onRoleChange(userId, event.target.value)
                        }
                        disabled={rolePending}
                      >
                        {ROLES.map((role) => (
                          <option key={role} value={role}>
                            {formatRole(role)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </td>
                  <td>
                    <span
                      className={`tag tag-${user.isActive ? "income" : "expense"}`}
                    >
                      {user.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>{formatDate(user.createdAt)}</td>
                  <td>
                    <button
                      type="button"
                      className="ghost-btn"
                      onClick={() => onStatusToggle(userId, !user.isActive)}
                      disabled={statusPending}
                    >
                      {statusPending
                        ? "Saving..."
                        : user.isActive
                          ? "Deactivate"
                          : "Activate"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
