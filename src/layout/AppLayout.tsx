import { NavLink, Outlet } from "react-router-dom";

function AppLayout() {
  return (
    <div className="app">
      <nav className="navbar">
        <h2>Trackly</h2>

        <div className="nav-right">
          <NavLink to="/">Dashboard</NavLink>
          <NavLink to="/add-expense">Add Expense</NavLink>
          <NavLink to="/reports">Reports</NavLink>
        </div>
      </nav>

      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;