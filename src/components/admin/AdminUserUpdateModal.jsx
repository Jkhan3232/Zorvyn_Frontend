import { useMemo, useState } from "react";
import { formatRole } from "../../lib/format.js";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USER_ROLES = ["viewer", "analyst", "admin"];
const USER_STATUSES = ["active", "inactive"];

function getInitialForm(user) {
  return {
    name: String(user?.name || ""),
    email: String(user?.email || ""),
    role: USER_ROLES.includes(user?.role) ? user.role : "viewer",
    status: user?.isActive === false ? "inactive" : "active",
  };
}

function validateForm(form) {
  const errors = {};
  const name = String(form.name || "").trim();
  const email = String(form.email || "")
    .trim()
    .toLowerCase();

  if (name.length < 2 || name.length > 100) {
    errors.name = "Name must be between 2 and 100 characters.";
  }

  if (!EMAIL_PATTERN.test(email)) {
    errors.email = "Please enter a valid email address.";
  }

  if (!USER_ROLES.includes(form.role)) {
    errors.role = "Role must be viewer, analyst, or admin.";
  }

  if (!USER_STATUSES.includes(form.status)) {
    errors.status = "Status must be active or inactive.";
  }

  return errors;
}

function getUserId(user) {
  return user?._id || user?.id;
}

export function AdminUserUpdateModal({
  user,
  isSubmitting,
  apiFieldErrors,
  apiError,
  onCancel,
  onSubmit,
}) {
  const [form, setForm] = useState(() => getInitialForm(user));
  const [fieldErrors, setFieldErrors] = useState({});

  const mergedErrors = useMemo(() => {
    return {
      ...fieldErrors,
      ...(apiFieldErrors || {}),
    };
  }, [apiFieldErrors, fieldErrors]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    const validationErrors = validateForm(form);
    if (Object.keys(validationErrors).length) {
      setFieldErrors(validationErrors);
      return;
    }

    setFieldErrors({});
    onSubmit({
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      role: form.role,
      status: form.status,
    });
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <form className="modal-card" onSubmit={handleSubmit}>
        <div className="panel-head">
          <div>
            <h3>Update User</h3>
            <p className="subtle">User id: {getUserId(user) || "Unknown"}</p>
          </div>
          <button
            type="button"
            className="ghost-btn"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Close
          </button>
        </div>

        <div className="modal-grid">
          <label className="field">
            <span className="field-label">Name</span>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              minLength={2}
              maxLength={100}
              required
            />
            {mergedErrors.name ? (
              <span className="helper-error">{mergedErrors.name}</span>
            ) : null}
          </label>

          <label className="field">
            <span className="field-label">Email</span>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
            />
            {mergedErrors.email ? (
              <span className="helper-error">{mergedErrors.email}</span>
            ) : null}
          </label>

          <label className="field">
            <span className="field-label">Role</span>
            <select name="role" value={form.role} onChange={handleChange}>
              {USER_ROLES.map((role) => (
                <option key={role} value={role}>
                  {formatRole(role)}
                </option>
              ))}
            </select>
            {mergedErrors.role ? (
              <span className="helper-error">{mergedErrors.role}</span>
            ) : null}
          </label>

          <label className="field">
            <span className="field-label">Status</span>
            <select name="status" value={form.status} onChange={handleChange}>
              {USER_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status === "active" ? "Active" : "Inactive"}
                </option>
              ))}
            </select>
            {mergedErrors.status ? (
              <span className="helper-error">{mergedErrors.status}</span>
            ) : null}
          </label>

          {apiError ? (
            <p className="helper-error full-col">{apiError}</p>
          ) : null}

          <div className="actions-row full-col">
            <button
              type="submit"
              className="primary-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save User"}
            </button>
            <button
              type="button"
              className="muted-btn"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
