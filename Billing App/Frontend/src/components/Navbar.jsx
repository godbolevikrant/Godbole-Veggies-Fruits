import { useSelector, useDispatch } from 'react-redux';
import { NavLink } from 'react-router-dom';
import { logout } from '../store/authSlice';
import { FaSignOutAlt } from 'react-icons/fa';
import Logo from '../assets/NewLogo.png'; 

function Navbar() {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-danger">
      <div className="container-fluid">
        <NavLink className="navbar-brand fw-light" to="/">
  Godbole Veggies & Fruits
</NavLink>
        {isAuthenticated && (
          <>
            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarNav"
            >
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarNav">
              <ul className="navbar-nav ms-auto">
                <li className="nav-item">
                  <NavLink className="nav-link" to="/">
                    Dashboard
                  </NavLink>
                </li>
                <li className="nav-item">
  <NavLink className="nav-link" to="/pending-bills">
    Pending Bills
  </NavLink>
</li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/products">
                    Products
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/new-bill">
                    New Bill
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/history">
                    History
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/reports">
                    Reports
                  </NavLink>
                </li>
                <li className="nav-item">
                  <button
                    className="nav-link btn btn-link text-white"
                    onClick={() => dispatch(logout())}
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
