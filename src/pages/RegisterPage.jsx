import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getReadableError } from "../api/client.js";
import { useAuth } from "../hooks/useAuth.js";
import { useToast } from "../hooks/useToast.js";

export function RegisterPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Password and confirm password must match.");
      return;
    }

    setSubmitting(true);

    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
      });

      toast.success("Registration successful. Please login.");
      navigate("/login", { replace: true });
    } catch (requestError) {
      const message = getReadableError(
        requestError,
        "Unable to register at the moment.",
      );
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
        <h2>Create account</h2>
        <p className="subtle">Register with your backend credentials.</p>

        <form className="login-form" onSubmit={handleSubmit}>
          <label className="field">
            <span className="field-label">Name</span>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </label>

          <label className="field">
            <span className="field-label">Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>

          <label className="field">
            <span className="field-label">Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>

          <label className="field">
            <span className="field-label">Confirm Password</span>
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
            />
          </label>

          {error ? <p className="login-error">{error}</p> : null}

          <button type="submit" className="primary-btn" disabled={submitting}>
            {submitting ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account?{" "}
          <Link className="auth-link" to="/login">
            Back to login
          </Link>
        </p>
      </section>
    </main>
  );
}
