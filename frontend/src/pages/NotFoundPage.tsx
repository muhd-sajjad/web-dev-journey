import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <div className="hero">
      <h1>404</h1>
      <p>Page not found.</p>
      <Link to="/">Go back to Dashboard</Link>
    </div>
  );
}

export default NotFoundPage;