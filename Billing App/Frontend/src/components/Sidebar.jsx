import { NavLink } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { FaSignOutAlt } from 'react-icons/fa';
import { logout } from '../store/authSlice';

function Sidebar({ isOpen, onClose }) {
  const dispatch = useDispatch();

  return (
    <aside className={`sidebar d-flex flex-column bg-success text-white p-3 ${isOpen ? 'open' : ''}`}>
      <div className="mb-3 px-2">
        <div className="fw-semibold">Godbole Veggies & Fruits</div>
      </div>
      <nav className="nav nav-pills flex-column mb-auto sidebar-nav">
        <NavLink onClick={onClose} end to="/" className={({ isActive }) => `nav-link sidebar-link ${isActive ? 'active' : 'text-white-50'}`}>
          Dashboard
        </NavLink>
        <NavLink onClick={onClose} to="/pending-bills" className={({ isActive }) => `nav-link sidebar-link ${isActive ? 'active' : 'text-white-50'}`}>
          Pending Bills
        </NavLink>
        <NavLink onClick={onClose} to="/products" className={({ isActive }) => `nav-link sidebar-link ${isActive ? 'active' : 'text-white-50'}`}>
          Products
        </NavLink>
        <NavLink onClick={onClose} to="/new-bill" className={({ isActive }) => `nav-link sidebar-link ${isActive ? 'active' : 'text-white-50'}`}>
          New Bill
        </NavLink>
        <NavLink onClick={onClose} to="/history" className={({ isActive }) => `nav-link sidebar-link ${isActive ? 'active' : 'text-white-50'}`}>
          History
        </NavLink>
        <NavLink onClick={onClose} to="/reports" className={({ isActive }) => `nav-link sidebar-link ${isActive ? 'active' : 'text-white-50'}`}>
          Reports
        </NavLink>
      </nav>
      <div className="sidebar-footer mt-auto pt-3">
        <button
          className="btn btn-sm btn-outline-light w-100 d-flex align-items-center justify-content-center"
          onClick={() => { dispatch(logout()); onClose && onClose(); }}
        >
          <FaSignOutAlt className="me-2" /> Logout
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;


