import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <main className="not-found">
      <section className="panel">
        <p className="eyebrow">404</p>
        <h2>Page not found</h2>
        <p className="subtle">
          The route you opened does not exist. Use links below to continue.
        </p>

        <div
          className="actions-row"
          style={{ justifyContent: "center", marginTop: "14px" }}
        >
          <Link to="/dashboard" className="primary-btn">
            Dashboard
          </Link>
          <Link to="/records" className="muted-btn">
            Records
          </Link>
          <Link to="/login" className="ghost-btn">
            Login
          </Link>
        </div>
      </section>
    </main>
  );
}
