import { useSelector, useDispatch } from 'react-redux';
import { NavLink } from 'react-router-dom';
import { logout } from '../store/authSlice';
import { FaSignOutAlt } from 'react-icons/fa';

function Navbar() {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const closeNav = () => {
    const el = document.getElementById('mainNav');
    // Bootstrap 5 Collapse instance hide
    if (el && window.bootstrap) {
      const instance = window.bootstrap.Collapse.getOrCreateInstance(el, { toggle: false });
      instance.hide();
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-success sticky-top shadow-sm">
      <div className="container">
        <NavLink className="navbar-brand d-flex align-items-center gap-2" to="/">
          <span className="fw-semibold">Godbole Veggies & Fruits</span>
        </NavLink>
        {isAuthenticated && (
          <>
            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#mainNav"
              aria-controls="mainNav"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="mainNav">
              <ul className="navbar-nav ms-auto align-items-lg-center gap-lg-1">
                <li className="nav-item">
                  <NavLink onClick={closeNav} className={({ isActive }) => `nav-link${isActive ? ' active fw-semibold' : ''}`} to="/">
                    Dashboard
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink onClick={closeNav} className={({ isActive }) => `nav-link${isActive ? ' active fw-semibold' : ''}`} to="/pending-bills">
                    Pending Bills
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink onClick={closeNav} className={({ isActive }) => `nav-link${isActive ? ' active fw-semibold' : ''}`} to="/products">
                    Products
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink onClick={closeNav} className={({ isActive }) => `nav-link${isActive ? ' active fw-semibold' : ''}`} to="/new-bill">
                    New Bill
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink onClick={closeNav} className={({ isActive }) => `nav-link${isActive ? ' active fw-semibold' : ''}`} to="/history">
                    History
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink onClick={closeNav} className={({ isActive }) => `nav-link${isActive ? ' active fw-semibold' : ''}`} to="/reports">
                    Reports
                  </NavLink>
                </li>
                <li className="nav-item">
                  <button
                    className="btn btn-sm btn-outline-light ms-lg-2"
                    onClick={() => { closeNav(); dispatch(logout()); }}
                  >
                    <FaSignOutAlt className="me-2" /> Logout
                  </button>
                </li>
              </ul>
            </div>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
