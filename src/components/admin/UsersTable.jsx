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
  onEditUser,
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
                  <td data-label="Name">{user.name || "-"}</td>
                  <td data-label="Email">{user.email || "-"}</td>
                  <td data-label="Role">
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
                  <td data-label="Status">
                    <span
                      className={`tag tag-${user.isActive ? "income" : "expense"}`}
                    >
                      {user.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td data-label="Joined">{formatDate(user.createdAt)}</td>
                  <td data-label="Actions">
                    <div className="actions-row">
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

                      <button
                        type="button"
                        className="muted-btn"
                        onClick={() => onEditUser(user)}
                        disabled={rolePending || statusPending}
                      >
                        Edit
                      </button>
                    </div>
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
