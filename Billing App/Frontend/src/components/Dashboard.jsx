import { NavLink } from 'react-router-dom';
import { FaFileInvoice, FaCarrot, FaHistory, FaClipboardList, FaChartBar } from "react-icons/fa";

function Dashboard() {
  const Card = ({ to, icon, title, subtitle }) => (
    <div className="col">
      <NavLink to={to} className="text-decoration-none">
        <div className="card text-center shadow-sm h-100 border-0 rounded-4 hover-shadow">
          <div className="card-body py-4">
            {icon}
            <h5 className="card-title mt-2 text-dark">{title}</h5>
            <p className="card-text text-muted mb-0">{subtitle}</p>
          </div>
        </div>
      </NavLink>
    </div>
  );

  return (
    <div className="container py-5">
      <h1 className="text-center mb-4 text-success">Dashboard</h1>
      <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-4">
        <Card
          to="/new-bill"
          title="New Bill"
          subtitle="Create a new bill for customers"
          icon={<FaFileInvoice size={46} className="text-success mb-2" />}
        />
        <Card
          to="/products"
          title="Products"
          subtitle="Manage vegetables & fruits"
          icon={<FaCarrot size={46} className="text-success mb-2" />}
        />
        <Card
          to="/history"
          title="History"
          subtitle="View past bills"
          icon={<FaHistory size={46} className="text-success mb-2" />}
        />
        <Card
          to="/pending-bills"
          title="Pending Bills"
          subtitle="Check and manage outstanding bills"
          icon={<FaClipboardList size={46} className="text-success mb-2" />}
        />
        <Card
          to="/reports"
          title="Reports"
          subtitle="Analyze sales and billing reports"
          icon={<FaChartBar size={46} className="text-success mb-2" />}
        />
      </div>
    </div>
  );
}

export default Dashboard;