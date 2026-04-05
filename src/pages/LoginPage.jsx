import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getFieldErrors, getReadableError } from "../api/client.js";
import { useAuth } from "../hooks/useAuth.js";
import { useToast } from "../hooks/useToast.js";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  async function handleSubmit(event) {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();
    const nextFieldErrors = {};

    if (!EMAIL_PATTERN.test(normalizedEmail)) {
      nextFieldErrors.email = "Please enter a valid email address.";
    }

    if (!password) {
      nextFieldErrors.password = "Password is required.";
    }

    if (Object.keys(nextFieldErrors).length) {
      setFieldErrors(nextFieldErrors);
      setError("");
      return;
    }

    setSubmitting(true);
    setError("");
    setFieldErrors({});

    try {
      await login(normalizedEmail, password);
      toast.success("Login successful.");

      const redirectTo = location.state?.from?.pathname || "/dashboard";
      navigate(redirectTo, { replace: true });
    } catch (requestError) {
      setFieldErrors(getFieldErrors(requestError));
      const message = getReadableError(requestError, "Unable to login now.");
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="login-shell">
      <section className="login-card">
        <p className="eyebrow">Finance Dashboard</p>
        <h2>Welcome back</h2>
        <p className="subtle">Login using your backend account credentials.</p>

        <form className="login-form" onSubmit={handleSubmit}>
          <label className="field">
            <span className="field-label">Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              aria-invalid={Boolean(fieldErrors.email)}
              required
            />
            {fieldErrors.email ? (
              <span className="helper-error">{fieldErrors.email}</span>
            ) : null}
          </label>

          <label className="field">
            <span className="field-label">Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              aria-invalid={Boolean(fieldErrors.password)}
              required
            />
            {fieldErrors.password ? (
              <span className="helper-error">{fieldErrors.password}</span>
            ) : null}
          </label>

          {error ? <p className="login-error">{error}</p> : null}

          <button type="submit" className="primary-btn" disabled={submitting}>
            {submitting ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="login-meta">
          <p>Roles supported: viewer, analyst, admin.</p>
          <p>Admin can access user management and record CRUD.</p>
        </div>

        <p className="auth-switch">
          New user?{" "}
          <Link className="auth-link" to="/register">
            Create account
          </Link>
        </p>
      </section>
    </main>
  );
}
