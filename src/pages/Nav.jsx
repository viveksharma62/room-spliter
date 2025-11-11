import React from "react";
import { Link, useLocation } from "react-router-dom";

const Nav = ({ isLoggedIn }) => {
  const location = useLocation();

  const isActive = (path) => (location.pathname === path ? "active-link" : "");

  return (
    <nav className="navbar navbar-expand-lg sticky-top custom-navbar shadow-sm">
      <div className="container">
        {/* Brand */}
        <Link className="navbar-brand fw-bold fs-3 text-light" to="/">
          <span className="text-warning">⚡</span> ExpenseManager
        </Link>

        {/* Toggler for mobile */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Links */}
        <div
          className="collapse navbar-collapse justify-content-end"
          id="navbarNav"
        >
          <ul className="navbar-nav fw-medium">
            {/* Home always visible */}
            <li className="nav-item">
              <Link className={`nav-link ${isActive("/")}`} to="/">
                Home
              </Link>
            </li>

            {isLoggedIn && (
              <>
                <li className="nav-item">
                  <Link
                    className={`nav-link ${isActive("/add-expense")}`}
                    to="/add-expense"
                  >
                    Add Expense
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    className={`nav-link ${isActive("/daily-expense")}`}
                    to="/daily-expense"
                  >
                    Daily Expense
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    className={`nav-link ${isActive("/person-account")}`}
                    to="/person-account"
                  >
                    Person Account
                  </Link>
                </li>
              </>
            )}

            {!isLoggedIn && (
              <li className="nav-item">
                <Link
                  className="btn btn-light text-primary fw-bold px-4 ms-2 shadow-sm"
                  to="/login"
                >
                  Login
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* Custom CSS */}
      <style>{`
        .custom-navbar {
          background: linear-gradient(90deg, #0d6efd, #6610f2);
        }

        .nav-link {
          color: white !important;
          transition: color 0.3s ease, transform 0.2s ease;
        }
        .nav-link:hover {
          color: #ffc107 !important;
          transform: translateY(-2px);
        }
        .active-link {
          color: #ffc107 !important;
          font-weight: 600;
          border-bottom: 2px solid #ffc107;
        }
      `}</style>
    </nav>
  );
};

export default Nav;
