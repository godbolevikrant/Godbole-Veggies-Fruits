import { NavLink } from 'react-router-dom';
import { FaCarrot, FaFileInvoice, FaHistory } from 'react-icons/fa';

function Dashboard() {
  return (
    <div className="container py-5">
      <h1 className="text-center mb-5 text-success">Dashboard</h1>
      <div className="row g-4">
        <div className="col-md-4">
          <NavLink to="/new-bill" className="text-decoration-none">
            <div className="card text-center shadow h-100">
              <div className="card-body">
                <FaFileInvoice size={50} className="text-success mb-3" />
                <h5 className="card-title">New Bill</h5>
                <p className="card-text">Create a new bill for customers</p>
              </div>
            </div>
          </NavLink>
        </div>
        <div className="col-md-4">
          <NavLink to="/products" className="text-decoration-none">
            <div className="card text-center shadow h-100">
              <div className="card-body">
                <FaCarrot size={50} className="text-success mb-3" />
                <h5 className="card-title">Products</h5>
                <p className="card-text">Manage vegetables & fruits</p>
              </div>
            </div>
          </NavLink>
        </div>
        <div className="col-md-4">
          <NavLink to="/history" className="text-decoration-none">
            <div className="card text-center shadow h-100">
              <div className="card-body">
                <FaHistory size={50} className="text-success mb-3" />
                <h5 className="card-title">History</h5>
                <p className="card-text">View past bills</p>
              </div>
            </div>
          </NavLink>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;