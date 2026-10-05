import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.tsx";
import DesktopPet from "../DesktopPet.tsx";

function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="app">
      <DesktopPet />
      <nav className="navbar">
        <h2>Trackly</h2>

        <div className="nav-right">
          <NavLink to="/">Dashboard</NavLink>
          <NavLink to="/add-expense">Add Expense</NavLink>
          <NavLink to="/reports">Reports</NavLink>
        </div>

        <div className="user-row">
          <span className="user-pill">{user?.name}</span>
          <button className="secondary-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;