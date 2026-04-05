import { useCallback, useEffect, useState } from "react";
import { getFieldErrors, getReadableError } from "../api/client.js";
import { AdminRecordsTable } from "../components/admin/AdminRecordsTable.jsx";
import { AdminUserUpdateModal } from "../components/admin/AdminUserUpdateModal.jsx";
import { UsersTable } from "../components/admin/UsersTable.jsx";
import { ErrorState } from "../components/common/ErrorState.jsx";
import { LoadingState } from "../components/common/LoadingState.jsx";
import { RecordFormModal } from "../components/records/RecordFormModal.jsx";
import { useAuth } from "../hooks/useAuth.js";
import { useToast } from "../hooks/useToast.js";
import { formatRole } from "../lib/format.js";
import { registerUser } from "../services/authService.js";
import { updateAdminProfile } from "../services/adminService.js";
import { fetchOpenApiJson } from "../services/apiSchemaService.js";
import {
  createRecord,
  deleteRecord,
  fetchRecords,
  updateRecord,
} from "../services/recordsService.js";
import {
  fetchUsers,
  updateUserRole,
  updateUserStatus,
  updateUserWithAdminPayload,
} from "../services/usersService.js";

const USER_ROLES = ["viewer", "analyst", "admin"];

const CREATE_USER_INITIAL_FORM = {
  name: "",
  email: "",
  password: "",
  role: "viewer",
  isActive: true,
};

function getInitialProfileForm(user) {
  return {
    name: String(user?.name || ""),
    email: String(user?.email || ""),
    password: "",
  };
}

function getEntityId(entity) {
  return entity?._id || entity?.id;
}

