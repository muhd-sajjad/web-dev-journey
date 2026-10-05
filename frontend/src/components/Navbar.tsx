function Navbar() {
  return (
    <nav className="navbar">
      <h1 data-trackly-logo>
      Trackly
      </h1>
      <div className="nav-right">
        <span>Dashboard</span>
        <span>Expenses</span>
      </div>
    </nav>
  );
}

export default Navbar;