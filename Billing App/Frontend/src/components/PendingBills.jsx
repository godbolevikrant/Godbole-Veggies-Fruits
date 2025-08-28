import { useState, useEffect } from "react";

function PendingBills() {
  const [bills, setBills] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [date, setDate] = useState("");
  const [outstanding, setOutstanding] = useState("");
  const [status, setStatus] = useState("pending");

  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';
  const API_KEY = import.meta.env.VITE_API_KEY || 'dev-secret-key';

  // Fetch pending bills
  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/pending-bills`, { headers: { 'X-API-KEY': API_KEY } });
      const data = await res.json();
      setBills(data);
    } catch (err) {
      console.error("Error fetching pending bills:", err);
    }
  };

  // Save new bill
  const handleSubmit = async (e) => {
    e.preventDefault();

    const newBill = {
      customerName,
      date,
      outstanding: parseFloat(outstanding) || 0,
      status,
    };

    try {
      const res = await fetch(`${API_BASE}/api/pending-bills`, {
        method: "POST",
        headers: { "Content-Type": "application/json", 'X-API-KEY': API_KEY },
        body: JSON.stringify(newBill),
      });

      if (res.ok) {
        const savedBill = await res.json();
        setBills([savedBill, ...bills]); // Add to list
        // Reset form
        setCustomerName("");
        setDate("");
        setOutstanding("");
        setStatus("pending");
      } else {
        console.error("Failed to save bill");
      }
    } catch (err) {
      console.error("Error saving bill:", err);
    }
  };

  // Delete bill
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this bill?")) return;

    try {
      const res = await fetch(`${API_BASE}/api/pending-bills/${id}`, {
        method: "DELETE",
        headers: { 'X-API-KEY': API_KEY },
      });

      if (res.ok) {
        setBills(bills.filter((bill) => bill._id !== id));
      } else {
        console.error("Failed to delete bill");
      }
    } catch (err) {
      console.error("Error deleting bill:", err);
    }
  };

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0 text-success">Pending Bills</h1>
        {bills?.length ? <span className="badge text-bg-light">{bills.length} items</span> : null}
      </div>

      {/* Add Bill Form */}
      <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
        <h5 className="mb-3">Add Pending Bill</h5>
        <form onSubmit={handleSubmit} className="row g-3">
          <div className="col-md-3">
            <input
              type="text"
              className="form-control"
              placeholder="Customer Name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
            />
          </div>
          <div className="col-md-3">
            <input
              type="date"
              className="form-control"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <div className="col-md-3">
            <input
              type="number"
              step="0.01"
              className="form-control"
              placeholder="Outstanding (₹)"
              value={outstanding}
              onChange={(e) => setOutstanding(e.target.value)}
              required
            />
          </div>
          <div className="col-md-2">
            <select
              className="form-select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
            </select>
          </div>
          <div className="col-md-1">
            <button type="submit" className="btn btn-success w-100">
              Save
            </button>
          </div>
        </form>
      </div>

      {/* Pending Bills List */}
      <div className="table-responsive">
        <table className="table table-hover align-middle">
          <thead className="table-light sticky-top">
            <tr>
              <th>Customer Name</th>
              <th>Date</th>
              <th>Outstanding (₹)</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {bills.length > 0 ? (
              bills.map((bill) => (
                <tr key={bill._id}>
                  <td>{bill.customerName}</td>
                  <td>{new Date(bill.date).toLocaleDateString()}</td>
                  <td>₹{bill.outstanding}</td>
                  <td>
                    {bill.status === "paid" ? (
                      <span className="badge bg-success">Paid</span>
                    ) : (
                      <span className="badge bg-danger">Pending</span>
                    )}
                  </td>
                  <td>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(bill._id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center">
                  No pending bills found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PendingBills;