function mergeUser(existingUser, incomingUser) {
  if (!incomingUser || typeof incomingUser !== "object") {
    return existingUser;
  }

  return {
    ...existingUser,
    ...incomingUser,
  };
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function buildAdminProfilePayload(form, currentUser) {
  const fieldErrors = {};
  const payload = {};

  const currentName = String(currentUser?.name || "").trim();
  const currentEmail = String(currentUser?.email || "")
    .trim()
    .toLowerCase();

  const nextName = String(form.name || "").trim();
  const nextEmail = String(form.email || "")
    .trim()
    .toLowerCase();
  const nextPassword = String(form.password || "");

  if (!nextName) {
    fieldErrors.name = "Name is required.";
  } else if (nextName.length < 2 || nextName.length > 100) {
    fieldErrors.name = "Name must be between 2 and 100 characters.";
  } else if (nextName !== currentName) {
    payload.name = nextName;
  }

  if (!nextEmail) {
    fieldErrors.email = "Email is required.";
  } else if (!isValidEmail(nextEmail)) {
    fieldErrors.email = "Please enter a valid email address.";
  } else if (nextEmail !== currentEmail) {
    payload.email = nextEmail;
  }

  if (nextPassword) {
    if (nextPassword.length < 6 || nextPassword.length > 50) {
      fieldErrors.password = "Password must be between 6 and 50 characters.";
    } else {
      payload.password = nextPassword;
    }
  }

  if (!Object.keys(payload).length && !Object.keys(fieldErrors).length) {
    fieldErrors.form = "Update at least one field before saving profile.";
  }

  return {
    payload,
    fieldErrors,
  };
}

function validateCreateUserForm(form) {
  const trimmedName = form.name.trim();
  const trimmedEmail = form.email.trim().toLowerCase();
  const passwordLength = form.password.length;

  if (trimmedName.length < 2 || trimmedName.length > 100) {
    return "Name must be between 2 and 100 characters.";
  }

  if (!isValidEmail(trimmedEmail)) {
    return "Please enter a valid email address.";
  }

  if (passwordLength < 6 || passwordLength > 50) {
    return "Password must be between 6 and 50 characters.";
  }

  if (!USER_ROLES.includes(form.role)) {
    return "Role must be viewer, analyst, or admin.";
  }

  return "";
}

export function AdminPage() {
  const { user: currentUser, updateUser } = useAuth();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [users, setUsers] = useState([]);
  const [records, setRecords] = useState([]);
  const [pendingUserAction, setPendingUserAction] = useState("");
  const [deletingRecordId, setDeletingRecordId] = useState("");
  const [recordModalOpen, setRecordModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [recordSubmitting, setRecordSubmitting] = useState(false);
  const [profileForm, setProfileForm] = useState(() =>
    getInitialProfileForm(currentUser),
  );
  const [profileFieldErrors, setProfileFieldErrors] = useState({});
  const [profileError, setProfileError] = useState("");
  const [profileSubmitting, setProfileSubmitting] = useState(false);
  const [schemaLoading, setSchemaLoading] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userUpdateError, setUserUpdateError] = useState("");
  const [userUpdateFieldErrors, setUserUpdateFieldErrors] = useState({});
  const [userUpdateSubmitting, setUserUpdateSubmitting] = useState(false);
  const [createUserForm, setCreateUserForm] = useState(
    CREATE_USER_INITIAL_FORM,
  );
  const [createUserError, setCreateUserError] = useState("");
  const [createUserSubmitting, setCreateUserSubmitting] = useState(false);

  const loadUsers = useCallback(async () => {
    const data = await fetchUsers();
    setUsers(data);
  }, []);

  const loadRecords = useCallback(async () => {
    const data = await fetchRecords({
      page: 1,
      limit: 20,
      sortBy: "createdAt",
      sortOrder: "desc",
    });

    setRecords(data.records);
  }, []);

  const loadAdminData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      await Promise.all([loadUsers(), loadRecords()]);
    } catch (requestError) {
      const message = getReadableError(
        requestError,
        "Failed to load admin data.",
      );
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [loadRecords, loadUsers, toast]);

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  useEffect(() => {
    setProfileForm(getInitialProfileForm(currentUser));
  }, [currentUser]);

  async function handleRoleChange(userId, role) {
    setPendingUserAction(`role-${userId}`);

    try {
      const response = await updateUserRole(userId, role);
      const updatedUser = response?.user || response;

      setUsers((prev) =>
        prev.map((user) => {
          const currentId = getEntityId(user);
          if (currentId !== userId) {
            return user;
          }

          return mergeUser(user, updatedUser);
        }),
      );

      if (getEntityId(currentUser) === userId) {
        updateUser(updatedUser);
      }

      toast.success("User role updated.");
    } catch (requestError) {
      toast.error(getReadableError(requestError, "Unable to update role."));
    } finally {
      setPendingUserAction("");
    }
  }

  async function handleStatusToggle(userId, isActive) {
    setPendingUserAction(`status-${userId}`);

    try {
      const response = await updateUserStatus(userId, isActive);
      const updatedUser = response?.user || response;

      setUsers((prev) =>
        prev.map((user) => {
          const currentId = getEntityId(user);
          if (currentId !== userId) {
            return user;
          }

          return mergeUser(user, updatedUser);
        }),
      );

      if (getEntityId(currentUser) === userId) {
        updateUser(updatedUser);
      }

      toast.success("User status updated.");
    } catch (requestError) {
      toast.error(getReadableError(requestError, "Unable to update status."));
    } finally {
      setPendingUserAction("");
    }
  }

  function handleProfileChange(event) {
    const { name, value } = event.target;

    setProfileForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function resetProfileForm() {
    setProfileForm(getInitialProfileForm(currentUser));
    setProfileFieldErrors({});
    setProfileError("");
  }

  async function handleProfileSubmit(event) {
    event.preventDefault();

    const { payload, fieldErrors } = buildAdminProfilePayload(
      profileForm,
      currentUser,
    );

    if (Object.keys(fieldErrors).length) {
      setProfileFieldErrors(fieldErrors);
      setProfileError(fieldErrors.form || "");
      return;
    }

    setProfileSubmitting(true);
    setProfileFieldErrors({});
    setProfileError("");

    try {
      const updatedUser = await updateAdminProfile(payload);

      if (updatedUser) {
        updateUser(updatedUser);

        setUsers((prev) =>
          prev.map((user) => {
            return getEntityId(user) === getEntityId(updatedUser)
              ? mergeUser(user, updatedUser)
              : user;
          }),
        );

        setProfileForm({
          name: updatedUser.name || profileForm.name,
          email: updatedUser.email || profileForm.email,
          password: "",
        });
      }

      toast.success("Profile updated successfully.");
    } catch (requestError) {
      setProfileFieldErrors(getFieldErrors(requestError));
      const message = getReadableError(
        requestError,
        "Unable to update admin profile.",
      );
      setProfileError(message);
      toast.error(message);
    } finally {
      setProfileSubmitting(false);
    }
  }

  async function handleFetchOpenApiSchema() {
    setSchemaLoading(true);

    try {
      const schema = await fetchOpenApiJson();
      const pathCount = Object.keys(schema?.paths || {}).length;
      toast.success(
        pathCount
          ? `OpenAPI schema loaded (${pathCount} paths).`
          : "OpenAPI schema loaded successfully.",
      );
    } catch (requestError) {
      toast.error(
        getReadableError(requestError, "Unable to fetch /swagger.json."),
      );
    } finally {
      setSchemaLoading(false);
    }
  }

  function openUserUpdateModal(user) {
    setEditingUser(user);
    setUserUpdateError("");
    setUserUpdateFieldErrors({});
  }

  function closeUserUpdateModal() {
    if (userUpdateSubmitting) {
      return;
    }

    setEditingUser(null);
    setUserUpdateError("");
    setUserUpdateFieldErrors({});
  }

  async function handleUserUpdateSubmit(payload) {
    const userId = getEntityId(editingUser);
    if (!userId) {
      return;
    }

    setUserUpdateSubmitting(true);
    setUserUpdateError("");
    setUserUpdateFieldErrors({});

    try {
      const updatedUser = await updateUserWithAdminPayload(userId, payload);

      setUsers((prev) =>
        prev.map((user) => {
          return getEntityId(user) === userId
            ? mergeUser(user, updatedUser)
            : user;
        }),
      );

      if (getEntityId(currentUser) === userId) {
        updateUser(updatedUser);
      }

      toast.success("User updated successfully.");
      closeUserUpdateModal();
    } catch (requestError) {
      setUserUpdateFieldErrors(getFieldErrors(requestError));
      const message = getReadableError(requestError, "Unable to update user.");
      setUserUpdateError(message);
      toast.error(message);
    } finally {
      setUserUpdateSubmitting(false);
    }
  }

  function handleCreateUserChange(event) {
    const { name, value, checked, type } = event.target;
    setCreateUserForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function resetCreateUserForm() {
    setCreateUserForm(CREATE_USER_INITIAL_FORM);
    setCreateUserError("");
  }

  async function resolveCreatedUserId(registerResult, email) {
    const candidates = [
      registerResult?.user,
      registerResult?.data?.user,
      registerResult?.data,
      registerResult,
    ];

    for (const candidate of candidates) {
      const userId = getEntityId(candidate);
      if (userId) {
        return userId;
      }
    }

    const latestUsers = await fetchUsers();
    setUsers(latestUsers);

    const matchedUser = latestUsers.find((user) => {
      return String(user?.email || "").toLowerCase() === email;
    });

    return getEntityId(matchedUser);
  }

  async function handleCreateUserSubmit(event) {
    event.preventDefault();
    const validationError = validateCreateUserForm(createUserForm);

    if (validationError) {
      setCreateUserError(validationError);
      return;
    }

    setCreateUserError("");
    setCreateUserSubmitting(true);

    const payload = {
      name: createUserForm.name.trim(),
      email: createUserForm.email.trim().toLowerCase(),
      password: createUserForm.password,
    };

    try {
      const registerResult = await registerUser(payload);

      const shouldUpdateRole = createUserForm.role !== "viewer";
      const shouldDeactivate = !createUserForm.isActive;
      const needsAdditionalUpdate = shouldUpdateRole || shouldDeactivate;

      if (needsAdditionalUpdate) {
        const userId = await resolveCreatedUserId(
          registerResult,
          payload.email,
        );

        if (!userId) {
          await loadUsers();
          resetCreateUserForm();
          toast.info(
            "User created. Role/status update could not auto-complete, please update from user list.",
          );
          return;
        }

        if (shouldUpdateRole) {
          await updateUserRole(userId, createUserForm.role);
        }

        if (shouldDeactivate) {
          await updateUserStatus(userId, false);
        }
      }

      await loadUsers();
      resetCreateUserForm();

      toast.success(
        needsAdditionalUpdate
          ? "User created and access configured."
          : "User created successfully.",
      );
    } catch (requestError) {
      const message = getReadableError(requestError, "Unable to create user.");
      setCreateUserError(message);
      toast.error(message);
    } finally {
      setCreateUserSubmitting(false);
    }
  }

  function openCreateRecord() {
    setEditingRecord(null);
    setRecordModalOpen(true);
  }

  function openEditRecord(record) {
    setEditingRecord(record);
    setRecordModalOpen(true);
  }

  function closeRecordModal() {
    setRecordModalOpen(false);
    setEditingRecord(null);
  }

  async function handleRecordSubmit(payload) {
    setRecordSubmitting(true);

    try {
      if (editingRecord) {
        await updateRecord(getEntityId(editingRecord), payload);
        toast.success("Record updated.");
      } else {
        await createRecord(payload);
        toast.success("Record created.");
      }

      closeRecordModal();
      await loadRecords();
    } catch (requestError) {
      toast.error(getReadableError(requestError, "Unable to save record."));
    } finally {
      setRecordSubmitting(false);
    }
  }

  async function handleDeleteRecord(record) {
    const recordId = getEntityId(record);
    if (!recordId) {
      return;
    }

    const shouldDelete = window.confirm(
      "Delete this record? Backend may soft-delete based on implementation.",
    );
    if (!shouldDelete) {
      return;
    }

    setDeletingRecordId(recordId);

    try {
      await deleteRecord(recordId);
      toast.success("Record deleted.");
      await loadRecords();
    } catch (requestError) {
      toast.error(getReadableError(requestError, "Unable to delete record."));
    } finally {
      setDeletingRecordId("");
    }
  }

  if (loading) {
    return <LoadingState label="Loading admin controls..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadAdminData} />;
  }

  return (
    <>
      <section className="page-head">
        <div>
          <p className="eyebrow">Admin</p>
          <h2>Admin Control Center</h2>
          <p className="subtle">
            Manage users, role access, status, and record CRUD operations.
          </p>
        </div>

        <div className="actions-row">
          <button
            type="button"
            className="ghost-btn"
            onClick={handleFetchOpenApiSchema}
            disabled={schemaLoading}
          >
            {schemaLoading ? "Loading schema..." : "Fetch API Schema"}
          </button>

          <button
            type="button"
            className="primary-btn"
            onClick={openCreateRecord}
          >
            Create Record
          </button>
        </div>
      </section>

      <section className="panel">
        <div className="panel-head">
          <h3>Update My Admin Profile</h3>
          <p className="subtle">Update name, email, and optionally password.</p>
        </div>

        <form className="admin-user-form" onSubmit={handleProfileSubmit}>
          <label className="field">
            <span className="field-label">Name</span>
            <input
              type="text"
              name="name"
              value={profileForm.name}
              onChange={handleProfileChange}
              minLength={2}
              maxLength={100}
              required
            />
            {profileFieldErrors.name ? (
              <span className="helper-error">{profileFieldErrors.name}</span>
            ) : null}
          </label>

          <label className="field">
            <span className="field-label">Email</span>
            <input
              type="email"
              name="email"
              value={profileForm.email}
              onChange={handleProfileChange}
              required
            />
            {profileFieldErrors.email ? (
              <span className="helper-error">{profileFieldErrors.email}</span>
            ) : null}
          </label>

          <label className="field">
            <span className="field-label">New Password (optional)</span>
            <input
              type="password"
              name="password"
              value={profileForm.password}
              onChange={handleProfileChange}
              minLength={6}
              maxLength={50}
              placeholder="Leave blank to keep existing password"
            />
            {profileFieldErrors.password ? (
              <span className="helper-error">
                {profileFieldErrors.password}
              </span>
            ) : null}
          </label>

          {profileError ? (
            <p className="helper-error full-col">{profileError}</p>
          ) : null}

          <div className="actions-row full-col">
            <button
              type="submit"
              className="primary-btn"
              disabled={profileSubmitting}
            >
              {profileSubmitting ? "Updating..." : "Update Profile"}
            </button>

            <button
              type="button"
              className="muted-btn"
              onClick={resetProfileForm}
              disabled={profileSubmitting}
            >
              Reset
            </button>
          </div>
        </form>
      </section>

      <section className="panel">
        <div className="panel-head">
          <h3>Create User</h3>
          <p className="subtle">Add viewer, analyst, or admin from frontend.</p>
        </div>

        <form className="admin-user-form" onSubmit={handleCreateUserSubmit}>
          <label className="field">
            <span className="field-label">Name</span>
            <input
              type="text"
              name="name"
              value={createUserForm.name}
              onChange={handleCreateUserChange}
              minLength={2}
              maxLength={100}
              required
            />
          </label>

          <label className="field">
            <span className="field-label">Email</span>
            <input
              type="email"
              name="email"
              value={createUserForm.email}
              onChange={handleCreateUserChange}
              required
            />
          </label>

          <label className="field">
            <span className="field-label">Password</span>
            <input
              type="password"
              name="password"
              value={createUserForm.password}
              onChange={handleCreateUserChange}
              minLength={6}
              maxLength={50}
              required
            />
          </label>

          <label className="field">
            <span className="field-label">Role</span>
            <select
              name="role"
              value={createUserForm.role}
              onChange={handleCreateUserChange}
            >
              {USER_ROLES.map((role) => (
                <option key={role} value={role}>
                  {formatRole(role)}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span className="field-label">Status</span>
            <span className="checkbox-row">
              <input
                type="checkbox"
                name="isActive"
                checked={createUserForm.isActive}
                onChange={handleCreateUserChange}
              />
              Active user
            </span>
          </label>

          {createUserError ? (
            <p className="helper-error full-col">{createUserError}</p>
          ) : null}

          <div className="actions-row full-col">
            <button
              type="submit"
              className="primary-btn"
              disabled={createUserSubmitting}
            >
              {createUserSubmitting ? "Creating..." : "Create User"}
            </button>
            <button
              type="button"
              className="muted-btn"
              onClick={resetCreateUserForm}
              disabled={createUserSubmitting}
            >
              Reset
            </button>
          </div>
        </form>
      </section>

      <UsersTable
        users={users}
        pendingAction={pendingUserAction}
        onRoleChange={handleRoleChange}
        onStatusToggle={handleStatusToggle}
        onEditUser={openUserUpdateModal}
      />

      <AdminRecordsTable
        records={records}
        deletingRecordId={deletingRecordId}
        onEdit={openEditRecord}
        onDelete={handleDeleteRecord}
      />

      {recordModalOpen ? (
        <RecordFormModal
          key={editingRecord ? getEntityId(editingRecord) : "new-record"}
          initialValues={editingRecord}
          isSubmitting={recordSubmitting}
          onCancel={closeRecordModal}
          onSubmit={handleRecordSubmit}
        />
      ) : null}

      {editingUser ? (
        <AdminUserUpdateModal
          key={getEntityId(editingUser) || "edit-user"}
          user={editingUser}
          isSubmitting={userUpdateSubmitting}
          apiFieldErrors={userUpdateFieldErrors}
          apiError={userUpdateError}
          onCancel={closeUserUpdateModal}
          onSubmit={handleUserUpdateSubmit}
        />
      ) : null}
    </>
  );
}
